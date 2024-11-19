import React from 'react';
import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

const tokenCache = {
    async getToken(key) {
        try {
            return SecureStore.getItemAsync(key);
        } catch (err) {
            return null;
        }
    },
    async saveToken(key, value) {
        try {
            return SecureStore.setItemAsync(key, value);
        } catch (err) {
            return;
        }
    },
};

export function ClerkProviderWrapper({ children }) {
    return (
        <ClerkProvider
            publishableKey={process.env.CLERK_PUBLISHABLE_KEY}
            tokenCache={tokenCache}
        >
            {children}
        </ClerkProvider>
    );
}