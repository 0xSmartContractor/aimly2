import { Observable } from '@nativescript/core';
import { CalcuttaService } from '../../../services/calcutta-service';
import { useUser } from '@clerk/clerk-expo';

export function createViewModel(calcuttaId) {
    const viewModel = new Observable();
    const calcuttaService = new CalcuttaService();
    const { user } = useUser();

    // Initialize properties
    viewModel.selectedTabIndex = 0;
    viewModel.pendingRequests = [];
    viewModel.participants = [];
    viewModel.coDirectors = [];
    viewModel.isMainDirector = false;

    function loadData() {
        const calcutta = calcuttaService.getCalcutta(calcuttaId);
        
        viewModel.set('pendingRequests', calcutta.getPendingRequests());
        viewModel.set('participants', calcutta.getParticipantList());
        viewModel.set('coDirectors', calcutta.coDirectors);
        viewModel.set('directorName', calcutta.directorName);
        viewModel.set('isMainDirector', calcutta.directorId === user.id);
    }

    // Request management
    viewModel.onApproveRequest = (args) => {
        const request = viewModel.pendingRequests[args.index];
        calcuttaService.approveRequest(calcuttaId, request.userId, user.id);
        loadData();
    };

    viewModel.onDenyRequest = (args) => {
        const request = viewModel.pendingRequests[args.index];
        
        const dialog = require('@nativescript/core').prompt;
        dialog({
            title: 'Deny Request',
            message: 'Enter reason (optional):',
            okButtonText: 'Deny',
            cancelButtonText: 'Cancel'
        }).then(data => {
            if (data.result) {
                calcuttaService.denyRequest(calcuttaId, request.userId, user.id, data.text);
                loadData();
            }
        });
    };

    // Participant management
    viewModel.onRemoveParticipant = (args) => {
        const participant = viewModel.participants[args.index];
        
        const confirm = require('@nativescript/core').confirm;
        confirm({
            title: 'Remove Participant',
            message: `Are you sure you want to remove ${participant.displayName}?`,
            okButtonText: 'Remove',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result) {
                calcuttaService.removeParticipant(calcuttaId, participant.userId, user.id);
                loadData();
            }
        });
    };

    // Director management
    viewModel.onAddCoDirector = () => {
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate({
            moduleName: 'views/tournaments/calcutta/select-co-director',
            context: {
                calcuttaId,
                onSelect: (selectedUser) => {
                    calcuttaService.addCoDirector(calcuttaId, selectedUser.id, user.id);
                    loadData();
                }
            }
        });
    };

    viewModel.onRemoveCoDirector = (args) => {
        const director = viewModel.coDirectors[args.index];
        
        const confirm = require('@nativescript/core').confirm;
        confirm({
            title: 'Remove Co-Director',
            message: `Are you sure you want to remove ${director.displayName}?`,
            okButtonText: 'Remove',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result) {
                calcuttaService.removeCoDirector(calcuttaId, director.id, user.id);
                loadData();
            }
        });
    };

    // Load initial data
    loadData();

    return viewModel;
}

export function onNavigatingTo(args) {
    const page = args.object;
    const calcuttaId = page.navigationContext.calcuttaId;
    page.bindingContext = createViewModel(calcuttaId);
}