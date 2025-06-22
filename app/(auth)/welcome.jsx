import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { clearTokens } from './api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Welcome = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false, // Disable native driver for web compatibility
    }).start();

    Animated.timing(translateY, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: false, // Disable native driver for web compatibility
    }).start();
  }, []);

  const checkUserTypeAndRedirect = async () => {
    try {
      console.log('=== WELCOME DEBUG START ===');
      
      const userType = await AsyncStorage.getItem('user_type');
      const token = await AsyncStorage.getItem('access_token');

      console.log('Welcome - User type:', userType);
      console.log('Welcome - Token exists:', !!token);
      console.log('Welcome - Token value:', token ? token.substring(0, 20) + '...' : 'null');

      if (!token) {
        console.log('No token found, redirecting to login');
        router.replace('/login');
        return;
      }

      // Test API call first with better error handling
      console.log('Testing API call...');
      try {
        const testResponse = await fetch('https://kmdiscova.id.vn/api/auth/me/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Test API response status:', testResponse.status);
        
        if (testResponse.status === 401) {
          console.log('Token is invalid, clearing and redirecting to login');
          await clearTokens();
          router.replace('/login');
          return;
        } else if (testResponse.status === 200) {
          console.log('Token is valid, proceeding with navigation');
        }
      } catch (apiError) {
        console.log('Test API call failed:', apiError);
        // If API test fails, we'll still try to proceed but log the issue
        console.log('Proceeding despite API test failure...');
      }

      if (userType === 'Parent') {
        console.log('Parent user, redirecting to home');
        router.replace('/(parent)/home');
      } else if (userType === 'Psychologist') {
        console.log('Psychologist user, redirecting to profile');
        router.replace('/(Pychologist)/profile');
      } else {
        console.warn('Unknown user type:', userType);
        Alert.alert('Error', 'Unknown account type. Please login again.');
        await clearTokens();
        router.replace('/login');
      }
      
      console.log('=== WELCOME DEBUG END ===');
    } catch (error) {
      console.error('Error reading user_type:', error);
      Alert.alert('Error', 'Cannot read account information. Please login again.');
      router.replace('/login');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.textWrapper, {
        opacity: fadeAnim,
        transform: [{ translateY }]
      }]}>
        <Text style={styles.text1}>Chào mừng</Text>
        <Text style={styles.text2}>Đến với K&MDiscova</Text>
        <Text style={styles.text3}>Chúng tôi sẽ giúp bạn kết nối với chuyên gia</Text>
        <Text style={styles.text4}>phù hợp để hỗ trợ con bạn tốt nhất</Text>
      </Animated.View>

      <Animated.View style={{
        opacity: fadeAnim,
        transform: [{ translateY }]
      }}>
        <TouchableOpacity style={styles.Button} activeOpacity={0.8} onPress={checkUserTypeAndRedirect}>
          <Text style={styles.buttonText}>BẮT ĐẦU</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8E97FD',
    justifyContent: 'space-between',
  },
  textWrapper: {
    marginTop: 150,
  },
  text1: {
    fontSize: 30,
    color: '#fff',
    textAlign: 'center',
  },
  text2: {
    fontSize: 30,
    color: '#fff',
    textAlign: 'center',
  },
  text3: {
    marginTop: 10,
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  text4: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  Button: {
    backgroundColor: '#EBEAEC',
    borderRadius: 50,
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginBottom: 150,
    width: SCREEN_WIDTH - 70,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#3F414E',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
