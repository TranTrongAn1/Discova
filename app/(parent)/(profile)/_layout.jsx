import { Stack } from 'expo-router'
import React from 'react'

const ParentProfileLayout = () => {
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
  )
}

export default ParentProfileLayout
