import { Observable } from '@nativescript/core';
import { ChallengeService } from '../../services/challenge-service';
import { useUser } from '@clerk/clerk-expo';

export function createViewModel() {
    const viewModel = new Observable();
    const challengeService = new ChallengeService();
    const { user } = useUser();
    
    // Initialize properties
    viewModel.selectedTabIndex = 0;
    viewModel.pendingChallenges = [];
    viewModel.activeChallenges = [];
    viewModel.completedChallenges = [];
    
    function loadChallenges() {
        const challenges = challengeService.getChallenges(user.id);
        
        viewModel.set('pendingChallenges', challenges.filter(c => c.status === 'pending')
            .map(c => ({
                ...c,
                formattedDate: challengeService.formatChallengeDate(c.createdAt)
            })));
            
        viewModel.set('activeChallenges', challenges.filter(c => c.status === 'accepted')
            .map(c => ({
                ...c,
                formattedDate: challengeService.formatChallengeDate(c.scheduledFor || c.createdAt)
            })));
            
        viewModel.set('completedChallenges', challenges.filter(c => c.status === 'completed')
            .map(c => ({
                ...c,
                formattedDate: challengeService.formatChallengeDate(c.createdAt)
            })));
    }
    
    // Challenge actions
    viewModel.onNewChallenge = () => {
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate({
            moduleName: 'views/challenges/new-challenge',
            context: { userId: user.id }
        });
    };
    
    viewModel.onChallengeTap = (args) => {
        const challenge = viewModel.get(
            `${viewModel.selectedTabIndex === 0 ? 'pending' : 
              viewModel.selectedTabIndex === 1 ? 'active' : 'completed'}Challenges`
        )[args.index];
        
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate({
            moduleName: 'views/challenges/challenge-details',
            context: { challengeId: challenge.id }
        });
    };
    
    viewModel.onAccept = (args) => {
        const challenge = args.object.bindingContext;
        challengeService.updateChallengeStatus(challenge.id, 'accepted');
        loadChallenges();
    };
    
    viewModel.onDecline = (args) => {
        const challenge = args.object.bindingContext;
        challengeService.updateChallengeStatus(challenge.id, 'declined');
        loadChallenges();
    };
    
    viewModel.onRecord = (args) => {
        const challenge = args.object.bindingContext;
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate({
            moduleName: 'views/challenges/record-result',
            context: { challengeId: challenge.id }
        });
    };
    
    // Load initial data
    loadChallenges();
    
    return viewModel;
}

export function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = createViewModel();
}