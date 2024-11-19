import React from 'react';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Page, ActionBar, StackLayout, Label } from '@nativescript/core';
import { SignInScreen } from './auth/sign-in-screen';

export function createViewModel() {
    return {};
}

export function MainPage() {
    return (
        <Page>
            <ActionBar title="Aimly" />
            <SignedIn>
                <StackLayout className="p-4">
                    <Label text="Welcome to Aimly!" className="text-3xl text-center" />
                </StackLayout>
            </SignedIn>
            <SignedOut>
                <SignInScreen />
            </SignedOut>
        </Page>
    );
}

export function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = createViewModel();
}