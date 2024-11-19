import { Observable } from '@nativescript/core';

export class WireframeOverlay extends Observable {
    constructor() {
        super();
        this.keypoints = [];
        this.connections = [
            // Body
            ['left_shoulder', 'right_shoulder'],
            ['left_shoulder', 'left_hip'],
            ['right_shoulder', 'right_hip'],
            ['left_hip', 'right_hip'],
            
            // Arms
            ['left_shoulder', 'left_elbow'],
            ['left_elbow', 'left_wrist'],
            ['right_shoulder', 'right_elbow'],
            ['right_elbow', 'right_wrist'],
            
            // Legs
            ['left_hip', 'left_knee'],
            ['left_knee', 'left_ankle'],
            ['right_hip', 'right_knee'],
            ['right_knee', 'right_ankle']
        ];
        
        // Colors for different body parts
        this.colors = {
            body: '#4CAF50',
            arms: '#2196F3',
            legs: '#FFC107',
            keypoints: '#FF5722'
        };
    }

    updatePose(pose) {
        if (!pose || !pose.keypoints) return;

        this.keypoints = pose.keypoints;
        this.notifyPropertyChange('wireframeData', this.getWireframeData());
    }

    getWireframeData() {
        const paths = [];
        
        // Draw connections
        this.connections.forEach(([start, end]) => {
            const startPoint = this.keypoints.find(kp => kp.name === start);
            const endPoint = this.keypoints.find(kp => kp.name === end);
            
            if (startPoint && endPoint && 
                startPoint.score > 0.3 && endPoint.score > 0.3) {
                
                let color = this.colors.body;
                if (start.includes('arm') || end.includes('arm') ||
                    start.includes('wrist') || end.includes('wrist') ||
                    start.includes('elbow') || end.includes('elbow')) {
                    color = this.colors.arms;
                } else if (start.includes('leg') || end.includes('leg') ||
                         start.includes('knee') || end.includes('knee') ||
                         start.includes('ankle') || end.includes('ankle')) {
                    color = this.colors.legs;
                }
                
                paths.push({
                    type: 'line',
                    start: { x: startPoint.x, y: startPoint.y },
                    end: { x: endPoint.x, y: endPoint.y },
                    color: color,
                    width: 2
                });
            }
        });

        // Draw keypoints
        this.keypoints.forEach(keypoint => {
            if (keypoint.score > 0.3) {
                paths.push({
                    type: 'circle',
                    center: { x: keypoint.x, y: keypoint.y },
                    radius: 3,
                    color: this.colors.keypoints
                });
            }
        });

        // Draw cue line
        const rightWrist = this.keypoints.find(kp => kp.name === 'right_wrist');
        const rightElbow = this.keypoints.find(kp => kp.name === 'right_elbow');
        
        if (rightWrist && rightElbow && 
            rightWrist.score > 0.3 && rightElbow.score > 0.3) {
            
            // Calculate cue direction
            const dx = rightWrist.x - rightElbow.x;
            const dy = rightWrist.y - rightElbow.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            // Extend line beyond wrist to represent cue
            const cueLength = length * 1.5;
            const cueEnd = {
                x: rightWrist.x + (dx / length) * cueLength,
                y: rightWrist.y + (dy / length) * cueLength
            };
            
            paths.push({
                type: 'line',
                start: { x: rightWrist.x, y: rightWrist.y },
                end: cueEnd,
                color: '#FF0000',
                width: 3
            });
        }

        return paths;
    }
}