import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Failed = () => {
  return (
    <LinearGradient
      colors={["#f3e9ff", "#e9e4fc", "#f8f6ff"]}
      style={styles.gradientBg}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Ionicons name="close-circle-outline" size={80} color="#D32F2F" style={styles.icon} />
          <Text style={styles.title}>Payment Failed</Text>
          <Text style={styles.message}>
            An error occurred while processing your payment. Please try again or check your payment details.
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/(parent)/home')}>
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default Failed;

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#8e6be8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 30,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6e6592',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#8e6be8',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#8e6be8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    padding: 10,
  },
  homeButtonText: {
    color: '#8e6be8',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
