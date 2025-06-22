import { Stack } from 'expo-router'
import React from 'react'
import { StripeProvider } from '../../components/StripeWrapper'

const ProfileLayout = () => {
  return (
  <StripeProvider publishableKey="pk_test_51RW4q4Rq8N8jdwzZXus9YjEnUhdkk3TZIll62vHWM7CBwRaqIRnmjPDKXWx1ytsJ6RrHurL77M4yo0uMjMXVdZV400DQhwWn35">
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
  )
}

export default ProfileLayout
