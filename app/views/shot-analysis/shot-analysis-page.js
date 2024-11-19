import { Observable } from '@nativescript/core';
import { ShotAnalysisService } from '../../services/shot-analysis-service';
import { VideoProcessingService } from '../../services/video-processing-service';
import { Camera } from '@nativescript/camera';
import { useUser } from '@clerk/clerk-expo';

export function createViewModel() {
    const viewModel = new Observable();
    const shotAnalysisService = new ShotAnalysisService();
    const videoProcessingService = new VideoProcessingService();
    const { user } = useUser();

    // Initialize properties
    viewModel.isRecording = false;
    viewModel.isAnalyzing = false;
    viewModel.currentSpeed = 1.0;
    viewModel.showWireframe = true;
    viewModel.recordedFrames = [];
    viewModel.analysis = null;

    // Camera setup
    viewModel.onStartRecording = async () => {
        try {
            const camera = await Camera.requestPermissions()
                .then(() => Camera.createPreview());

            viewModel.set('isRecording', true);
            videoProcessingService.startRecording();

            // Start frame capture
            camera.on('frameAvailable', async (args) => {
                if (!viewModel.isRecording) return;

                const frame = args.frame;
                const analysis = await shotAnalysisService.analyzeShotImage(frame);
                
                videoProcessingService.addFrame({
                    frame,
                    analysis,
                    timestamp: Date.now()
                });
            });

            // Stop after 5 seconds
            setTimeout(() => {
                camera.stop();
                viewModel.set('isRecording', false);
                const recording = videoProcessingService.stopRecording();
                analyzeRecording(recording);
            }, 5000);

        } catch (error) {
            console.error('Recording error:', error);
            viewModel.set('isRecording', false);
            alert('Error recording shot. Please try again.');
        }
    };

    async function analyzeRecording(recording) {
        viewModel.set('isAnalyzing', true);

        try {
            // Analyze tempo
            const tempoAnalysis = await shotAnalysisService.analyzeStrokeTempo(recording.frames);
            
            viewModel.set('analysis', {
                tempo: tempoAnalysis,
                frames: recording.frames,
                duration: recording.duration
            });

            // Set initial playback frame
            viewModel.set('currentFrame', 0);
            viewModel.set('totalFrames', recording.frames.length);

        } catch (error) {
            console.error('Analysis error:', error);
            alert('Error analyzing shot. Please try again.');
        } finally {
            viewModel.set('isAnalyzing', false);
        }
    }

    // Playback controls
    viewModel.onPlayPause = () => {
        const isPlaying = !viewModel.get('isPlaying');
        viewModel.set('isPlaying', isPlaying);
        
        if (isPlaying) {
            playFrames();
        }
    };

    viewModel.onSpeedChange = (speed) => {
        viewModel.set('currentSpeed', speed);
    };

    viewModel.onToggleWireframe = () => {
        viewModel.set('showWireframe', !viewModel.showWireframe);
    };

    async function playFrames() {
        const frames = viewModel.analysis.frames;
        const speed = viewModel.currentSpeed;
        
        while (viewModel.isPlaying && viewModel.currentFrame < frames.length - 1) {
            const frameDelay = (1000 / 60) * (1 / speed); // 60fps adjusted by speed
            await new Promise(resolve => setTimeout(resolve, frameDelay));
            
            viewModel.set('currentFrame', viewModel.currentFrame + 1);
        }

        if (viewModel.currentFrame >= frames.length - 1) {
            viewModel.set('isPlaying', false);
        }
    }

    return viewModel;
}

export function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = createViewModel();
}