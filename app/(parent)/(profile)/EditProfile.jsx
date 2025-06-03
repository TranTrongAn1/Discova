import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import api from '../../(auth)/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const EditProfile = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
const [imageUrl, setImageUrl] = useState('');

const pickImageAndUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your media library');
      return;
    }


      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });


  if (!result.canceled) {
    const image = result.assets[0];
    const formData = new FormData();
    formData.append('file', {
      uri: image.uri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });
    formData.append('upload_preset', 'converts'); // Replace with your actual unsigned preset

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/du7snch3r/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setImageUrl(data.secure_url);
      Alert.alert('✅ Tải ảnh thành công');
    } catch (err) {
      console.error('Upload failed:', err);
      Alert.alert('❌ Lỗi', 'Tải ảnh thất bại');
    }
  }
};

  // Populate the inputs when component mounts and params are available
useEffect(() => {
  if (params && Object.keys(params).length > 0) {
    setFirstName(String(params.first_name || ''));
    setLastName(String(params.last_name || ''));
    setPhoneNumber(String(params.phone || ''));
    setAddress1(String(params.address_line1 || ''));
    setAddress2(String(params.address_line2 || ''));
     setImageUrl(String(params.profile_picture_url || ''));
  }
}, []); // Remove params from dependency array

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      await api.patch(
        'api/parents/profile/update_profile/',
        {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          address_line1: address1,
          address_line2: address2,
           profile_picture_url: imageUrl,
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
      <Text style={styles.head}>Ảnh đại diện</Text>
        <TouchableOpacity onPress={pickImageAndUpload} style={styles.uploadButton}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>Chọn ảnh</Text>
        </TouchableOpacity>

        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 100, height: 100, borderRadius: 50, marginVertical: 10 }}
          />
        ) : null}

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
      <Text style={styles.head}>Số nhà</Text>
      <TextInput
        style={styles.input}
        placeholder="Số nhà"
        value={address1}
        onChangeText={setAddress1}
      />
      <Text style={styles.head}>Địa chỉ nhà </Text>
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ nhà"
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
  uploadButton: {
  backgroundColor: '#7B8CE4',
  paddingVertical: 10,
  borderRadius: 6,
  marginBottom: 15,
},

});
