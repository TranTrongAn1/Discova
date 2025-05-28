import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { router } from 'expo-router';

const Receipt = () => {
  // Example booking data – replace with real data passed via navigation or context
  const bookingData = {
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'nguyenvana@gmail.com',
    mode: 'Online',
    notify: 'Có',
    specialRequest: 'Tư vấn tâm lý học đường',
    selectedSlots: ['Thứ 3 - 10:00-11:00', 'Thứ 5 - 14:00-15:00'],
    price: '599.000đ / 1 tiếng',
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>XÁC NHẬN ĐẶT LỊCH</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Họ và tên:</Text>
        <Text style={styles.value}>{bookingData.name}</Text>

        <Text style={styles.label}>Số điện thoại:</Text>
        <Text style={styles.value}>{bookingData.phone}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{bookingData.email}</Text>

        <Text style={styles.label}>Hình thức tư vấn:</Text>
        <Text style={styles.value}>{bookingData.mode} ({bookingData.price})</Text>

        <Text style={styles.label}>Khung giờ đã chọn:</Text>
        {bookingData.selectedSlots.map((slot, index) => (
          <Text key={index} style={styles.value}>- {slot}</Text>
        ))}

        <Text style={styles.label}>Yêu cầu đặc biệt:</Text>
        <Text style={styles.value}>{bookingData.specialRequest || 'Không có'}</Text>

        <Text style={styles.label}>Nhận thông báo qua email:</Text>
        <Text style={styles.value}>{bookingData.notify}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/home')}>
        <Text style={styles.buttonText}>QUAY VỀ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Receipt;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
    paddingTop: 80, // Adjust for status bar height
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    color: '#555',
  },
  value: {
    color: '#333',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#a78bfa',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
