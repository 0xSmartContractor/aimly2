import { Observable } from '@nativescript/core';

export function createViewModel(navigationContext) {
    const viewModel = new Observable();
    
    // Initialize properties
    viewModel.filters = navigationContext.filters;
    viewModel.onApplyFilters = navigationContext.onApplyFilters;
    
    viewModel.sortOptions = [
        'Win Rate',
        'Total Wins',
        'APA Skill Level'
    ];
    
    viewModel.selectedSortIndex = getSortOptionIndex(viewModel.filters.sortBy);
    
    // Handle apply button tap
    viewModel.onApplyTap = () => {
        const sortBy = getSortValue(viewModel.selectedSortIndex);
        const newFilters = {
            ...viewModel.filters,
            sortBy
        };
        
        viewModel.onApplyFilters(newFilters);
        const frame = require('@nativescript/core').Frame;
        frame.topmost().goBack();
    };
    
    // Handle reset button tap
    viewModel.onResetTap = () => {
        viewModel.filters = {
            skillLevel: {
                apa: { min: 0, max: 9 },
                bca: { min: 0, max: 7 },
                tap: { min: 0, max: 6 }
            },
            stats: {
                minWinRate: 0,
                maxWinRate: 100
            },
            sortBy: 'winRate'
        };
        viewModel.selectedSortIndex = 0;
        viewModel.notify();
    };
    
    return viewModel;
}

function getSortOptionIndex(sortBy) {
    switch (sortBy) {
        case 'winRate': return 0;
        case 'wins': return 1;
        case 'skillAPA': return 2;
        default: return 0;
    }
}

function getSortValue(index) {
    switch (index) {
        case 0: return 'winRate';
        case 1: return 'wins';
        case 2: return 'skillAPA';
        default: return 'winRate';
    }
}

export function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = createViewModel(page.navigationContext);
}