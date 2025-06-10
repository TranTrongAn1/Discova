import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';

const StripePaymentScreen = ({ route }) => {
  const { clientSecret, orderId } = route.params;

  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({});
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const { confirmPayment } = useStripe();

  const handlePay = async () => {
    if (!cardDetails.complete) {
      Alert.alert('Error', 'Please enter complete card details');
      return;
    }

    setLoading(true);
    try {
      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: 'Dr. Jane Smith',
            email: 'testpsy1@example.com',
          },
        },
      });

      if (error) {
        console.log('Payment failed', error.message);
        Alert.alert('Payment failed', error.message);
      } else if (paymentIntent) {
        setPaymentSuccess(paymentIntent);
        console.log('Payment successful', paymentIntent);
      }
    } catch (err) {
      console.error('Payment error', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {paymentSuccess ? (
        <View style={styles.success}>
          <Text style={styles.title}>✅ Payment Successful!</Text>
          <Text>Order ID: {orderId}</Text>
          <Text>Payment Intent ID: {paymentSuccess.id}</Text>
          <Text>Status: {paymentSuccess.status}</Text>
          <Text>Amount: ${(paymentSuccess.amount / 100).toFixed(2)}</Text>
          <Text style={styles.nextSteps}>🔄 Next Steps:</Text>
          <Text>• Webhook will update backend</Text>
          <Text>• Psychologist will be auto-approved</Text>
          <Text>• Check admin or API for status</Text>
        </View>
      ) : (
        <>
          <View style={styles.info}>
            <Text style={styles.title}>🧪 K&Mdiscova Payment Test</Text>
            <Text>Order ID: {orderId}</Text>
            <Text>Amount: $100.00 USD</Text>
            <Text>Test Card: 4242 4242 4242 4242</Text>
          </View>

          <CardField
            postalCodeEnabled={false}
            placeholder={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={styles.card}
            style={styles.cardContainer}
            onCardChange={(card) => setCardDetails(card)}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#007cba" />
          ) : (
            <Button title="Complete Registration Payment - $100.00" onPress={handlePay} color="#007cba" />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
  },
  info: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
  },
  cardContainer: {
    height: 50,
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    textColor: '#000',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  nextSteps: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  success: {
    backgroundColor: '#d4edda',
    padding: 20,
    borderRadius: 6,
  },
});

export default StripePaymentScreen;
