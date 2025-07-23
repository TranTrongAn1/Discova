import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { checkPaymentStatus } from './api';

const PaymentSuccess = () => {
  const params = useLocalSearchParams();
  const orderId = params.order_id;
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    if (orderId) {
      checkPayment();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const checkPayment = async () => {
    try {
      setLoading(true);
      const statusResponse = await checkPaymentStatus(orderId);
      console.log('Payment status response:', statusResponse);
      setPaymentStatus(statusResponse);
      
      if (statusResponse.status === 'paid' || statusResponse.status === 'succeeded') {
        // Payment successful - show success message
        setTimeout(() => {
          Alert.alert(
            'Payment Successful!',
            'Your registration fee has been processed successfully. You can now create your psychologist profile.',
            [
              {
                text: 'Create Profile',
                onPress: () => router.replace('/(Pychologist)/profile')
              }
            ]
          );
        }, 1000);
      } else {
        // Payment failed or pending
        Alert.alert(
          'Payment Status',
          `Your payment status is: ${statusResponse.status}. Please try again if needed.`,
          [
            { text: 'OK', onPress: () => router.replace('/(auth)/psychologistPayment') }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      Alert.alert(
        'Error',
        'Failed to verify payment status. Please contact support if you believe your payment was successful.',
        [
          { text: 'OK', onPress: () => router.replace('/(auth)/psychologistPayment') }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Verifying your payment...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#f3e9ff", "#e9e4fc", "#f8f6ff"]}
      style={styles.gradientBg}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Ionicons name="checkmark-circle-outline" size={80} color="#27ae60" style={styles.icon} />
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.message}>
            Your appointment has been successfully booked. You will receive a confirmation email shortly.
          </Text>
        </View>
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>What's Next?</Text>
          <View style={styles.stepItem}>
            <Text style={styles.stepText}>1. Check your email for booking confirmation.</Text>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepText}>2. You can view your upcoming appointments in your profile.</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/(parent)/home')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

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
    marginBottom: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6c5ce7',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6e6592',
    lineHeight: 22,
  },
  nextStepsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    marginBottom: 30,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8e6be8',
    marginBottom: 12,
  },
  stepItem: {
    marginBottom: 8,
  },
  stepText: {
    fontSize: 15,
    color: '#7c6bb3',
  },
  button: {
    backgroundColor: '#8e6be8',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#8e6be8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentSuccess; 