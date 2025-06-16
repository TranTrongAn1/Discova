import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { CardField, useConfirmPayment, initStripe } from '@stripe/stripe-react-native';
import { useLocalSearchParams } from 'expo-router';

const StripePaymentScreen = () => {
  // Receive the parameters exactly as sent from ConfirmPage
  const { clientSecret, PaymentIntent, PaymentMethodType } = useLocalSearchParams();
  
  const [cardDetails, setCardDetails] = useState();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [stripeInitialized, setStripeInitialized] = useState(false);
  const { confirmPayment } = useConfirmPayment();

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
        Alert.alert('Success', 'Payment completed successfully!');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoBox}>
        <Text style={styles.title}>🧪 K&Mdiscova Registration Payment Test</Text>
        <Text><Text style={styles.label}>Payment Intent:</Text> {PaymentIntent}</Text>
        <Text><Text style={styles.label}>Payment Method:</Text> {PaymentMethodType}</Text>
        <Text><Text style={styles.label}>Client Secret:</Text> {clientSecret ? '✅ Ready' : '❌ Missing'}</Text>
        <Text><Text style={styles.label}>Stripe Status:</Text> {stripeInitialized ? '✅ Ready' : '⏳ Initializing...'}</Text>
        <Text><Text style={styles.label}>Test Card:</Text> 4242 4242 4242 4242</Text>
        <Text style={styles.note}>💡 Use test card: 4242 4242 4242 4242, any future date, any CVC</Text>
      </View>

      <CardField
        postalCodeEnabled={false}
        placeholder={{ number: '4242 4242 4242 4242' }}
        cardStyle={styles.card}
        style={styles.cardContainer}
        onCardChange={card => setCardDetails(card)}
      />

      <Button
        title={loading ? 'Processing...' : `Complete Registration Payment - 100$`}
        onPress={handlePayPress}
        disabled={loading || !cardDetails?.complete}
        color="#007cba"
      />

      {result && (
        <View style={styles.success}>
          <Text style={styles.successText}>✅ Payment Successful!</Text>
          <Text>Payment Intent ID: {result.id}</Text>
          <Text>Status: {result.status}</Text>
          <Text style={{ marginTop: 10 }}>🔄 Next Steps:</Text>
          <Text>1. Webhook will be sent to your server</Text>
          <Text>2. Psychologist auto-approved</Text>
          <Text>3. Check Django logs</Text>
          <Text>4. Verify in admin or API</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    marginTop: 40 
  },
  infoBox: { 
    backgroundColor: '#e3f2fd', 
    padding: 15, 
    borderRadius: 6, 
    marginBottom: 20 
  },
  label: { 
    fontWeight: 'bold' 
  },
  title: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 10 
  },
  note: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5
  },
  cardContainer: { 
    height: 50, 
    marginVertical: 20 
  },
  card: {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
  },
  success: {
    marginTop: 20,
    backgroundColor: '#e6ffed',
    padding: 15,
    borderRadius: 6,
  },
  successText: {
    color: '#2e7d32',
    fontWeight: '600',
    marginBottom: 8,
  },
});

export default StripePaymentScreen;