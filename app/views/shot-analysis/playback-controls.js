import { Observable } from '@nativescript/core';

export class PlaybackControlsViewModel extends Observable {
    constructor(videoService) {
        super();
        this.videoService = videoService;
        this.currentSpeed = 1;
        this.isPlaying = false;
        this.currentFrame = 0;
        this.totalFrames = 0;
        this.playbackInterval = null;
    }

    play() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.notifyPropertyChange('isPlaying', true);
        
        const frameDelay = (1000 / 60) * (1 / this.currentSpeed);
        
        this.playbackInterval = setInterval(() => {
            if (this.currentFrame >= this.totalFrames - 1) {
                this.pause();
                return;
            }
            
            this.currentFrame++;
            this.notifyPropertyChange('currentFrame', this.currentFrame);
        }, frameDelay);
    }

    pause() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        this.notifyPropertyChange('isPlaying', false);
        
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = null;
        }
    }

    setSpeed(speed) {
        this.currentSpeed = speed;
        this.notifyPropertyChange('currentSpeed', speed);
        
        if (this.isPlaying) {
            this.pause();
            this.play();
        }
    }

    seekTo(frameIndex) {
        this.currentFrame = Math.min(Math.max(0, frameIndex), this.totalFrames - 1);
        this.notifyPropertyChange('currentFrame', this.currentFrame);
    }

    reset() {
        this.pause();
        this.currentFrame = 0;
        this.notifyPropertyChange('currentFrame', 0);
    }
}