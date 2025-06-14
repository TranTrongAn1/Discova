import { router,useLocalSearchParams} from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert,
} from 'react-native';
import api from '../(auth)/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Inside your component


const BookingPage = () => {
  const [availableSlots, setAvailableSlots] = useState({});
  const [selectedSlots, setSelectedSlots] = useState({});
  const [mode, setMode] = useState('Online');
  const [specialRequest, setSpecialRequest] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notify, setNotify] = useState('Có');
  const [PsyName, SetpsyName] = useState('');
  const { id, type } = useLocalSearchParams(); // ✅ get passed parameters
  const psychologistId = id; // ✅ dynamic psychologist ID
    const [childId, setChildId] = useState('');

    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          console.warn('No token found');
          return;
        }
        
        const res = await api.get(`/api/children/profile/my_children/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        if (res.data.count > 0 && res.data.children.length > 0) {
          const child = res.data.children[0];
          setChildId(child.id);
          setMode('view');
        } else {
          setMode('create');
        }
      } catch (err) {
        console.error(err);
        setMode('create');
      }
    };


      const fetchAvailableSlots = async () => {
        const today = new Date();
        const dateFrom = today.toISOString().split('T')[0];
        const dateTo = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0];
        try {
          const token = await AsyncStorage.getItem('access_token');
          if (!token) {
            console.warn('No token found');
            return;
          }
          const response = await api.get(
            `/api/appointments/slots/available_for_booking/?psychologist_id=${psychologistId}&session_type=${mode === 'Online' ? 'OnlineMeeting' : 'InitialConsultation'}&date_from=${dateFrom}&date_to=${dateTo}`,
            {
              headers: {
                Authorization: `Token ${token}`,
              },
            }
          );
          const data = response.data;
          SetpsyName(response.data.psychologist_name)
          if (!data.available_slots || data.available_slots.length === 0) {
            setAvailableSlots(null); // <-- no slots available
            return;
          }
          const grouped = {};
          data.available_slots.forEach(slot => {
            const key = slot.date; 
            const timeRange = `${slot.start_time}-${slot.end_time}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push({ ...slot, timeRange });
          });
          setAvailableSlots(grouped);
        } catch (error) {
          console.error('Failed to fetch slots:', error);
          setAvailableSlots('error'); // <-- distinguish error
        }
      };
        useEffect(() => {
          fetchAvailableSlots();
          fetchProfile();
        }, [mode]);

        const toggleSlot = (slot) => {
          setSelectedSlots((prev) => {
            const newSelected = { ...prev };
            if (newSelected[slot.slot_id]) {
              delete newSelected[slot.slot_id];
            } else {
              newSelected[slot.slot_id] = slot;
            }
            return newSelected;
          });
        };

      const handleSubmit = async () => {
      if (!name || !phone || !email || Object.values(selectedSlots).every((v) => !v)) {
        Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin và chọn ít nhất một khung giờ.');
        return;
      }

      const selectedSlotIds = Object.keys(selectedSlots);
        if (selectedSlotIds.length === 0) {
          Alert.alert('Lỗi', 'Không tìm thấy khung giờ đã chọn.');
          return;
        }
        const selectedSlotId = selectedSlotIds[0];
        const selectedSlotObj = selectedSlots[selectedSlotId];


      try {

        const bookingInfo = {
          childId: childId,
          psychologistId: id,
          psychologist_name: PsyName,
          session_type: mode === 'Online' ? 'OnlineMeeting' : 'InitialConsultation',
          start_slot_id: selectedSlotId,
          parent_notes: specialRequest,
          name,
          phone,
          email,
          notify,
          slotDetails: selectedSlotObj,
        };

        // ✅ Navigate to confirmPage with bookingInfo
        router.push({
          pathname: '/confirmPage',
          params: { data: JSON.stringify(bookingInfo) },
        });
      } catch (err) {
        console.error('Error reading child_id from AsyncStorage:', err);
        Alert.alert('Lỗi', 'Đã xảy ra lỗi khi lấy thông tin trẻ.');
      }
};


return (
  <ScrollView style={styles.container}>
    <Text style={styles.title}>Bạn muốn tư vấn vào khung giờ nào?</Text>

    {typeof availableSlots === 'string' && availableSlots === 'error' ? (
      <Text style={{ color: 'red' }}>Đã xảy ra lỗi khi tải khung giờ. Vui lòng thử lại sau.</Text>
    ) : !availableSlots || Object.keys(availableSlots).length === 0 ? (
      <Text style={{ color: '#666' }}>Chuyên gia này hiện chưa có khung giờ khả dụng.</Text>
    ) : (
      Object.entries(availableSlots).map(([day, slots]) => {
        // Here is where you define dayLabel:
        const dayLabel = new Date(day).toLocaleDateString('vi-VN', {
          weekday: 'short',
          day: 'numeric',
          month: 'numeric',
        });

        return (
          <View key={day} style={styles.dayBlock}>
            <Text style={styles.dayLabel}>{dayLabel}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {Array.isArray(slots) &&
                slots.map((slot) => {
                  const key = `${day}-${slot.timeRange}`;
                  const isSelected = selectedSlots[key];
                  return (
                  <TouchableOpacity
                    key={slot.slot_id}
                    style={[styles.slot, selectedSlots[slot.slot_id] && styles.slotSelected]}
                    onPress={() => toggleSlot(slot)}
                  >
                    <Text style={[styles.slotText, selectedSlots[slot.slot_id] && { color: '#fff' }]}>
                      {slot.timeRange}
                    </Text>
                  </TouchableOpacity>

                  );
                })}
            </ScrollView>
          </View>
        );
      })
    )}

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
});
