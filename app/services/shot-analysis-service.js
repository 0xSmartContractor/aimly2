import OpenAI from 'openai';
import { PoseDetectionService } from './pose-detection-service';

export class ShotAnalysisService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.poseDetection = new PoseDetectionService();
    }

    async analyzeShotImage(imageBase64) {
        try {
            // First analyze pose
            const pose = await this.poseDetection.detectPose(imageBase64);
            
            // Then get GPT-4 Vision analysis
            const response = await this.openai.chat.completions.create({
                model: "gpt-4-vision-preview",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Analyze this pool shot image and provide feedback on: 1) Stance and alignment 2) Bridge hand position 3) Stroke mechanics 4) Follow-through. Focus on technical aspects and provide specific improvements."
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${imageBase64}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 500
            });

            return {
                feedback: response.choices[0].message.content,
                pose: pose,
                timestamp: new Date(),
                success: true
            };
        } catch (error) {
            console.error('Shot analysis error:', error);
            return {
                feedback: "Error analyzing shot. Please try again.",
                timestamp: new Date(),
                success: false,
                error: error.message
            };
        }
    }

    async analyzeStrokeTempo(frames) {
        const tempoAnalysis = {
            backswingDuration: 0,
            pauseDuration: 0,
            forwardStrokeDuration: 0,
            followThroughDuration: 0,
            consistency: 0
        };

        let currentPhase = 'setup';
        let phaseStartTime = frames[0].timestamp;

        for (let i = 1; i < frames.length; i++) {
            const prevFrame = frames[i - 1];
            const currentFrame = frames[i];
            
            const movement = this.calculateMovement(prevFrame.pose, currentFrame.pose);
            const newPhase = this.determinePhase(movement, currentPhase);
            
            if (newPhase !== currentPhase) {
                const duration = currentFrame.timestamp - phaseStartTime;
                
                switch (currentPhase) {
                    case 'backswing':
                        tempoAnalysis.backswingDuration = duration;
                        break;
                    case 'pause':
                        tempoAnalysis.pauseDuration = duration;
                        break;
                    case 'forward':
                        tempoAnalysis.forwardStrokeDuration = duration;
                        break;
                    case 'followthrough':
                        tempoAnalysis.followThroughDuration = duration;
                        break;
                }
                
                currentPhase = newPhase;
                phaseStartTime = currentFrame.timestamp;
            }
        }

        // Calculate consistency score based on ideal ratios
        tempoAnalysis.consistency = this.calculateConsistencyScore(tempoAnalysis);

        return tempoAnalysis;
    }

    calculateMovement(prevPose, currentPose) {
        // Calculate movement between poses focusing on cue arm
        const prevCueArm = this.getCueArmPosition(prevPose);
        const currentCueArm = this.getCueArmPosition(currentPose);
        
        return Math.sqrt(
            Math.pow(currentCueArm.x - prevCueArm.x, 2) +
            Math.pow(currentCueArm.y - prevCueArm.y, 2)
        );
    }

    getCueArmPosition(pose) {
        // Get cue arm position (assuming right-handed player)
        const wrist = pose.keypoints.find(kp => kp.name === 'right_wrist');
        return {
            x: wrist.x,
            y: wrist.y
        };
    }

    determinePhase(movement, currentPhase) {
        const MOVEMENT_THRESHOLD = 0.05;
        
        switch (currentPhase) {
            case 'setup':
                return movement > MOVEMENT_THRESHOLD ? 'backswing' : 'setup';
            case 'backswing':
                return movement < MOVEMENT_THRESHOLD ? 'pause' : 'backswing';
            case 'pause':
                return movement > MOVEMENT_THRESHOLD ? 'forward' : 'pause';
            case 'forward':
                return movement < MOVEMENT_THRESHOLD ? 'followthrough' : 'forward';
            default:
                return currentPhase;
        }
    }

    calculateConsistencyScore(tempoData) {
        // Ideal ratios based on professional players
        const idealRatios = {
            backswingToForward: 2.0, // Backswing should be twice as slow as forward stroke
            pauseToTotal: 0.2, // Pause should be 20% of total stroke time
            followThroughToForward: 1.5 // Follow through should be 1.5x forward stroke
        };

        const totalTime = Object.values(tempoData).reduce((sum, val) => sum + val, 0);
        
        const actualRatios = {
            backswingToForward: tempoData.backswingDuration / tempoData.forwardStrokeDuration,
            pauseToTotal: tempoData.pauseDuration / totalTime,
            followThroughToForward: tempoData.followThroughDuration / tempoData.forwardStrokeDuration
        };

        // Calculate deviation from ideal ratios
        const deviations = Object.keys(idealRatios).map(key => 
            Math.abs(idealRatios[key] - actualRatios[key]) / idealRatios[key]
        );

        // Convert deviations to a 0-100 score
        const avgDeviation = deviations.reduce((sum, val) => sum + val, 0) / deviations.length;
        return Math.max(0, Math.min(100, 100 * (1 - avgDeviation)));
    }
}