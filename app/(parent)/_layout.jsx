/* app/auth/_layout.tsx */
import { Stack } from 'expo-router';

export default function ParentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,        // hide default header for ALL auth screens
        animation: 'slide_from_right', // iOS-style push; change if you prefer
        gestureDirection: 'horizontal', // keep swipe-to-go-back
      }}
    >
    </Stack>
  );
}
