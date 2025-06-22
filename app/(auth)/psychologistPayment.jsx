import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    checkPaymentStatus,
    checkPsychologistProfile,
    clearTokens,
    createBasicPsychologistProfile,
    createRegistrationOrder,
    getExistingRegistrationOrders,
    getPricing,
    initiatePayment
} from './api';

const PsychologistPayment = () => {
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState(null);
  const [profile, setProfile] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    checkVerificationAndPricing();
  }, []);

  const checkVerificationAndPricing = async () => {
    try {
      setLoading(true);
      
      // Get pricing information
      const pricingData = await getPricing();
      setPricing(pricingData);
      
      // Check psychologist profile and verification status
      try {
        const profileData = await checkPsychologistProfile();
        setProfile(profileData);
        
        // If verification status is "Approved", redirect to psychologist dashboard
        if (profileData.verification_status === 'Approved') {
          Alert.alert(
            'Already Verified',
            'Your account is already verified. Redirecting to dashboard...',
            [{ text: 'OK', onPress: () => router.replace('/(Pychologist)') }]
          );
          return;
        }
        
        // If verification status is "Rejected", show error
        if (profileData.verification_status === 'Rejected') {
          Alert.alert(
            'Verification Rejected',
            'Your verification has been rejected. Please contact support.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return;
        }
        
      } catch (profileError) {
        // If profile doesn't exist (404), that's fine - user needs to pay first
        console.log('No profile found - user needs to pay first');
      }
      
    } catch (error) {
      console.error('Error checking verification and pricing:', error);
      Alert.alert('Error', 'Failed to load payment information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      
      // First, create a basic psychologist profile if it doesn't exist
      let profileData;
      try {
        profileData = await checkPsychologistProfile();
        console.log('Profile already exists:', profileData);
      } catch (profileError) {
        if (profileError.response?.status === 404) {
          console.log('No profile found, creating basic profile...');
          profileData = await createBasicPsychologistProfile();
          console.log('Basic profile created:', profileData);
        } else {
          throw profileError;
        }
      }
      
      // Check for existing registration orders
      let order;
      try {
        const existingOrders = await getExistingRegistrationOrders();
        const registrationOrder = existingOrders.results?.find(o => o.order_type === 'psychologist_registration' && o.status === 'pending');
        
        if (registrationOrder && registrationOrder.can_be_paid) {
          console.log('Using existing registration order:', registrationOrder);
          order = registrationOrder;
        } else {
          console.log('No valid existing order found, creating new one...');
          const orderResponse = await createRegistrationOrder('USD', 'stripe');
          order = orderResponse.order;
        }
      } catch (orderError) {
        if (orderError.response?.status === 400 && orderError.response?.data?.non_field_errors?.includes('You already have an active registration order')) {
          // Try to get the existing order
          const existingOrders = await getExistingRegistrationOrders();
          const registrationOrder = existingOrders.results?.find(o => o.order_type === 'psychologist_registration');
          if (registrationOrder && registrationOrder.can_be_paid) {
            console.log('Using existing registration order:', registrationOrder);
            order = registrationOrder;
          } else {
            console.log('Existing order cannot be paid, creating new one...');
            const orderResponse = await createRegistrationOrder('USD', 'stripe');
            order = orderResponse.order;
          }
        } else {
          throw orderError;
        }
      }
      
      setOrderId(order.order_id);
      
      // Determine success and cancel URLs - use API domain URLs
      const successUrl = Platform.OS === 'web' 
        ? `${window.location.origin}/payment-success?order_id=${order.order_id}`
        : `https://kmdiscova.id.vn/api/payments/success?order_id=${order.order_id}`;
      
      const cancelUrl = Platform.OS === 'web' 
        ? `${window.location.origin}/psychologistPayment`
        : `https://kmdiscova.id.vn/api/payments/cancel`;
      
      console.log('Success URL:', successUrl);
      console.log('Cancel URL:', cancelUrl);
      
      // Initiate payment
      const paymentResponse = await initiatePayment(
        order.order_id, 
        successUrl, 
        cancelUrl, 
        'stripe'
      );
      
      console.log('Payment response:', paymentResponse);
      
      // Route to payment screen instead of opening Stripe checkout directly
      if (paymentResponse.payment_data?.client_secret) {
        router.push({
          pathname: './stripePayment',
          params: {
            clientSecret: paymentResponse.payment_data.client_secret,
            PaymentIntent: paymentResponse.payment_data.payment_intent_id,
            PaymentMethodType: paymentResponse.payment_data.payment_method_type,
            Amount: paymentResponse.payment_data.amount,
            Currency: paymentResponse.payment_data.currency,
            orderId: order.order_id,
            orderType: 'registration'
          },
        });
      } else {
        throw new Error('No payment method available');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to initiate payment. Please try again.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Payment Error', errorMessage);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCheckPaymentStatus = async () => {
    if (!orderId) return;
    
    try {
      const statusResponse = await checkPaymentStatus(orderId);
      console.log('Payment status response:', statusResponse);
      
      // The API returns status directly, not nested under 'order'
      if (statusResponse.status === 'paid' || statusResponse.status === 'succeeded') {
        Alert.alert(
          'Payment Successful!',
          'Your payment has been processed successfully. You can now create your profile.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(Pychologist)/profile')
            }
          ]
        );
      } else if (statusResponse.status === 'pending') {
        Alert.alert(
          'Payment Pending',
          'Your payment is still being processed. Please wait a moment and try again.',
          [
            { text: 'Check Again', onPress: handleCheckPaymentStatus },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert(
          'Payment Failed',
          'Your payment was not successful. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      Alert.alert('Error', 'Failed to check payment status. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Loading payment information...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#6c5ce7', '#a29bfe']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.replace('/(auth)/welcome')}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registration Payment</Text>
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

      <View style={styles.content}>
        {/* Verification Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={profile?.verification_status === 'Pending' ? 'time' : 'checkmark-circle'} 
              size={24} 
              color={profile?.verification_status === 'Pending' ? '#f39c12' : '#27ae60'} 
            />
            <Text style={styles.statusTitle}>
              {profile?.verification_status === 'Pending' ? 'Pending Verification' : 'Ready to Pay'}
            </Text>
          </View>
          <Text style={styles.statusDescription}>
            {profile?.verification_status === 'Pending' 
              ? 'Your application is under review. Complete payment to expedite the process.'
              : 'Complete payment to unlock your psychologist dashboard and start accepting clients.'
            }
          </Text>
        </View>

        {/* Pricing Information */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Registration Fee</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${pricing?.services?.psychologist_registration || '100.00'}</Text>
            <Text style={styles.currency}>USD</Text>
          </View>
          <Text style={styles.pricingDescription}>
            One-time registration fee to verify your credentials and activate your account
          </Text>
        </View>

        {/* What's Included */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What's Included:</Text>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
            <Text style={styles.featureText}>Profile verification and approval</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
            <Text style={styles.featureText}>Access to client booking system</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
            <Text style={styles.featureText}>Calendar and appointment management</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
            <Text style={styles.featureText}>Secure payment processing</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
            <Text style={styles.featureText}>24/7 platform support</Text>
          </View>
        </View>

        {/* Payment Button */}
        <TouchableOpacity
          style={[styles.paymentButton, paymentLoading && styles.paymentButtonDisabled]}
          onPress={handlePayment}
          disabled={paymentLoading}
        >
          {paymentLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="card" size={20} color="white" />
              <Text style={styles.paymentButtonText}>Pay Registration Fee</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Check Payment Status */}
        {orderId && (
          <TouchableOpacity
            style={styles.checkStatusButton}
            onPress={handleCheckPaymentStatus}
          >
            <Text style={styles.checkStatusText}>Check Payment Status</Text>
          </TouchableOpacity>
        )}

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={16} color="#6c757d" />
          <Text style={styles.securityText}>
            Your payment is processed securely by Stripe. We never store your payment information.
          </Text>
        </View>
      </View>
    </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    color: '#2c3e50',
  },
  statusDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  pricingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6c5ce7',
  },
  currency: {
    fontSize: 16,
    color: '#6c757d',
    marginLeft: 4,
  },
  pricingDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  featuresCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 12,
    flex: 1,
  },
  paymentButton: {
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
  paymentButtonDisabled: {
    backgroundColor: '#b8b5d9',
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  checkStatusButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6c5ce7',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkStatusText: {
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '600',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6c5ce7',
  },
  securityText: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
});

export default PsychologistPayment; 