import { Observable } from '@nativescript/core';

export class TempoVisualizationViewModel extends Observable {
    constructor() {
        super();
        this.phases = [];
        this.currentPhase = '';
        this.phaseColors = {
            setup: '#9E9E9E',
            backswing: '#4CAF50',
            pause: '#2196F3',
            forward_stroke: '#FFC107',
            follow_through: '#9C27B0',
            complete: '#4CAF50'
        };
    }

    updateTempoData(tempoData) {
        const totalDuration = tempoData.metrics.totalDuration;
        
        this.phases = tempoData.phases.map(phase => ({
            name: this.formatPhaseName(phase.phase),
            duration: phase.duration,
            percentage: (phase.duration / totalDuration) * 100,
            color: this.phaseColors[phase.phase] || '#9E9E9E',
            timing: this.formatTiming(phase.duration)
        }));

        this.notifyPropertyChange('phases', this.phases);
        
        // Update metrics display
        this.set('metrics', {
            consistency: tempoData.metrics.consistency.toFixed(0) + '%',
            backswingRatio: tempoData.metrics.backswingToForwardRatio.toFixed(2) + ':1',
            pausePercentage: tempoData.metrics.pausePercentage.toFixed(1) + '%'
        });
    }

    formatPhaseName(phase) {
        return phase.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    formatTiming(duration) {
        return (duration / 1000).toFixed(2) + 's';
    }

    setCurrentPhase(phaseName) {
        this.currentPhase = phaseName;
        this.notifyPropertyChange('currentPhase', phaseName);
    }
}