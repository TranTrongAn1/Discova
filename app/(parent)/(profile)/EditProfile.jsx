import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter, useSearchParams } from 'expo-router';

const EditProfile = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');

  // Populate the inputs when component mounts and params are available
  useEffect(() => {
    if (params) {
      setFirstName(params.first_name || '');
      setLastName(params.last_name || '');
      setPhoneNumber(params.phone || '');
      setAddress1(params.address1 || '');
      setAddress2(params.address2 || '');
    }
  }, [params]);

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      await axios.patch(
        'http://127.0.0.1:8000/api/parents/profile/update_profile/',
        {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          address_line1: address1,
          address_line2: address2,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      Alert.alert('✅ Thành công', 'Thông tin đã được cập nhật');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      Alert.alert('❌ Lỗi', 'Không thể cập nhật thông tin');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Chỉnh sửa thông tin</Text>
      <Text style={styles.head}>Họ</Text>
      <TextInput
        style={styles.input}
        placeholder="Họ"
        value={firstName}
        onChangeText={setFirstName}
      />
      <Text style={styles.head}>Tên</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên"
        value={lastName}
        onChangeText={setLastName}
      />
      <Text style={styles.head}>Số Điện Thoại</Text>
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <Text style={styles.head}>Địa chỉ 1</Text>
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ dòng 1"
        value={address1}
        onChangeText={setAddress1}
      />
      <Text style={styles.head}>Địa chỉ 2</Text>
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ dòng 2"
        value={address2}
        onChangeText={setAddress2}
      />

      <Button title="Lưu" onPress={handleSave} />
    </ScrollView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  head: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
