import { Ionicons } from '@expo/vector-icons';
import { CardField, initStripe, useConfirmPayment } from '@stripe/stripe-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const StripePaymentScreen = () => {
  // Receive the parameters exactly as sent from ConfirmPage
    const {
    clientSecret,
    PaymentIntent,
    PaymentMethodType,
    Amount,
    Currency,
    bookingData: bookingDataString,
  } = useLocalSearchParams();
  
  const [cardDetails, setCardDetails] = useState();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [stripeInitialized, setStripeInitialized] = useState(false);
  const { confirmPayment } = useConfirmPayment();
  const bookingData = JSON.parse(bookingDataString);
  
  // Now you can access all properties
  const psychologist_name = bookingData.psychologist_name;
  const booking_name = bookingData.name;
  const session_type = bookingData.session_type;
  const date = bookingData.slotDetails?.date || bookingData.date;
  const time = bookingData.slotDetails?.timeRange || bookingData.time;
  const parent_notes = bookingData.parent_notes;
  // Initialize Stripe when component mounts
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        await initStripe({
          publishableKey: 'pk_test_51RW4q4Rq8N8jdwzZXus9YjEnUhdkk3TZIll62vHWM7CBwRaqIRnmjPDKXWx1ytsJ6RrHurL77M4yo0uMjMXVdZV400DQhwWn35', // Replace with your actual publishable key
          merchantIdentifier: 'merchant.identifier', // Optional
        });
        setStripeInitialized(true);
      } catch (error) {
        console.error('Stripe initialization failed:', error);
        Alert.alert('Error', 'Failed to initialize payment system');
      }
    };

    initializeStripe();
  }, []);

  // Remove the server-side Stripe initialization - this should be on your backend
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // ❌ Remove this line

  const handlePayPress = async () => {
    if (!stripeInitialized) {
      Alert.alert('Error', 'Payment system is not ready. Please wait a moment.');
      return;
    }

    if (!cardDetails?.complete) {
      Alert.alert('Please enter complete card details');
      return;
    }

    if (!clientSecret) {
      Alert.alert('Error', 'Client secret is missing. Please check your payment setup.');
      return;
    }

    setLoading(true);
    
    try {
      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      });

      if (error) {
        console.error('Payment error:', error);
        Alert.alert('Payment failed', error.message);
      } else if (paymentIntent) {
        console.log('Payment successful:', paymentIntent);
        setResult(paymentIntent);
        Alert.alert('Success', 'Payment completed successfully!',[
          {
            text: 'OK',
            onPress: () => router.push('/success'), // ✅ Redirect to success page
          },
        ]);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.', [
        {
          text: 'OK',
          onPress: () => router.push('/failed'),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
  <LinearGradient
    colors={["#f3e9ff", "#e9e4fc", "#f8f6ff"]}
    style={styles.gradientBg}
  >
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Complete Your Payment</Text>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <Text style={styles.amount}>{Amount} {Currency}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoBlock}>
          <Ionicons name="person-outline" size={16} color="#8e6be8" style={{ marginRight: 6 }} />
          <Text style={styles.label}>Psychologist: </Text>
          <Text style={styles.value}>{psychologist_name}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Ionicons name="desktop-outline" size={16} color="#8e6be8" style={{ marginRight: 6 }} />
          <Text style={styles.label}>Service: </Text>
          <Text style={styles.value}>{session_type === 'OnlineMeeting' ? 'Online' : 'In-person'}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Ionicons name="calendar-outline" size={16} color="#8e6be8" style={{ marginRight: 6 }} />
          <Text style={styles.label}>Date: </Text>
          <Text style={styles.value}>{date}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Ionicons name="time-outline" size={16} color="#8e6be8" style={{ marginRight: 6 }} />
          <Text style={styles.label}>Time: </Text>
          <Text style={styles.value}>{time}</Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Enter Card Details</Text>
        <CardField
          postalCodeEnabled={false}
          placeholder={{ number: '4242 4242 4242 4242' }}
          cardStyle={styles.cardInput}
          style={styles.cardContainer}
          onCardChange={card => setCardDetails(card)}
        />
      </View>
      <TouchableOpacity
        style={[styles.button, (loading || !cardDetails?.complete) && styles.disabled]}
        onPress={handlePayPress}
        disabled={loading || !cardDetails?.complete}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : `Pay ${Amount} ${Currency}`}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back to Confirmation</Text>
      </TouchableOpacity>
    </ScrollView>
  </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  scrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#6c5ce7',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#8e6be8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8e6be8',
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6c5ce7',
  },
  divider: {
    height: 1,
    backgroundColor: '#ede7fa',
    marginVertical: 12,
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 15,
    color: '#7c6bb3',
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#6e6592',
    flex: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8e6be8',
    marginBottom: 12,
  },
  cardContainer: {
    height: 50,
    marginVertical: 10,
  },
  cardInput: {
    backgroundColor: '#f8f6ff',
    textColor: '#444444',
    borderColor: '#b39ddb',
    borderWidth: 1,
    borderRadius: 14,
  },
  button: {
    backgroundColor: '#8e6be8',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    shadowColor: '#8e6be8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabled: {
    opacity: 0.6,
    backgroundColor: '#b39ddb',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    padding: 10,
    marginTop: 15,
  },
  backButtonText: {
    color: '#8e6be8',
    fontSize: 15,
    fontWeight: 'bold',
  },
});


export default StripePaymentScreen;