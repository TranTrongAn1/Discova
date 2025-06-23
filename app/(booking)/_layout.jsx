import { Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

// Conditionally import StripeProvider only for native platforms
let StripeProvider = null;
if (Platform.OS !== 'web') {
  try {
    const { StripeProvider: StripeProviderNative } = require('@stripe/stripe-react-native');
    StripeProvider = StripeProviderNative;
  } catch (error) {
    console.warn('Stripe React Native not available:', error);
  }
}

const BookingLayout = () => {
  const publishableKey = "pk_test_51RW4q4Rq8N8jdwzZXus9YjEnUhdkk3TZIll62vHWM7CBwRaqIRnmjPDKXWx1ytsJ6RrHurL77M4yo0uMjMXVdZV400DQhwWn35";

  // If we're on web or StripeProvider is not available, render without it
  if (Platform.OS === 'web' || !StripeProvider) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,        // hide default header for ALL auth screens
          animation: 'slide_from_right', // iOS-style push; change if you prefer
          gestureDirection: 'horizontal', // keep swipe-to-go-back
        }}
      >
        {/* ⚠️ No <Stack.Screen> declarations needed.
            Each file inside auth/ (login.tsx, register.tsx …)
            is auto-registered as a screen in this nested Stack. */}
      </Stack>
    );
  }

  // For native platforms, wrap with StripeProvider
  return (
    <StripeProvider publishableKey={publishableKey}>
      <Stack
        screenOptions={{
          headerShown: false,        // hide default header for ALL auth screens
          animation: 'slide_from_right', // iOS-style push; change if you prefer
          gestureDirection: 'horizontal', // keep swipe-to-go-back
        }}
      >
        {/* ⚠️ No <Stack.Screen> declarations needed.
            Each file inside auth/ (login.tsx, register.tsx …)
            is auto-registered as a screen in this nested Stack. */}
      </Stack>
    </StripeProvider>
  );
};

export default BookingLayout;
