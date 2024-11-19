import { Observable } from '@nativescript/core';
import { Camera } from '@nativescript/camera';
import { ShotAnalysisService } from '../../services/shot-analysis-service';
import { PoseDetectionService } from '../../services/pose-detection-service';
import { VideoProcessingService } from '../../services/video-processing-service';
import { WireframeOverlay } from './wireframe-overlay';
import { PlaybackControlsViewModel } from './playback-controls';
import { TempoVisualizationViewModel } from './tempo-visualization';
import { useUser } from '@clerk/clerk-expo';

export function createViewModel() {
    const viewModel = new Observable();
    const shotAnalysisService = new ShotAnalysisService();
    const poseDetectionService = new PoseDetectionService();
    const videoProcessingService = new VideoProcessingService();
    const wireframeOverlay = new WireframeOverlay();
    const playbackControls = new PlaybackControlsViewModel(videoProcessingService);
    const tempoVisualization = new TempoVisualizationViewModel();
    const { user } = useUser();

    // Initialize properties
    viewModel.isRecording = false;
    viewModel.isAnalyzing = false;
    viewModel.wireframeVisible = true;
    viewModel.speedOptions = [
        { title: '0.25x' },
        { title: '0.5x' },
        { title: '1x' }
    ];
    viewModel.selectedSpeedIndex = 2;

    // Bind sub-viewmodels
    viewModel.playbackControls = playbackControls;
    viewModel.tempoVisualization = tempoVisualization;
    viewModel.wireframeOverlay = wireframeOverlay;

    // Initialize pose detection
    poseDetectionService.initialize();

    viewModel.onCaptureVideoTap = async () => {
        try {
            viewModel.set('isRecording', true);
            videoProcessingService.startRecording();

            const camera = await Camera.requestPermissions()
                .then(() => Camera.createPreview());

            camera.on('frameAvailable', async (args) => {
                const frame = args.frame;
                const pose = await poseDetectionService.detectPose(frame);
                
                if (pose) {
                    wireframeOverlay.updatePose(pose);
                    videoProcessingService.addFrame(frame, Date.now());
                }
            });

            // Stop recording after 5 seconds
            setTimeout(() => {
                camera.stop();
                viewModel.set('isRecording', false);
                const recording = videoProcessingService.stopRecording();
                analyzeRecording(recording);
            }, 5000);

        } catch (error) {
            console.error('Video capture error:', error);
            alert('Error capturing video. Please try again.');
            viewModel.set('isRecording', false);
        }
    };

    viewModel.onPlayPauseTap = () => {
        if (playbackControls.isPlaying) {
            playbackControls.pause();
        } else {
            playbackControls.play();
        }
    };

    viewModel.onSpeedChange = (args) => {
        const speeds = [0.25, 0.5, 1.0];
        playbackControls.setSpeed(speeds[args.newIndex]);
    };

    viewModel.onToggleWireframe = () => {
        viewModel.set('wireframeVisible', !viewModel.wireframeVisible);
    };

    async function analyzeRecording(recording) {
        viewModel.set('isAnalyzing', true);

        // Analyze poses from all frames
        const poses = [];
        for (const frame of recording.frames) {
            const pose = await poseDetectionService.detectPose(frame.frame);
            if (pose) {
                poses.push({ ...pose, timestamp: frame.timestamp });
            }
        }

        // Analyze tempo
        const tempoData = poseDetectionService.analyzeTempo(poses);
        tempoVisualization.updateTempoData(tempoData);

        // Set up playback
        playbackControls.totalFrames = recording.frames.length;
        
        viewModel.set('isAnalyzing', false);
    }

    return viewModel;
}

export function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = createViewModel();
}