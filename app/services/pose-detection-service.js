import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export class PoseDetectionService {
    constructor() {
        this.detector = null;
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            await tf.ready();
            await tf.setBackend('webgl');
            
            this.detector = await poseDetection.createDetector(
                poseDetection.SupportedModels.MoveNet,
                {
                    modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
                    enableSmoothing: true,
                    minPoseScore: 0.25
                }
            );
            
            this.initialized = true;
        }
    }

    async detectPose(imageData) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const poses = await this.detector.estimatePoses(imageData, {
                maxPoses: 1,
                flipHorizontal: false
            });

            return poses[0] || null;
        } catch (error) {
            console.error('Pose detection error:', error);
            return null;
        }
    }

    analyzeTempo(poses) {
        const phases = this.detectStrokePhases(poses);
        const metrics = this.calculateTempoMetrics(phases);
        const feedback = this.generateTempoFeedback(metrics);

        return {
            phases,
            metrics,
            feedback
        };
    }

    detectStrokePhases(poses) {
        const phases = [];
        let currentPhase = 'setup';
        let phaseStartIndex = 0;

        for (let i = 1; i < poses.length; i++) {
            const prevPose = poses[i - 1];
            const currentPose = poses[i];
            
            const movement = this.calculateCueMovement(prevPose, currentPose);
            const newPhase = this.determinePhase(movement, currentPhase);
            
            if (newPhase !== currentPhase) {
                phases.push({
                    phase: currentPhase,
                    startIndex: phaseStartIndex,
                    endIndex: i - 1,
                    duration: poses[i - 1].timestamp - poses[phaseStartIndex].timestamp
                });
                
                currentPhase = newPhase;
                phaseStartIndex = i;
            }
        }

        // Add final phase
        phases.push({
            phase: currentPhase,
            startIndex: phaseStartIndex,
            endIndex: poses.length - 1,
            duration: poses[poses.length - 1].timestamp - poses[phaseStartIndex].timestamp
        });

        return phases;
    }

    calculateCueMovement(prevPose, currentPose) {
        const prevCue = this.getCuePosition(prevPose);
        const currentCue = this.getCuePosition(currentPose);
        
        return {
            x: currentCue.x - prevCue.x,
            y: currentCue.y - prevCue.y,
            magnitude: Math.sqrt(
                Math.pow(currentCue.x - prevCue.x, 2) +
                Math.pow(currentCue.y - prevCue.y, 2)
            )
        };
    }

    getCuePosition(pose) {
        const wrist = pose.keypoints.find(kp => kp.name === 'right_wrist');
        const elbow = pose.keypoints.find(kp => kp.name === 'right_elbow');
        
        // Estimate cue tip position by extending from elbow through wrist
        const dx = wrist.x - elbow.x;
        const dy = wrist.y - elbow.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        return {
            x: wrist.x + (dx / length) * 20, // Extend 20 pixels beyond wrist
            y: wrist.y + (dy / length) * 20
        };
    }

    determinePhase(movement, currentPhase) {
        const MOVEMENT_THRESHOLD = 3; // pixels
        const DIRECTION_THRESHOLD = 0.7; // cos(angle) for direction change

        switch (currentPhase) {
            case 'setup':
                return movement.magnitude > MOVEMENT_THRESHOLD ? 'backswing' : 'setup';
                
            case 'backswing':
                if (movement.magnitude < MOVEMENT_THRESHOLD) {
                    return 'pause';
                }
                return 'backswing';
                
            case 'pause':
                if (movement.magnitude > MOVEMENT_THRESHOLD) {
                    const isForward = movement.x > 0;
                    return isForward ? 'forward_stroke' : 'backswing';
                }
                return 'pause';
                
            case 'forward_stroke':
                if (movement.magnitude < MOVEMENT_THRESHOLD) {
                    return 'follow_through';
                }
                return 'forward_stroke';
                
            case 'follow_through':
                return movement.magnitude < MOVEMENT_THRESHOLD ? 'complete' : 'follow_through';
                
            default:
                return currentPhase;
        }
    }

    calculateTempoMetrics(phases) {
        const metrics = {
            backswingDuration: 0,
            pauseDuration: 0,
            forwardStrokeDuration: 0,
            followThroughDuration: 0,
            backswingToForwardRatio: 0,
            pausePercentage: 0,
            totalDuration: 0,
            consistency: 0
        };

        // Calculate durations
        phases.forEach(phase => {
            switch (phase.phase) {
                case 'backswing':
                    metrics.backswingDuration = phase.duration;
                    break;
                case 'pause':
                    metrics.pauseDuration = phase.duration;
                    break;
                case 'forward_stroke':
                    metrics.forwardStrokeDuration = phase.duration;
                    break;
                case 'follow_through':
                    metrics.followThroughDuration = phase.duration;
                    break;
            }
        });

        // Calculate ratios and percentages
        metrics.totalDuration = Object.values(metrics)
            .filter(v => typeof v === 'number')
            .reduce((sum, v) => sum + v, 0);
            
        metrics.backswingToForwardRatio = 
            metrics.backswingDuration / metrics.forwardStrokeDuration;
            
        metrics.pausePercentage = 
            (metrics.pauseDuration / metrics.totalDuration) * 100;

        // Calculate consistency score
        metrics.consistency = this.calculateConsistencyScore(metrics);

        return metrics;
    }

    calculateConsistencyScore(metrics) {
        // Ideal ratios based on professional players
        const idealRatios = {
            backswingToForward: 2.0,
            pausePercentage: 20,
            followThroughToForward: 1.5
        };

        const deviations = [
            Math.abs(metrics.backswingToForwardRatio - idealRatios.backswingToForward) / idealRatios.backswingToForward,
            Math.abs(metrics.pausePercentage - idealRatios.pausePercentage) / idealRatios.pausePercentage,
            Math.abs((metrics.followThroughDuration / metrics.forwardStrokeDuration) - idealRatios.followThroughToForward) / idealRatios.followThroughToForward
        ];

        const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
        return Math.max(0, Math.min(100, 100 * (1 - avgDeviation)));
    }

    generateTempoFeedback(metrics) {
        const feedback = [];

        // Backswing feedback
        if (metrics.backswingToForwardRatio < 1.5) {
            feedback.push("Your backswing is too quick. Try to slow it down for better control.");
        } else if (metrics.backswingToForwardRatio > 2.5) {
            feedback.push("Your backswing is too slow. A smoother, more fluid motion will improve accuracy.");
        }

        // Pause feedback
        if (metrics.pausePercentage < 15) {
            feedback.push("You're rushing through the pause. A longer pause will improve accuracy.");
        } else if (metrics.pausePercentage > 25) {
            feedback.push("Your pause is too long. Try to maintain momentum through the stroke.");
        }

        // Follow-through feedback
        const followThroughRatio = metrics.followThroughDuration / metrics.forwardStrokeDuration;
        if (followThroughRatio < 1.2) {
            feedback.push("Extend your follow-through for better accuracy and consistency.");
        }

        // Overall consistency feedback
        if (metrics.consistency < 70) {
            feedback.push(`Your tempo consistency is ${metrics.consistency.toFixed(0)}%. Focus on maintaining consistent timing between phases.`);
        }

        return feedback.join(' ');
    }
}