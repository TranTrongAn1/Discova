import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import api from './api';

const Payment = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedPlan) {
      Alert.alert('Thông báo', 'Vui lòng chọn một gói đăng ký.');
      return;
    }

    setLoading(true);
    try {
      // Here you would integrate with your payment gateway
      // For now, we'll simulate a successful payment
      
      // Update user subscription status
      const userType = await AsyncStorage.getItem('user_type');
      const userId = await AsyncStorage.getItem('user_id');
      
      if (userType === 'Psychologist') {
        // Update psychologist subscription
        await api.patch(`/api/psychologists/manage/${userId}/`, {
          subscription_plan: selectedPlan,
          subscription_status: 'active'
        });
      }

      Alert.alert(
        'Thanh toán thành công!',
        `Bạn đã đăng ký gói ${selectedPlan} VND/tháng. Bây giờ hãy tạo hồ sơ của bạn.`,
        [
          {
            text: 'Tiếp tục',
            onPress: () => {
              // Redirect to profile creation
              router.replace('/(Pychologist)/EditProfile');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Đăng ký để trở thành chuyên gia trên nền tảng của chúng tôi</Text>

      <View style={styles.planContainer}>
        <TouchableOpacity
          style={[
            styles.planOption,
            selectedPlan === '800.000' && styles.selectedPlan,
          ]}
          onPress={() => setSelectedPlan('800.000')}
        >
          <Text style={styles.price}>800.000 VND / tháng</Text>
          <Text style={styles.desc}>
            ⭐ Gói Cơ Bản:
            {'\n'}• Hiển thị hồ sơ cơ bản
            {'\n'}• 10 lượt kết nối khách hàng mỗi tháng
            {'\n'}• Hỗ trợ kỹ thuật qua email
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.planOption,
            selectedPlan === '1.500.000' && styles.selectedPlan,
          ]}
          onPress={() => setSelectedPlan('1.500.000')}
        >
          <Text style={styles.price}>1.500.000 VND / tháng</Text>
          <Text style={styles.desc}>
            💼 Gói Chuyên Nghiệp:
            {'\n'}• Ưu tiên hiển thị hồ sơ
            {'\n'}• Kết nối không giới hạn với khách hàng
            {'\n'}• Hỗ trợ kỹ thuật 24/7
            {'\n'}• Báo cáo hiệu suất cá nhân hàng tháng
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleContinue}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Đang xử lý...' : 'Tiếp tục'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Payment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 70,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  planContainer: {
    marginBottom: 30,
  },
  planOption: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  selectedPlan: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
