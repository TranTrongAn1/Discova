import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../(auth)/api';

const ConfirmPage = () => {
  const { data } = useLocalSearchParams();
  const bookingData = JSON.parse(data);

  const handleConfirmBooking = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Login token not found.');
        return;
      }
      const createOrderResponse = await api.post(
        '/api/payments/orders/create_appointment_order_with_reservation/',
        {
          psychologist_id: bookingData.psychologistId,
          child_id: bookingData.childId,
          session_type: bookingData.session_type,
          start_slot_id: bookingData.start_slot_id,
          parent_notes: bookingData.parent_notes || "",
          currency: "USD",
          provider: "stripe",
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const paymentResponse = await api.post(
        `/api/payments/orders/${createOrderResponse.data.order.order_id}/initiate_payment/`,
        {
          success_url: 'http://localhost:8081/success',
          cancel_url: 'http://localhost:8081/failed',
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const clientSecret = paymentResponse.data.payment_data.client_secret;
      router.push({
        pathname: './payment1',
        params: {
          clientSecret,
          PaymentIntent: paymentResponse.data.payment_data.payment_intent_id,
          PaymentMethodType: paymentResponse.data.payment_data.payment_method_type,
          Amount: paymentResponse.data.payment_data.amount,
          Currency: paymentResponse.data.payment_data.currency,
          bookingData: JSON.stringify(bookingData),
        },
      });
    } catch (error) {
      console.error('Booking failed:', error.response?.data || error.message || error);
      Alert.alert('Error', 'Could not book. Please try again later.');
    }
  };

  return (
    <LinearGradient
      colors={["#f3e9ff", "#e9e4fc", "#f8f6ff"]}
      style={styles.gradientBg}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Confirm Your Booking</Text>
        <View style={styles.card}>
          <View style={styles.rowInfo}>
            <Ionicons name="person-outline" size={18} color="#8e6be8" style={{ marginRight: 8 }} />
            <Text style={styles.label}><Text style={styles.bold}>Psychologist: </Text>{bookingData.psychologist_name || 'N/A'}</Text>
          </View>
          <View style={styles.rowInfo}>
            <Ionicons name={bookingData.session_type === 'OnlineMeeting' ? 'desktop-outline' : 'walk'} size={18} color="#8e6be8" style={{ marginRight: 8 }} />
            <Text style={styles.label}><Text style={styles.bold}>Service: </Text>{bookingData.session_type === 'OnlineMeeting' ? 'Online Consultation' : 'In-person Consultation'}</Text>
          </View>
          <View style={styles.rowInfo}>
            <Ionicons name="calendar-outline" size={18} color="#8e6be8" style={{ marginRight: 8 }} />
            <Text style={styles.label}><Text style={styles.bold}>Time: </Text>{bookingData.slotDetails?.timeRange} on {bookingData.slotDetails?.date}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Your Information</Text>
          <View style={styles.infoBlock}>
            <Ionicons name="person-circle-outline" size={16} color="#b39ddb" style={{ marginRight: 6 }} />
            <Text style={styles.subLabel}>Name: {bookingData.name}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Ionicons name="call-outline" size={16} color="#b39ddb" style={{ marginRight: 6 }} />
            <Text style={styles.subLabel}>Phone: {bookingData.phone}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Ionicons name="mail-outline" size={16} color="#b39ddb" style={{ marginRight: 6 }} />
            <Text style={styles.subLabel}>Email: {bookingData.email}</Text>
          </View>
        </View>
        <View style={styles.pricingCard}>
          <Text style={styles.sectionTitle}>Service Fee</Text>
          <Text style={styles.price}>
            {bookingData.session_type === 'OnlineMeeting' ? '599,000 VND' : '799,000 VND'} / 1 hour
          </Text>
          <View style={styles.pricingRow}>
            <Text style={styles.sectionTitle}>Total</Text>
            <Text style={styles.price}>{bookingData.session_type === 'OnlineMeeting' ? '599,000 VND' : '799,000 VND'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
          <Text style={styles.confirmText}>CONFIRM & PAY</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={router.back}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default ConfirmPage;

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
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#6e6592',
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
    color: '#6c5ce7',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8e6be8',
    marginBottom: 10,
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 15,
    color: '#7c6bb3',
  },
  divider: {
    height: 1,
    backgroundColor: '#ede7fa',
    marginVertical: 18,
  },
  pricingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    width: '100%',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c5ce7',
  },
  confirmButton: {
    backgroundColor: '#8e6be8',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#8e6be8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backText: {
    color: '#8e6be8',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
