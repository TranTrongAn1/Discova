import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CardField, initStripe, useConfirmPayment } from '../../components/StripeWrapper';

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
<View style={styles.container}>
      {/* Header with summary + amount */}
      <View style={styles.headerRow}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <Text style={styles.amount}>Total: {Amount} {Currency}</Text>
      </View>

      {/* Order Detail Box */}
      <View style={styles.summaryBox}>
        <Text style={styles.label}>Tên bác sĩ tâm lý:</Text>
        <Text style={styles.value}>{psychologist_name}</Text>

        <Text style={styles.label}>Tên người hẹn:</Text>
        <Text style={styles.value}>{booking_name}</Text>

        <Text style={styles.label}>Hình thức tư vấn:</Text>
        <Text style={styles.value}>{session_type}</Text>

        <Text style={styles.label}>Thời gian:</Text>
        <Text style={styles.value}>{date},{time}</Text>

        <Text style={styles.label}>Ghi chú:</Text>
        <Text style={styles.value}>{parent_notes || '—'}</Text>
      </View>

      {/* Card Input */}
      <CardField
        postalCodeEnabled={false}
        placeholder={{ number: '4242 4242 4242 4242' }}
        cardStyle={styles.card}
        style={styles.cardContainer}
        onCardChange={card => setCardDetails(card)}
      />

      {/* Payment Button */}
      <TouchableOpacity
        style={[styles.button, (loading || !cardDetails?.complete) && styles.disabled]}
        onPress={handlePayPress}
        disabled={loading || !cardDetails?.complete}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : 'Complete Order'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/bookingPage')}
      >
        <Text style={styles.backButtonText}>← Quay về trang chỉnh sửa thông tin</Text>
      </TouchableOpacity>
      {/* Success Info
      {result && (
        <View style={styles.success}>
          <Text style={styles.successText}>✅ Payment Successful!</Text>
          <Text>Payment Intent ID: {result.id}</Text>
          <Text>Status: {result.status}</Text>
        </View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 100,
    backgroundColor: '#fff',
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E97FD',
  },
  amount: {
    fontSize: 25,
    fontWeight: '700',
    color: '#8E97FD',
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  cardContainer: {
    height: 50,
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    textColor: '#000',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#8E97FD',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    padding: 10,
  },
  backButtonText: {
    marginTop: 20,
    color: '#8E97FD',
    fontSize: 15,
  },
});


export default StripePaymentScreen;