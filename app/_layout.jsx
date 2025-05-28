import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { LogBox } from 'react-native';

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
        
    </Stack>
  )
}

export default RootLayout   

const styles = StyleSheet.create({})