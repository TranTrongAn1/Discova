import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import api from '../../(auth)/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
const SubmitChildProfile = () => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    nickname: '',
    gender: '',
    date_of_birth: '',
    height_cm: '',
    weight_kg: '',
    health_status: '',
    medical_history: '',
    vaccination_status: false,
    emotional_issues: '',
    social_behavior: '',
    developmental_concerns: '',
    family_peer_relationship: '',
    has_seen_psychologist: false,
    has_received_therapy: false,
    parental_goals: '',
    activity_tips: '',
    parental_notes: '',
    primary_language: '',
    school_grade_level: '',
    profile_picture_url: '',
    consent_forms_signed: {},
  });

  const [mode, setMode] = useState('view'); // 'view' | 'edit' | 'create'
  const [childId, setChildId] = useState(null);
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
    formData.append('upload_preset', 'converts'); // Use your Cloudinary preset

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/du7snch3r/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setForm((prev) => ({ ...prev, profile_picture_url: data.secure_url }));
      Alert.alert('✅ Tải ảnh thành công');
    } catch (err) {
      console.error('Upload failed:', err);
      Alert.alert('❌ Lỗi', 'Tải ảnh thất bại');
    }
  }
};
  useEffect(() => {
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
          setForm(child);
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
    fetchProfile();
  }, []);


  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };
        const handleSubmit = async () => {
        try {
          const token = await AsyncStorage.getItem('access_token');
          if (!token) {
            console.warn('No token found');
            return;
          }

          const payload = { ...form };

          if (mode === 'edit') {
            await api.patch(`/api/children/profile/${childId}/`, payload, {
              headers: {
                Authorization: `Token ${token}`,
              },
            });
            Alert.alert('Thành công', 'Đã cập nhật hồ sơ.');
            setMode('view');
          } else {
            await api.post('/api/children/profile/', payload, {
              headers: {
                Authorization: `Token ${token}`,
              },
            });
            Alert.alert('Thành công', 'Hồ sơ đã được tạo!');
            setMode('view');
          }
        } catch (error) {
          console.error(error);
          Alert.alert('Lỗi', 'Không thể gửi hồ sơ.');
        }
      };

        const renderField = (label, key, isNumeric = false, isBool = false) => {
        let displayLabel = label;
        if (key === 'date_of_birth') {
          displayLabel += ' (YYYY-MM-DD)';  // Add format hint to label
        }
        if (mode === 'view') {
          return (
            <View style={styles.readOnlyField}>
              <Text style={styles.label}>{displayLabel}</Text>
              <Text style={styles.value}>{form[key]?.toString() || '—'}</Text>
            </View>
          );
        }
        return (
          <>
            <Text style={styles.label}>{displayLabel}</Text>
            <TextInput
              style={styles.input}
              value={form[key]?.toString()}
              onChangeText={(text) => {
                // Remove special formatting for date_of_birth
                handleChange(key, isBool ? text === 'true' : isNumeric ? Number(text) : text);
              }}
              keyboardType={isNumeric ? 'numeric' : 'default'}
              placeholder={key === 'date_of_birth' ? 'YYYY-MM-DD' : ''}
            />
          </>
        );
      };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {mode === 'view' ? 'Hồ sơ của bé' : mode === 'edit' ? 'Chỉnh sửa hồ sơ' : 'Tạo hồ sơ cho bé'}
      </Text>

      <View style={styles.formGroup}>
        {renderField('Họ', 'first_name')}
        {renderField('Tên', 'last_name')}
        {renderField('Tên gọi ở nhà', 'nickname')}
        {renderField('Giới tính', 'gender')}
        {renderField('Ngày sinh', 'date_of_birth')}
        {renderField('Chiều cao (cm)', 'height_cm', true)}
        {renderField('Cân nặng (kg)', 'weight_kg', true)}
        {renderField('Tình trạng sức khỏe', 'health_status')}
        {renderField('Tiền sử bệnh lý', 'medical_history')}
        {renderField('Vấn đề cảm xúc', 'emotional_issues')}
        {renderField('Hành vi xã hội', 'social_behavior')}
        {renderField('Quan ngại phát triển', 'developmental_concerns')}
        {renderField('Quan hệ với gia đình/bạn bè', 'family_peer_relationship')}
        {renderField('Mục tiêu của phụ huynh', 'parental_goals')}
        {renderField('Gợi ý hoạt động', 'activity_tips')}
        {renderField('Ghi chú khác', 'parental_notes')}
        {renderField('Ngôn ngữ chính', 'primary_language')}
        {renderField('Cấp học hiện tại', 'school_grade_level')}
      </View>
      <TouchableOpacity style={styles.buttonOutline} onPress={pickImageAndUpload}>
        <Text style={styles.buttonOutlineText}>Chọn ảnh hồ sơ</Text>
      </TouchableOpacity>

      {form.profile_picture_url ? (
        <Image
          source={{ uri: form.profile_picture_url }}
          style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
        />
      ) : null}

      {mode === 'view' ? (
        <TouchableOpacity style={styles.buttonOutline} onPress={() => setMode('edit')}>
          <Text style={styles.buttonOutlineText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Lưu</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default SubmitChildProfile;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formGroup: {
    marginBottom: 30,
  },
  label: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#555',
  },
  value: {
    fontSize: 14,
    paddingVertical: 4,
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  readOnlyField: {
    marginBottom: 12,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#5DB075',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonOutline: {
    marginTop: 20,
    borderColor: '#5DB075',
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonOutlineText: {
    color: '#5DB075',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
