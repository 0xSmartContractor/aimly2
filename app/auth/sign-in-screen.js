import { SignedIn, SignedOut, useSignIn } from '@clerk/clerk-expo';
import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';

export function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');

  const onSignInPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });

      await setActive({ session: completeSignIn.createdSessionId });
    } catch (err) {
      console.error('Error signing in:', err);
    }
  };

  const onOAuthPress = async (strategy) => {
    try {
      const redirectUrl = await WebBrowser.openAuthSessionAsync(
        `https://aimly.clerk.accounts.dev/oauth/${strategy}?redirect_url=`,
        'aimly://'
      );

      if (redirectUrl) {
        const { sessionId } = redirectUrl;
        if (sessionId) {
          await setActive({ session: sessionId });
        }
      }
    } catch (err) {
      console.error('OAuth error:', err);
    }
  };

  return (
    <StackLayout class="p-4">
      <TextField
        hint="Email"
        keyboardType="email"
        text="{{ emailAddress }}"
        class="input mb-4"
      />
      <TextField
        hint="Password"
        secure="true"
        text="{{ password }}"
        class="input mb-4"
      />
      <Button text="Sign In" tap="{{ onSignInPress }}" class="btn-primary mb-4" />
      <Button 
        text="Sign in with Google" 
        tap="{{ () => onOAuthPress('oauth_google') }}" 
        class="btn-secondary"
      />
    </StackLayout>
  );
}