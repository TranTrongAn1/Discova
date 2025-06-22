import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { clearTokens } from './api';

const StripePayment = () => {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  
  const {
    clientSecret,
    PaymentIntent,
    PaymentMethodType,
    Amount,
    Currency,
    orderId,
    orderType
  } = params;

  const handlePayment = async () => {
    setLoading(true);
    try {
      console.log('Processing payment with:', {
        clientSecret,
        PaymentIntent,
        Amount,
        Currency,
        orderId
      });

      // Use the client_secret to create a Stripe Checkout session
      // The backend already provided the client_secret from initiate_payment
      if (!clientSecret) {
        throw new Error('Client secret is missing');
      }

      // Create Stripe Checkout URL using the payment_intent_id
      // The client_secret is used for the payment intent
      const stripeCheckoutUrl = `https://checkout.stripe.com/pay/${PaymentIntent}`;
      
      console.log('Opening Stripe Checkout:', stripeCheckoutUrl);
      
      // Open Stripe Checkout in browser
      const result = await WebBrowser.openBrowserAsync(stripeCheckoutUrl);
      
      console.log('Browser result:', result);
      
      if (result.type === 'success') {
        // Check if payment was successful by checking the order status
        // For now, we'll show success (in real implementation, verify with backend)
        Alert.alert(
          'Payment Successful! 🎉',
          `Your payment of $${Amount} ${Currency} has been processed successfully. You can now access your psychologist dashboard.`,
          [
            {
              text: 'Continue to Dashboard',
              onPress: () => {
                if (orderType === 'registration') {
                  router.replace('/(Pychologist)/profile');
                } else {
                  router.replace('/(booking)/success');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Payment Cancelled',
          'Payment was cancelled. You can try again.',
          [
            { text: 'Try Again', onPress: () => setLoading(false) },
            { text: 'Cancel', onPress: () => router.back() }
          ]
        );
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Error', 
        'Failed to process payment. Please check your internet connection and try again.',
        [
          { text: 'Try Again', onPress: () => setLoading(false) },
          { text: 'Cancel', onPress: () => router.back() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => router.back() }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6c5ce7', '#a29bfe']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Details</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Logout', 
                  style: 'destructive',
                  onPress: async () => {
                    await clearTokens();
                    router.replace('/login');
                  }
                }
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card-outline" size={24} color="#6c5ce7" />
            <Text style={styles.cardTitle}>Order Information</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.value}>{orderId}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>${Amount} {Currency}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>{PaymentMethodType}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Order Type</Text>
            <Text style={styles.value}>
              {orderType === 'registration' ? 'Psychologist Registration' : 'Appointment Booking'}
            </Text>
          </View>
        </View>

        <View style={styles.securityCard}>
          <Ionicons name="shield-checkmark" size={20} color="#00b894" />
          <Text style={styles.securityText}>
            Your payment will be processed securely through Stripe Checkout
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.payButton, loading && styles.buttonDisabled]} 
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="card" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.payButtonText}>PROCEED TO PAYMENT</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={handleCancel}
          disabled={loading}
        >
          <Ionicons name="close-circle" size={20} color="#e74c3c" style={styles.buttonIcon} />
          <Text style={styles.cancelButtonText}>CANCEL PAYMENT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StripePayment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  securityCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    fontSize: 14,
    color: '#00b894',
    marginLeft: 10,
    flex: 1,
  },
  payButton: {
    backgroundColor: '#00b894',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#00b894',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e74c3c',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    marginLeft: 'auto',
  },
}); 