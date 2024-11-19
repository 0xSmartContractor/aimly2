import { Observable } from '@nativescript/core';
import { Camera } from '@nativescript/camera';
import { ImagePicker } from '@nativescript/imagepicker';

export function createViewModel(profile) {
    const viewModel = new Observable();
    Object.assign(viewModel, profile);
    
    viewModel.onChangePhotoTap = async () => {
        const options = {
            title: 'Choose Photo Source',
            message: 'Select a source for your profile photo',
            cancelButtonText: 'Cancel',
            actions: ['Take Photo', 'Choose from Gallery']
        };
        
        const response = await action(options);
        
        if (response === 'Take Photo') {
            const image = await Camera.requestPermissions()
                .then(() => Camera.takePicture());
            viewModel.set('photoUrl', image.android || image.ios);
        } else if (response === 'Choose from Gallery') {
            const imagePicker = new ImagePicker();
            const selection = await imagePicker.authorize()
                .then(() => imagePicker.present());
            
            if (selection.length > 0) {
                viewModel.set('photoUrl', selection[0].android || selection[0].ios);
            }
        }
    };
    
    viewModel.onSaveTap = () => {
        // Save profile changes
        const frame = require('@nativescript/core').Frame;
        frame.topmost().goBack();
    };
    
    return viewModel;
}

export function onNavigatingTo(args) {
    const page = args.object;
    const profile = page.navigationContext;
    page.bindingContext = createViewModel(profile);
}