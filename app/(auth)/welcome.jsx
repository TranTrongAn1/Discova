import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Welcome = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.timing(translateY, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkUserTypeAndRedirect = async () => {
    try {
      const userType = await AsyncStorage.getItem('user_type');

      if (userType === 'Parent') {
        router.replace('/(parent)/home');
      } else if (userType === 'Psychologist') {
        router.replace('/payment');
      } else {
        console.warn('Unknown user type:', userType);
      }
    } catch (error) {
      console.error('Error reading user_type:', error);
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
