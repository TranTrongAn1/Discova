import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
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
    <View style={styles.container}>
      <LinearGradient
        colors={['#27ae60', '#2ecc71']}
        style={styles.header}
      >
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color="white" />
        </View>
        <Text style={styles.headerTitle}>Payment Received!</Text>
        <Text style={styles.headerSubtitle}>Thank you for completing your registration</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Registration Complete</Text>
          <Text style={styles.successDescription}>
            Your psychologist registration fee has been processed successfully. 
            You can now create your professional profile and start accepting clients.
          </Text>
        </View>

        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>Next Steps:</Text>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Create your professional profile</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Set your availability and rates</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Start accepting client bookings</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.replace('/(Pychologist)/profile')}
        >
          <Text style={styles.continueButtonText}>Create My Profile</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => Linking.openURL('mailto:support@discova.com')}
        >
          <Ionicons name="mail" size={16} color="#6c5ce7" />
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    flex: 1,
  },
  successCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    textAlign: 'center',
  },
  nextStepsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  stepText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  supportButtonText: {
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default PaymentSuccess; 