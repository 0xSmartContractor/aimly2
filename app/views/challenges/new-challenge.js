import { Observable } from '@nativescript/core';
import { ChallengeService } from '../../services/challenge-service';
import { useUser } from '@clerk/clerk-expo';

export function createViewModel() {
    const viewModel = new Observable();
    const challengeService = new ChallengeService();
    const { user } = useUser();
    
    // Initialize properties
    viewModel.searchQuery = '';
    viewModel.filteredPlayers = [];
    viewModel.selectedPlayer = null;
    viewModel.gameTypes = ['8 Ball', '9 Ball', 'Straight Pool'];
    viewModel.selectedGameTypeIndex = 0;
    viewModel.matchTypes = ['Singles', 'Doubles', 'Team'];
    viewModel.selectedMatchTypeIndex = 0;
    viewModel.raceTypes = [
        { title: 'Standard' },
        { title: 'Handicap' }
    ];
    viewModel.selectedRaceTypeIndex = 0;
    viewModel.race = {
        standard: 5,
        challenger: 5,
        challengee: 5
    };
    viewModel.scheduledDate = new Date();
    viewModel.scheduledTime = new Date();
    viewModel.notes = '';
    
    // Computed property for handicap visibility
    viewModel.get('isHandicapVisible', () => viewModel.selectedRaceTypeIndex === 1);
    
    // Watch for race type changes
    viewModel.on(Observable.propertyChangeEvent, (propertyChangeData) => {
        if (propertyChangeData.propertyName === 'selectedRaceTypeIndex') {
            viewModel.notify('isHandicapVisible');
        }
    });
    
    // Search and player selection
    viewModel.onSearchTextChanged = (args) => {
        const searchBar = args.object;
        viewModel.searchQuery = searchBar.text;
        filterPlayers();
    };
    
    function filterPlayers() {
        // In a real app, this would query your backend
        // For now, we'll use mock data
        const mockPlayers = [
            { 
                id: '2', 
                displayName: 'Jane Smith', 
                photoUrl: 'https://example.com/photo2.jpg',
                skillLevels: { apa: 6, bca: 5, tap: 4 }
            },
            { 
                id: '3', 
                displayName: 'Bob Johnson', 
                photoUrl: 'https://example.com/photo3.jpg',
                skillLevels: { apa: 4, bca: 3, tap: 3 }
            }
        ];
        
        const query = viewModel.searchQuery.toLowerCase();
        viewModel.set('filteredPlayers', mockPlayers.filter(player =>
            player.displayName.toLowerCase().includes(query)
        ).map(player => ({
            ...player,
            selected: viewModel.selectedPlayer?.id === player.id
        })));
    }
    
    viewModel.onPlayerSelect = (args) => {
        const player = viewModel.filteredPlayers[args.index];
        viewModel.selectedPlayer = player;
        
        // Auto-suggest handicap based on skill levels
        if (viewModel.selectedRaceTypeIndex === 1) {
            const challengerSkill = user.skillLevels?.apa || 5;
            const challengeeSkill = player.skillLevels.apa;
            
            // Simple handicap calculation (can be made more sophisticated)
            viewModel.set('race', {
                ...viewModel.race,
                challenger: Math.max(challengerSkill, challengeeSkill),
                challengee: Math.min(challengerSkill, challengeeSkill)
            });
        }
        
        filterPlayers(); // Refresh list to show selection
    };
    
    // Challenge creation
    viewModel.onSendChallenge = () => {
        if (!viewModel.selectedPlayer) {
            alert('Please select an opponent');
            return;
        }
        
        const scheduledFor = new Date(viewModel.scheduledDate);
        scheduledFor.setHours(viewModel.scheduledTime.getHours());
        scheduledFor.setMinutes(viewModel.scheduledTime.getMinutes());
        
        const isHandicap = viewModel.selectedRaceTypeIndex === 1;
        const race = {
            challenger: isHandicap ? viewModel.race.challenger : viewModel.race.standard,
            challengee: isHandicap ? viewModel.race.challengee : viewModel.race.standard
        };
        
        const challenge = challengeService.createChallenge({
            challengerId: user.id,
            challengerName: user.fullName,
            challengerPhoto: user.imageUrl,
            challengeeId: viewModel.selectedPlayer.id,
            challengeeName: viewModel.selectedPlayer.displayName,
            challengeePhoto: viewModel.selectedPlayer.photoUrl,
            type: viewModel.matchTypes[viewModel.selectedMatchTypeIndex].toLowerCase(),
            gameType: viewModel.gameTypes[viewModel.selectedGameTypeIndex].toLowerCase().replace(' ', ''),
            raceType: isHandicap ? 'handicap' : 'standard',
            race,
            scheduledFor,
            notes: viewModel.notes
        });
        
        const frame = require('@nativescript/core').Frame;
        frame.topmost().goBack();
    };
    
    // Load initial data
    filterPlayers();
    
    return viewModel;
}

export function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = createViewModel();
}