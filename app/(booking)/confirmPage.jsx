import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React from 'react';
import { router, useLocalSearchParams} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../(auth)/api';
const ConfirmPage = () => {
  const { data } = useLocalSearchParams();
  const bookingData = JSON.parse(data); // ✅ Real booking data passed from BookingPage

  const handleConfirmBooking = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const user_id = await AsyncStorage.getItem('user_id');
      if (!token) {
        Alert.alert('Lỗi', 'Không tìm thấy token đăng nhập.');
        return;
      }
          const createOrderResponse = await api.post(
            '/api/payments/orders/create_appointment_order/',
            {
              psychologist_id: bookingData.psychologistId,
              child_id: bookingData.childId,
              session_type: bookingData.session_type, // "OnlineMeeting" or "InitialConsultation"
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
      }, // some APIs might need a body, if not, keep it empty
      {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
        const clientSecret = paymentResponse.data.client_secret;

    // Step 3: Navigate to Stripe payment screen
    router.push({
      pathname: '/payment',
      params: {
        clientSecret,
        orderId: user_id, // same as user_id in your case
      },
    });

    } catch (error) {
      console.error('Booking failed:', error);
      Alert.alert('Lỗi', 'Không thể đặt lịch. Vui lòng thử lại sau.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Xác nhận thông tin lịch hẹn</Text>

      <View style={styles.card}>
        <Text style={styles.label}><Text style={styles.bold}>Chuyên gia: </Text>{bookingData.psychologist_name || 'N/A'}</Text>
        <Text style={styles.label}><Text style={styles.bold}>Dịch vụ: </Text>{bookingData.session_type === 'OnlineMeeting' ? 'Tư vấn online' : 'Tư vấn trực tiếp'}</Text>
        <Text style={styles.label}><Text style={styles.bold}>Thời gian: </Text>{bookingData.slotDetails?.timeRange} ngày {bookingData.slotDetails?.date}</Text>
        <Text style={styles.label}><Text style={styles.bold}>Thông tin người hẹn:</Text></Text>
        <Text style={styles.subLabel}>Họ và Tên: {bookingData.name}</Text>
        <Text style={styles.subLabel}>Số điện thoại: {bookingData.phone}</Text>
        <Text style={styles.subLabel}>Email: {bookingData.email}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.notes}>
        <Text style={styles.bold}>Ghi chú của người hẹn</Text>
        <Text style={styles.noteText}>{bookingData.parent_notes || 'Không có'}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.pricing}>
        <Text style={styles.bold}>Phí dịch vụ</Text>
        <Text style={styles.bold}>
          {bookingData.session_type === 'OnlineMeeting' ? '599.000đ' : '799.000đ'}/1 tiếng
        </Text>
      </View>
      <View style={styles.pricing}>
        <Text style={styles.bold}>Thành tiền</Text>
        <Text style={styles.bold}>
          {bookingData.session_type === 'OnlineMeeting' ? '599.000đ' : '799.000đ'}
        </Text>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
        <Text style={styles.confirmText}>XÁC NHẬN & THANH TOÁN</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={router.back}>
        <Text style={styles.backText}>QUAY LẠI</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};


export default ConfirmPage;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    paddingTop: 80, // Adjust for status bar height
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#444',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#222',
  },
  subLabel: {
    fontSize: 15,
    color: '#555',
    marginBottom: 2,
  },
  bold: {
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 15,
  },
  notes: {
    marginBottom: 15,
  },
  noteText: {
    marginTop: 5,
    color: '#888',
    fontStyle: 'italic',
  },
  pricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#859BFF',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 25,
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  backButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  backText: {
    color: '#888',
    fontSize: 14,
  },
});
