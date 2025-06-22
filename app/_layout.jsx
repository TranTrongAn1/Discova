import { Stack } from 'expo-router';
import React from 'react';
import { LogBox, StyleSheet } from 'react-native';
import 'react-native-gesture-handler';

LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component',
]);

const RootLayout = () => {
  return (
    <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(parent)" options={{ headerShown: false }} />
        <Stack.Screen name="(Pychologist)" options={{ headerShown: false }} />
        <Stack.Screen name="(booking)" options={{ headerShown: false }} />
        <Stack.Screen name="(Pychologist)/calendar" options={{ headerShown: false }} />
        <Stack.Screen name="psychologistPayment" options={{ headerShown: false }} />
        <Stack.Screen name="payment-success" options={{ headerShown: false }} />
    </Stack>
  )
}

export default RootLayout   

const styles = StyleSheet.create({})