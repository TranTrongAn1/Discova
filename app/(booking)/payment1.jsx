import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import { useLocalSearchParams } from 'expo-router';

const StripePaymentScreen = () => {
  const { clientSecret, PaymentIntent } = useLocalSearchParams();
  const [cardDetails, setCardDetails] = useState();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { confirmPayment } = useConfirmPayment();

  const handlePayPress = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Please enter complete card details');
      return;
    }

    setLoading(true);
    const { paymentIntent, error } = await confirmPayment(clientSecret, {
      type: 'Card',
      billingDetails: {
        name: 'Dr. Jane Smith',
        email: 'testpsy1@example.com',
      },
    });

    if (error) {
      Alert.alert('Payment failed', error.message);
    } else if (paymentIntent) {
      setResult(paymentIntent);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoBox}>
        <Text style={styles.title}>🧪 K&Mdiscova Registration Payment Test</Text>
        <Text><Text style={styles.label}>Payment Intent:</Text> {PaymentIntent}</Text>
        <Text><Text style={styles.label}>Amount:</Text> $100.00</Text>
        <Text><Text style={styles.label}>Test Card:</Text> 4242 4242 4242 4242</Text>
      </View>

      <CardField
        postalCodeEnabled={false}
        placeholder={{ number: '4242 4242 4242 4242' }}
        cardStyle={styles.card}
        style={styles.cardContainer}
        onCardChange={card => setCardDetails(card)}
      />

      <Button
        title={loading ? 'Processing...' : 'Complete Registration Payment - $100.00'}
        onPress={handlePayPress}
        disabled={loading}
        color="#007cba"
      />

      {result && (
        <View style={styles.success}>
          <Text style={styles.successText}>✅ Payment Successful!</Text>
          <Text>Payment Intent ID: {result.id}</Text>
          <Text>Status: {result.status}</Text>
          <Text>Amount: ${(result.amount / 100).toFixed(2)}</Text>
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
  container: { padding: 20, marginTop: 40 },
  infoBox: { backgroundColor: '#e3f2fd', padding: 15, borderRadius: 6, marginBottom: 20 },
  label: { fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  cardContainer: { height: 50, marginVertical: 20 },
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
