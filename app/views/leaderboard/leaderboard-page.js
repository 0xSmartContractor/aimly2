import { Observable } from '@nativescript/core';
import { LeaderboardEntry } from '../../models/leaderboard';
import { FilterService } from '../../services/filter-service';

export function createViewModel() {
    const viewModel = new Observable();
    
    // Initialize properties
    viewModel.players = [];
    viewModel.searchQuery = '';
    viewModel.filterService = new FilterService();
    
    // Mock data - Replace with API call
    const mockPlayers = [
        new LeaderboardEntry({
            userId: '1',
            displayName: 'John Doe',
            photoUrl: 'https://example.com/photo1.jpg',
            skillLevels: { apa: 7, bca: 6, tap: 5 },
            stats: { wins: 30, losses: 10 }
        }),
        // Add more mock players...
    ];
    
    viewModel.originalPlayers = mockPlayers;
    viewModel.players = mockPlayers;
    
    // Search functionality
    viewModel.onSearchTextChanged = (args) => {
        const searchBar = args.object;
        viewModel.searchQuery = searchBar.text;
        applyFilters();
    };
    
    viewModel.onSearch = (args) => {
        const searchBar = args.object;
        viewModel.searchQuery = searchBar.text;
        applyFilters();
    };
    
    viewModel.onClearSearch = () => {
        viewModel.searchQuery = '';
        applyFilters();
    };
    
    // Filter functionality
    viewModel.showFilters = () => {
        const filterPage = 'views/leaderboard/filter-page';
        const frame = require('@nativescript/core').Frame;
        
        frame.topmost().navigate({
            moduleName: filterPage,
            context: {
                filters: viewModel.filterService.getCurrentFilters(),
                onApplyFilters: (newFilters) => {
                    viewModel.filterService.setFilters(newFilters);
                    applyFilters();
                }
            }
        });
    };
    
    // Player tap handler
    viewModel.onPlayerTap = (args) => {
        const player = viewModel.players[args.index];
        const frame = require('@nativescript/core').Frame;
        
        frame.topmost().navigate({
            moduleName: 'views/profile/profile-page',
            context: { userId: player.userId }
        });
    };
    
    // Apply filters helper
    function applyFilters() {
        let filteredPlayers = [...viewModel.originalPlayers];
        
        // Apply search filter
        if (viewModel.searchQuery) {
            const query = viewModel.searchQuery.toLowerCase();
            filteredPlayers = filteredPlayers.filter(player => 
                player.displayName.toLowerCase().includes(query)
            );
        }
        
        // Apply skill level and stats filters
        filteredPlayers = viewModel.filterService.applyFilters(filteredPlayers);
        
        // Sort players based on current sort criteria
        filteredPlayers.sort((a, b) => {
            const sortBy = viewModel.filterService.getCurrentSort();
            switch (sortBy) {
                case 'winRate':
                    return b.stats.winRate - a.stats.winRate;
                case 'wins':
                    return b.stats.wins - a.stats.wins;
                case 'skillAPA':
                    return b.skillLevels.apa - a.skillLevels.apa;
                default:
                    return b.stats.winRate - a.stats.winRate;
            }
        });
        
        // Add rank property
        filteredPlayers.forEach((player, index) => {
            player.rank = index + 1;
        });
        
        viewModel.set('players', filteredPlayers);
    }
    
    return viewModel;
}

export function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = createViewModel();
}