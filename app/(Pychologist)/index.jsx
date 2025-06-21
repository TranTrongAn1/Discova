import { router } from 'expo-router';
import { useEffect } from 'react';

export default function PsychologistIndex() {
  useEffect(() => {
    // Redirect to profile page as default
    router.replace('/(Pychologist)/profile');
  }, []);

  return null; // This component doesn't render anything
} 