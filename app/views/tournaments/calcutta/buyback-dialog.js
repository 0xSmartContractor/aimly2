import { Observable } from '@nativescript/core';
import { CalcuttaService } from '../../../services/calcutta-service';

export function createViewModel(params) {
    const viewModel = new Observable();
    const calcuttaService = new CalcuttaService();

    // Initialize from params
    viewModel.calcuttaId = params.calcuttaId;
    viewModel.playerId = params.playerId;
    viewModel.playerName = params.playerName;
    viewModel.auctionAmount = params.auctionAmount;

    // Format options
    viewModel.formatOptions = [
        { title: 'Singles' },
        { title: 'Doubles' }
    ];
    viewModel.selectedFormatIndex = 0;

    // Initialize buyback percentage
    viewModel.buybackPercentage = 0;
    viewModel.maxBuybackPercentage = 50; // Default to singles

    // Update max buyback when format changes
    viewModel.on(Observable.propertyChangeEvent, (data) => {
        if (data.propertyName === 'selectedFormatIndex') {
            const format = viewModel.formatOptions[data.value].title;
            viewModel.maxBuybackPercentage = format === 'Singles' ? 50 : 66.7;
            viewModel.notifyPropertyChange('maxBuybackPercentage', viewModel.maxBuybackPercentage);
        }
    });

    // Calculate amounts when percentage changes
    viewModel.on(Observable.propertyChangeEvent, (data) => {
        if (data.propertyName === 'buybackPercentage') {
            const percentage = data.value / 100;
            viewModel.buybackAmount = (viewModel.auctionAmount * percentage).toFixed(2);
            viewModel.remainingShare = (viewModel.auctionAmount * (1 - percentage)).toFixed(2);
            
            viewModel.notifyPropertyChange('buybackAmount', viewModel.buybackAmount);
            viewModel.notifyPropertyChange('remainingShare', viewModel.remainingShare);
        }
    });

    viewModel.onConfirmTap = () => {
        const format = viewModel.formatOptions[viewModel.selectedFormatIndex].title;
        const success = calcuttaService.processBuyback(viewModel.calcuttaId, {
            playerId: viewModel.playerId,
            format: format,
            percentage: viewModel.buybackPercentage / 100
        });

        if (success) {
            const frame = require('@nativescript/core').Frame;
            frame.topmost().goBack();
        } else {
            alert('Error processing buyback. Please try again.');
        }
    };

    return viewModel;
}

export function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = createViewModel(page.navigationContext);
}</content>