import { Observable } from '@nativescript/core';
import { UserProfile } from '../../models/user-profile';
import { useUser } from '@clerk/clerk-expo';

export function createViewModel() {
    const viewModel = new Observable();
    const { user } = useUser();
    
    // Initialize with Clerk user data
    const profile = new UserProfile({
        id: user.id,
        displayName: user.fullName,
        photoUrl: user.imageUrl,
        bio: 'Pool enthusiast',
        skillLevels: {
            apa: 5,
            bca: 4,
            tap: 3
        },
        stats: {
            wins: 0,
            losses: 0,
            challengesCompleted: 0
        }
    });
    
    Object.assign(viewModel, profile);
    
    viewModel.onEditTap = () => {
        // Navigate to edit profile page
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate({
            moduleName: 'views/profile/edit-profile-page',
            context: profile
        });
    };
    
    return viewModel;
}

export function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = createViewModel();
}