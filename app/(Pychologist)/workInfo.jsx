import * as ImagePicker from 'expo-image-picker';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import api from '../(auth)/api';

const hours = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const methods = ['Trực tiếp', 'Online'];

const WorkInfo = () => {
  const [selectedSlots, setSelectedSlots] = useState({});
  const [image, setImage] = useState(null);
  const [introduction, setIntroduction] = useState('');
  const [specialized, setSpecialized] = useState('');
  const [price, setPrice] = useState('');
  const [method, setMethod] = useState('Trực tiếp');
  const [loading, setLoading] = useState(false);
  const [existingAvailability, setExistingAvailability] = useState([]);

  useEffect(() => {
    fetchExistingAvailability();
  }, []);

  const fetchExistingAvailability = async () => {
    try {
      const response = await api.get('/api/psychologists/availability/my_availability/');
      const availability = response.data.results || response.data || [];
      setExistingAvailability(availability);
      
      // Convert API data to selectedSlots format
      const slots = {};
      availability.forEach(slot => {
        const day = slot.day_of_week;
        const time = slot.start_time;
        const key = `${day}_${time}`;
        slots[key] = true;
      });
      setSelectedSlots(slots);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const toggleSlot = (day, hour) => {
    const key = `${day}_${hour}`;
    setSelectedSlots((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!introduction || !specialized || !price) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    setLoading(true);
    try {
      // First, update work profile info
      await api.patch('/api/psychologists/profile/update_profile/', {
        biography: introduction,
        services_offered: [specialized],
        hourly_rate: parseFloat(price),
        offers_online_sessions: method === 'Online',
        offers_initial_consultation: true,
      });

      // Then, update availability
      const availabilityData = [];
      Object.keys(selectedSlots).forEach(key => {
        if (selectedSlots[key]) {
          const [day, time] = key.split('_');
          availabilityData.push({
            day_of_week: day,
            start_time: time,
            end_time: moment(time, 'HH:mm').add(1, 'hour').format('HH:mm'),
            is_available: true
          });
        }
      });

      if (availabilityData.length > 0) {
        // Clear existing availability and create new ones
        await api.post('/api/psychologists/availability/bulk_create/', {
          availability_slots: availabilityData
        });
      }

      Alert.alert('Thành công', 'Thông tin làm việc đã được cập nhật!');
    } catch (error) {
      console.error('Error updating work info:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Schedule Grid */}
      <View style={styles.gridSection}>
        <Text style={styles.title}>Lịch làm việc</Text>
        <Text style={styles.subText}>Chọn các khung giờ bạn có thể làm việc.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.row}>
              <View style={styles.headerCell}>
                <Text style={styles.headerText}>Giờ</Text>
              </View>
              {days.map((day) => (
                <View key={day} style={styles.headerCell}>
                  <Text style={styles.headerText}>
                    {day === 'Monday' ? 'T2' : 
                     day === 'Tuesday' ? 'T3' : 
                     day === 'Wednesday' ? 'T4' : 
                     day === 'Thursday' ? 'T5' : 
                     day === 'Friday' ? 'T6' : 
                     day === 'Saturday' ? 'T7' : 'CN'}
                  </Text>
                </View>
              ))}
            </View>

            {hours.map((hour) => (
              <View key={hour} style={styles.row}>
                <View style={styles.timeCell}>
                  <Text style={styles.timeText}>{hour}</Text>
                </View>
                {days.map((day) => {
                  const key = `${day}_${hour}`;
                  const selected = selectedSlots[key];
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.cell, selected && styles.cellSelected]}
                      onPress={() => toggleSlot(day, hour)}
                    >
                      {selected && <Text style={styles.tick}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Profile Info Section */}
      <View style={styles.formSection}>
        <Text style={styles.title}>Thông tin hồ sơ làm việc</Text>

        <TouchableOpacity onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ color: '#888' }}>Nhấn để tải ảnh</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={styles.title1}>Giới thiệu</Text>
        <TextInput
          placeholder="Giới thiệu về bản thân và kinh nghiệm..."
          placeholderTextColor="#999"
          style={styles.inputIntro}
          value={introduction}
          onChangeText={setIntroduction}
          multiline
          numberOfLines={4}
        />
        
        <Text style={styles.title1}>Lĩnh vực chuyên môn</Text>
        <TextInput
          placeholder="Ví dụ: Tâm lý trẻ em, Rối loạn lo âu..."
          placeholderTextColor="#999"
          style={styles.input}
          value={specialized}
          onChangeText={setSpecialized}
        />
        
        <Text style={styles.title1}>Giá tiền 1 buổi/1 giờ (VND)</Text>
        <TextInput
          placeholder="Nhập giá tiền"
          placeholderTextColor="#999"
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        
        <Text style={styles.title1}>Hình thức tư vấn</Text>
        <View style={styles.methodContainer}>
          {methods.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMethod(m)}
              style={[
                styles.methodButton,
                method === m && styles.methodButtonSelected,
              ]}
            >
              <Text style={[styles.methodText, method === m && styles.methodTextSelected]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          onPress={handleSubmit} 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Đang lưu...' : 'Lưu thông tin'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default WorkInfo;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  gridSection: {
    marginBottom: 30,
  },
  formSection: {
    paddingBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subText: {
    color: '#777',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCell: {
    width: 100,
    padding: 6,
    backgroundColor: '#eee',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  headerText: {
    fontWeight: 'bold',
  },
  timeCell: {
    width: 100,
    padding: 6,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#ddd',
    height: 40,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cell: {
    width: 100,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  cellSelected: {
    backgroundColor: '#6c63ff',
  },
  tick: {
    color: '#fff',
    fontSize: 16,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  methodContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  methodButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 6,
    marginRight: 10,
  },
  methodButtonSelected: {
    backgroundColor: '#6c63ff',
  },
  methodText: {
    color: '#333',
  },
  methodTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#6c63ff',
    padding: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  title1: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 12,
  },
    inputIntro: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
});
