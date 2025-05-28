import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert,
} from 'react-native';

const timeSlots = [
  '8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00',
  '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00',
];

const days = ['Thứ 2', 'Thứ 3', 'Thứ 5', 'Thứ 7'];

const BookingPage = () => {
  const [selectedSlots, setSelectedSlots] = useState({});
  const [mode, setMode] = useState('Online');
  const [specialRequest, setSpecialRequest] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notify, setNotify] = useState('Có');

  const toggleSlot = (day, time) => {
    const key = `${day}-${time}`;
    setSelectedSlots((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

const handleSubmit = () => {
  if (!name || !phone || !email || Object.values(selectedSlots).every((v) => !v)) {
    Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin và chọn ít nhất một khung giờ.');
    return;
  }

  Alert.alert(
    'Xác nhận đặt lịch',
    'Bạn sẽ được chuyển đến trang thanh toán.',
    [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Đồng ý',
        onPress: () => {
          // You can store the booking data using state management, context, or pass via route if needed
          router.push('/confirmPage');
        },
      },
    ]
  );
};


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bạn muốn tư vấn vào khung giờ nào?</Text>

      {days.map((day) => (
        <View key={day} style={styles.dayBlock}>
          <Text style={styles.dayLabel}>{day}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {timeSlots.map((time) => {
              const isSelected = selectedSlots[`${day}-${time}`];
              return (
                <TouchableOpacity
                  key={`${day}-${time}`}
                  style={[styles.slot, isSelected && styles.slotSelected]}
                  onPress={() => toggleSlot(day, time)}
                >
                  <Text style={[styles.slotText, isSelected && { color: '#fff' }]}>{time}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ))}

      <Text style={styles.title}>Bạn muốn tư vấn theo hình thức nào?</Text>
      <View style={styles.columnOptions}>
        <TouchableOpacity
          style={[styles.methodOption, mode === 'Trực tiếp' && styles.selectedMethod]}
          onPress={() => setMode('Trực tiếp')}
        >
          <Text>Trực tiếp - 799.000đ / 1 tiếng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.methodOption, mode === 'Online' && styles.selectedMethod]}
          onPress={() => setMode('Online')}
        >
          <Text>Online - 599.000đ / 1 tiếng</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Bạn có yêu cầu hình thức tư vấn đặc biệt nào không?</Text>
      <TextInput
        style={styles.input}
        placeholder="Mô tả yêu cầu đặc biệt..."
        placeholderTextColor="#999"
        value={specialRequest}
        onChangeText={setSpecialRequest}
      />

      <Text style={styles.title}>Thông tin cá nhân</Text>
      <TextInput
        style={styles.input}
        placeholder="Họ và tên của bạn"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại của bạn"
        placeholderTextColor="#999"
        value={phone}
        keyboardType="phone-pad"
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Email của bạn"
        placeholderTextColor="#999"
        value={email}
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      <Text style={styles.title}>Bạn có muốn nhận thông báo về lịch hẹn qua email không?</Text>
      <View style={styles.columnOptions}>
        {['Có', 'Không'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.notifyOption, notify === option && styles.notifySelected]}
            onPress={() => setNotify(option)}
          >
            <Text style={{ color: notify === option ? '#fff' : '#000' }}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Đến trang thanh toán</Text>
      </TouchableOpacity>
     <Text style={styles.test} onPress={()=> router.push('/confirmPage')}>confirm test</Text>
      <TouchableOpacity onPress={router.back}>
        <Text style={styles.backText}>QUAY LẠI</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BookingPage;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: 50, // Adjust for status bar height
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 16,
    marginBottom: 8,
  },
  dayBlock: {
    marginBottom: 16,
  },
  dayLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#444',
  },
  horizontalScroll: {
    paddingVertical: 4,
  },
  slot: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  slotSelected: {
    backgroundColor: '#a78bfa',
    borderColor: '#a78bfa',
  },
  slotText: {
    fontSize: 13,
    color: '#333',
  },
  columnOptions: {
    marginVertical: 12,
  },
  methodOption: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  selectedMethod: {
    backgroundColor: '#e0e7ff',
    borderColor: '#a78bfa',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  notifyOption: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  notifySelected: {
    backgroundColor: '#a78bfa',
    borderColor: '#a78bfa',
  },
  submitBtn: {
    backgroundColor: '#a78bfa',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 14,
    textTransform: 'uppercase',
    marginBottom: 70,
  },
  test: {
    color: 'red',
    paddingVertical: 20,
    fontSize: 20,
  }
});
