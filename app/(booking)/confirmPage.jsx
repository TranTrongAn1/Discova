import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { router } from 'expo-router';
const bookingData = {
  expertName: 'ThS. Trần Thị Thu Vân',
  service: 'Tư vấn online',
  time: '5:00PM Thứ 4, 30/3/2025',
  customer: {
    name: 'Nguyễn Thị Mai',
    phone: '0375377310',
    email: 'mainguyen123@gmail.com',
  },
  note: 'Không có',
  pricePerHour: '799.000đ',
  totalPrice: '799.000đ',
};
const ConfirmPage = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Xác nhận thông tin lịch hẹn</Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          <Text style={styles.bold}>Chuyên gia: </Text>{bookingData.expertName}
        </Text>
        <Text style={styles.label}>
          <Text style={styles.bold}>Dịch vụ: </Text>{bookingData.service}
        </Text>
        <Text style={styles.label}>
          <Text style={styles.bold}>Thời gian: </Text>{bookingData.time}
        </Text>
        <Text style={styles.label}><Text style={styles.bold}>Thông tin người hẹn:</Text></Text>
        <Text style={styles.subLabel}>{bookingData.customer.name}</Text>
        <Text style={styles.subLabel}>{bookingData.customer.phone}</Text>
        <Text style={styles.subLabel}>{bookingData.customer.email}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.notes}>
        <Text style={styles.bold}>Ghi chú của người hẹn</Text>
        <Text style={styles.noteText}>{bookingData.note}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.pricing}>
        <Text style={styles.bold}>Phí dịch vụ</Text>
        <Text style={styles.bold}>{bookingData.pricePerHour}/1 tiếng</Text>
      </View>
      <View style={styles.pricing}>
        <Text style={styles.bold}>Thành tiền</Text>
        <Text style={styles.bold}>{bookingData.totalPrice}</Text>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={()=> router.push('/receipt')}>
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
