import { Observable } from '@nativescript/core';
import { TournamentService } from '../../services/tournament-service';
import { useUser } from '@clerk/clerk-expo';

export function createViewModel() {
    const viewModel = new Observable();
    const tournamentService = new TournamentService();
    const { user } = useUser();

    // Initialize properties
    viewModel.selectedTabIndex = 0;
    viewModel.pendingTournaments = [];
    viewModel.activeTournaments = [];
    viewModel.completedTournaments = [];

    function loadTournaments() {
        viewModel.set('pendingTournaments', tournamentService.getPendingTournaments());
        viewModel.set('activeTournaments', tournamentService.getActiveTournaments());
        viewModel.set('completedTournaments', tournamentService.getCompletedTournaments());
    }

    viewModel.onCreateTournament = () => {
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate({
            moduleName: 'views/tournaments/create-tournament',
            context: { userId: user.id }
        });
    };

    viewModel.onTournamentTap = (args) => {
        const tournaments = viewModel.get(
            viewModel.selectedTabIndex === 0 ? 'pendingTournaments' :
            viewModel.selectedTabIndex === 1 ? 'activeTournaments' :
            'completedTournaments'
        );
        
        const tournament = tournaments[args.index];
        
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate({
            moduleName: 'views/tournaments/tournament-details',
            context: { tournamentId: tournament.id }
        });
    };

    // Load initial data
    loadTournaments();

    return viewModel;
}

export function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = createViewModel();
}