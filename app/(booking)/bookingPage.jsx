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
// Validation error states
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation function (Vietnam phone numbers)
  const validatePhone = (phone) => {
    // Remove all spaces and special characters
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Vietnam phone number patterns:
    // Mobile: 03x, 05x, 07x, 08x, 09x (10 digits total)
    // Or with country code: +84 or 84 (11-12 digits total)
    const phoneRegex = /^(\+84|84|0)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/;
    
    return phoneRegex.test(cleanPhone);
  };

  // Handle email input change with validation
  const handleEmailChange = (text) => {
    setEmail(text);
    if (text.trim() === '') {
      setEmailError('');
    } else if (!validateEmail(text)) {
      setEmailError('Email không hợp lệ');
    } else {
      setEmailError('');
    }
  };
  console.log("session: ", type )
  // Handle phone input change with validation
  const handlePhoneChange = (text) => {
    setPhone(text);
    if (text.trim() === '') {
      setPhoneError('');
    } else if (!validatePhone(text)) {
      setPhoneError('Số điện thoại không hợp lệ');
    } else {
      setPhoneError('');
    }
  };

  // Handle name input change with validation
  const handleNameChange = (text) => {
    setName(text);
    if (text.trim() === '') {
      setNameError('Vui lòng nhập họ và tên');
    } else if (text.trim().length < 2) {
      setNameError('Họ và tên phải có ít nhất 2 ký tự');
    } else {
      setNameError('');
    }
  };

  // Validate all fields before submission
  const validateAllFields = () => {
    let isValid = true;

    // Validate name
    if (name.trim() === '') {
      setNameError('Vui lòng nhập họ và tên');
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError('Họ và tên phải có ít nhất 2 ký tự');
      isValid = false;
    }

    // Validate phone
    if (phone.trim() === '') {
      setPhoneError('Vui lòng nhập số điện thoại');
      isValid = false;
    } else if (!validatePhone(phone)) {
      setPhoneError('Số điện thoại không hợp lệ');
      isValid = false;
    }

    // Validate email
    if (email.trim() === '') {
      setEmailError('Vui lòng nhập email');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Email không hợp lệ');
      isValid = false;
    }

    return isValid;
  };
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
            `/api/appointments/slots/available_for_booking/?psychologist_id=${psychologistId}&session_type=${type == 'online' ? 'OnlineMeeting' : 'InitialConsultation'}&date_from=${dateFrom}&date_to=${dateTo}`,
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
        if (!validateAllFields()) {
      return;
    }
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
          session_type: type == 'online' ? 'OnlineMeeting' : 'InitialConsultation',
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
        const [year, month, date] = day.split('-').map(Number);
        const dateObj = new Date(year, month - 1, date); // Avoids ISO timezone issues
        const dayLabel = new Intl.DateTimeFormat('vi-VN', {
          weekday: 'short',
          day: 'numeric',
          month: 'numeric',
        }).format(dateObj);


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
    
      style={[styles.input, nameError ? styles.inputError : null]}
      placeholder="Họ và tên của bạn"
      placeholderTextColor="#999"
      value={name}
      onChangeText={handleNameChange}
    />
    {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
    <TextInput
      style={[styles.input, phoneError ? styles.inputError : null]}
      placeholder="Số điện thoại của bạn"
      placeholderTextColor="#999"
      value={phone}
      keyboardType="phone-pad"
      onChangeText={handlePhoneChange}
    />
    {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
    <TextInput
      style={[styles.input, emailError ? styles.inputError : null]}
      placeholder="Email của bạn"
      placeholderTextColor="#999"
      value={email}
      keyboardType="email-address"
      onChangeText={handleEmailChange}
    />
 {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
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
    inputError: {
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
});
