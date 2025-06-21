import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { router, useNavigation } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Toast from 'react-native-toast-message';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (loading) return;

    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please enter both email and password',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('=== LOGIN DEBUG START ===');
      console.log('Attempting login with email:', email);
      
      const response = await axios.post('https://kmdiscova.id.vn/api/auth/login/', {
        email,
        password,
      });

      console.log('Login response:', response.data);
      
      const { token, user } = response.data;

      console.log('Token received:', token ? token.substring(0, 20) + '...' : 'null');
      console.log('User data:', user);

      // Save token and user info to AsyncStorage
      await AsyncStorage.setItem('access_token', token);
      await AsyncStorage.setItem('user_type', user.user_type);
      await AsyncStorage.setItem('user_id', user.id.toString());

      console.log('Data saved to AsyncStorage');
      
      // Verify token was saved correctly
      const savedToken = await AsyncStorage.getItem('access_token');
      const savedUserType = await AsyncStorage.getItem('user_type');
      console.log('Verification - Saved token exists:', !!savedToken);
      console.log('Verification - Saved token value:', savedToken ? savedToken.substring(0, 20) + '...' : 'null');
      console.log('Verification - Saved user type:', savedUserType);
      console.log('Verification - Token matches:', savedToken === token);
      
      console.log('=== LOGIN DEBUG END ===');

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Redirecting you...',
      });

      // Simply redirect to welcome page - let it handle the flow
      router.replace('/welcome');

      setLoading(false);
    } catch (error) {
      console.log('Login error:', error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.response?.data?.message || 'Invalid credentials',
      });
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Reset animation values
      fadeAnim.setValue(0);
      slideAnim.setValue(50);

      // Start animation again
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start();
    }, [])
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: '#fff' }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Toast position="top" visibilityTime={4000} topOffset={50} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack?.()) {
                navigation.goBack();
              } else {
                router.replace('/');
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Animated.View
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <Text style={styles.Welcome}>CHÀO MỪNG TRỞ LẠI!</Text>

            <Text style={styles.Welcome}>Facebook</Text>
            <Text style={styles.Welcome}>Google</Text>

            <Text style={styles.Text}>HOẶC ĐĂNG NHẬP BẰNG EMAIL</Text>

            <TextInput
              style={styles.input}
              placeholder="Địa chỉ email"
              placeholderTextColor="#A1A4B2"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#A1A4B2"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity 
              style={[styles.Button, loading && { opacity: 0.6 }]} 
              activeOpacity={0.8} 
              onPress={handleLogin} 
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.Text3}>Quên mật khẩu?</Text>

            <View style={styles.RegisterContainer}>
              <Text style={styles.Text}>CHƯA CÓ TÀI KHOẢN?</Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}>ĐĂNG KÝ</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 0,
    margin: 0,
    minHeight: 700, 
  },
  Welcome: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Helvetica Neue',
  },
  backButton: {
    borderColor: '#EBEAEC',
    borderWidth: 1,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    marginLeft: 20,
  },
  Text: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#A1A4B2',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  input: {
    height: 70,
    borderColor: '#EBEAEC',
    backgroundColor: '#F2F3F7',
    borderWidth: 1,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    width: SCREEN_WIDTH - 70,
    color: '#000',
    alignSelf: 'center',
  },
  Button: {
    backgroundColor: '#8E97FD',
    borderRadius: 50,
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginTop: 20,
    width: SCREEN_WIDTH - 70,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  Text3: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  RegisterContainer: {
    marginTop: 70,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerLink: {
    color: '#8E97FD',
    fontWeight: 'bold',
  },
});