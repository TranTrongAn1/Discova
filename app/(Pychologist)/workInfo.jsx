import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const hours = [
  '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
  '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const methods = ['Trực tiếp', 'Online'];

const WorkInfo = () => {
  const [selectedSlots, setSelectedSlots] = useState({});
  const [image, setImage] = useState(null);
  const [introduction, setIntroduction] = useState('');
  const [specialized, setSpecialized] = useState('');
  const [price, setPrice] = useState('');
  const [method, setMethod] = useState('Trực tiếp');

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

  const handleSubmit = () => {
    const data = {
      image,
      introduction,
      specialized,
      price,
      method,
      selectedSlots,
    };
    Alert.alert('Data Submitted', JSON.stringify(data, null, 2));
    // Here you could POST to an API instead
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Schedule Grid */}
      <View style={styles.gridSection}>
        <Text style={styles.title}>Work Schedule</Text>
        <Text style={styles.subText}>Select your available time slots.</Text>

        <ScrollView horizontal>
          <View>
            <View style={styles.row}>
              <View style={styles.headerCell}><Text style={styles.headerText}>Time</Text></View>
              {days.map((day) => (
                <View key={day} style={styles.headerCell}>
                  <Text style={styles.headerText}>{day}</Text>
                </View>
              ))}
            </View>

            {hours.map((hour) => (
              <View key={hour} style={styles.row}>
                <View style={styles.timeCell}><Text style={styles.timeText}>{hour}</Text></View>
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
        <Text style={styles.title}>Work Profile Info</Text>

        <TouchableOpacity onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ color: '#888' }}>Tap to upload photo</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.title1}>Giới thiệu</Text>
        <TextInput
          placeholder="Introduction"
          placeholderTextColor="#999"
          style={styles.inputIntro}
          value={introduction}
          onChangeText={setIntroduction}
          multiline
        />
        <Text style={styles.title1}>Lĩnh vực</Text>
        <TextInput
          placeholder="Specialized in..."
          placeholderTextColor="#999"
          style={styles.input}
          value={specialized}
          onChangeText={setSpecialized}
        />
        <Text style={styles.title1}>Giá tiền 1 buổi/1 giờ</Text>
        <TextInput
          placeholder="Giá tiền ($)"
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
              <Text style={{ color: method === m ? '#fff' : '#333' }}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={{ color: '#fff' }}>Lưu</Text>
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
  submitButton: {
    backgroundColor: '#6c63ff',
    padding: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
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
