import { Observable } from '@nativescript/core';
import { ChallengeService } from '../../services/challenge-service';

export function createViewModel(challengeId) {
    const viewModel = new Observable();
    const challengeService = new ChallengeService();
    
    // Get challenge details
    const challenge = viewModel.challenge = challengeService.challenges.get(challengeId);
    
    // Initialize score tracking
    viewModel.score = {
        challenger: 0,
        challengee: 0
    };
    
    // Compute remaining games
    viewModel.get('remainingGames', () => ({
        challenger: challenge.race.challenger - viewModel.score.challenger,
        challengee: challenge.race.challengee - viewModel.score.challengee
    }));
    
    // Check if match is complete
    viewModel.get('isMatchComplete', () => {
        return viewModel.score.challenger >= challenge.race.challenger ||
               viewModel.score.challengee >= challenge.race.challengee;
    });
    
    // Get winner info
    viewModel.get('winner', () => {
        if (!viewModel.isMatchComplete) return null;
        
        const isChallenger = viewModel.score.challenger >= challenge.race.challenger;
        return {
            id: isChallenger ? challenge.challengerId : challenge.challengeeId,
            name: isChallenger ? challenge.challengerName : challenge.challengeeName,
            score: isChallenger ? viewModel.score.challenger : viewModel.score.challengee
        };
    });
    
    // Handle game wins
    viewModel.onChallengerWin = () => {
        if (viewModel.isMatchComplete) return;
        
        viewModel.set('score', {
            ...viewModel.score,
            challenger: viewModel.score.challenger + 1
        });
        viewModel.notify('remainingGames');
        viewModel.notify('isMatchComplete');
        viewModel.notify('winner');
    };
    
    viewModel.onChallengeeWin = () => {
        if (viewModel.isMatchComplete) return;
        
        viewModel.set('score', {
            ...viewModel.score,
            challengee: viewModel.score.challengee + 1
        });
        viewModel.notify('remainingGames');
        viewModel.notify('isMatchComplete');
        viewModel.notify('winner');
    };
    
    // Handle match completion
    viewModel.onFinishMatch = () => {
        if (!viewModel.isMatchComplete) {
            const confirm = require('@nativescript/core').confirm;
            confirm({
                title: 'End Match Early?',
                message: 'Are you sure you want to end the match before reaching the race target?',
                okButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then(result => {
                if (result) {
                    completeMatch();
                }
            });
        } else {
            completeMatch();
        }
    };
    
    function completeMatch() {
        challengeService.updateChallengeStatus(challengeId, 'completed', {
            winnerId: viewModel.winner.id,
            score: viewModel.score
        });
        
        const frame = require('@nativescript/core').Frame;
        frame.topmost().goBack();
    }
    
    // Handle undo last game
    viewModel.onUndoLastGame = () => {
        if (viewModel.score.challenger === 0 && viewModel.score.challengee === 0) return;
        
        // Find the last game and undo it
        const lastGameWinner = viewModel.lastGameWinner;
        if (lastGameWinner === 'challenger') {
            viewModel.set('score', {
                ...viewModel.score,
                challenger: viewModel.score.challenger - 1
            });
        } else if (lastGameWinner === 'challengee') {
            viewModel.set('score', {
                ...viewModel.score,
                challengee: viewModel.score.challengee - 1
            });
        }
        
        viewModel.notify('remainingGames');
        viewModel.notify('isMatchComplete');
        viewModel.notify('winner');
    };
    
    return viewModel;
}

export function onNavigatingTo(args) {
    const page = args.object;
    const challengeId = page.navigationContext.challengeId;
    page.bindingContext = createViewModel(challengeId);
}