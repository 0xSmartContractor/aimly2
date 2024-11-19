import { Application } from '@nativescript/core';
import { ClerkProviderWrapper } from './auth/clerk-provider';

Application.run({
    create: () => {
        return (
            <ClerkProviderWrapper>
                <frame defaultPage="main-page" />
            </ClerkProviderWrapper>
        );
    },
});