import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as AuthSession from 'expo-auth-session';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import { router, useNavigation } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Toast from 'react-native-toast-message';

WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const redirectUri = AuthSession.makeRedirectUri({
  useProxy: true,
  scheme: 'discova',
});

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const navigation = useNavigation();

  // Google Auth
  const [requestGoogle, responseGoogle, promptGoogle] = Google.useAuthRequest({
    expoClientId: '973045964577-fisrk4ckqb2rv7nolon0hmuk1c78ua36.apps.googleusercontent.com',
    iosClientId: '973045964577-fisrk4ckqb2rv7nolon0hmuk1c78ua36.apps.googleusercontent.com',
    androidClientId: '973045964577-fisrk4ckqb2rv7nolon0hmuk1c78ua36.apps.googleusercontent.com',
    webClientId: '973045964577-fisrk4ckqb2rv7nolon0hmuk1c78ua36.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    redirectUri,
  });

  useEffect(() => {
    if (requestGoogle) {
      console.log("Generated proxy URI:", redirectUri);
      const customUri = AuthSession.makeRedirectUri({ useProxy: false });
      const schemeUri = AuthSession.makeRedirectUri({ scheme: 'discova', useProxy: false });

      console.log("=== REDIRECT URI DEBUG ===");
      console.log("Custom URI:", customUri);
      console.log("Scheme URI:", schemeUri);
      console.log("Request config:", JSON.stringify(requestGoogle, null, 2));
      console.log("========================");
    }
  }, [requestGoogle]);

  useEffect(() => {
    console.log("=== RESPONSE DEBUG ===");
    console.log("Google Response:", JSON.stringify(responseGoogle, null, 2));
    console.log("=====================");

    if (responseGoogle?.type === 'success') {
      const token = responseGoogle.authentication.accessToken;
      handleSocialLogin('google', token);
    } else if (responseGoogle?.type === 'error') {
      console.log("Google Auth Error:", responseGoogle.error);
      Toast.show({
        type: 'error',
        text1: 'Google Auth Error',
        text2: responseGoogle.error?.message || 'Unknown error',
      });
    }
  }, [responseGoogle]);

  // Facebook Auth
  const [requestFacebook, responseFacebook, promptFacebook] = Facebook.useAuthRequest({
    clientId: '1427302181956582',
  });

  useEffect(() => {
    if (responseFacebook?.type === 'success') {
      const token = responseFacebook.authentication.accessToken;
      handleSocialLogin('facebook', token);
    }
  }, [responseFacebook]);

  const handleSocialLogin = async (provider, token) => {
    try {
      const endpoint = provider === 'google'
        ? 'https://kmdiscova.id.vn/api/auth/google_auth/'
        : 'https://kmdiscova.id.vn/api/auth/facebook_auth/';

      const payload = {
        [`${provider}_token`]: token,
      };

      const { data } = await axios.post(endpoint, payload);

      Toast.show({
        type: 'success',
        text1: `Đăng nhập với ${provider} thành công!`,
      });

      // Save token and user info to AsyncStorage
      await AsyncStorage.setItem('access_token', data.token);
      await AsyncStorage.setItem('user_type', data.user.user_type);
      await AsyncStorage.setItem('user_id', data.user.id.toString());

      router.replace('/welcome');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: `Đăng nhập với ${provider} thất bại`,
        text2: error.response?.data?.message || error.message,
      });
    }
  };

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
          useNativeDriver: false, // Disable for web compatibility
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false, // Disable for web compatibility
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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <Toast />
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(auth)/welcome')}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.Welcome}>Chào Mừng Trở Lại!</Text>

            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton} onPress={() => promptFacebook()}>
                <Ionicons name="logo-facebook" size={24} color="#fff" />
                <Text style={styles.socialText}>Đăng nhập với Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#DB4437' }]} onPress={() => promptGoogle()}>
                <Ionicons name="logo-google" size={24} color="#fff" />
                <Text style={styles.socialText}>Đăng nhập với Google</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.Text}>HOẶC ĐĂNG NHẬP BẰNG EMAIL</Text>

            <TextInput
              style={styles.input}
              placeholder="Địa chỉ email"
              placeholderTextColor="#A1A4B2"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />

            <View style={styles.pwdWrapper}>
              <TextInput
                style={styles.input2}
                placeholder="Mật khẩu"
                placeholderTextColor="#A1A4B2"
                secureTextEntry={!showPwd}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                <Ionicons name={showPwd ? 'eye-off' : 'eye'} size={22} color="#A1A4B2" />
              </TouchableOpacity>
            </View>

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
              <Text style={styles.Text}>CHƯA CÓ TÀI KHOẢN? </Text>
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  Welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 30,
    color: '#333',
  },
  socialContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1877F2',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  socialText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  Text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    outlineStyle: 'none',
    ...Platform.select({
      web: {
        cursor: 'text',
        userSelect: 'text',
        WebkitUserSelect: 'text',
        MozUserSelect: 'text',
      },
    }),
  },
  pwdWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#fff',
    outlineStyle: 'none',
  },
  input2: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    outlineStyle: 'none',
    ...Platform.select({
      web: {
        cursor: 'text',
        userSelect: 'text',
        WebkitUserSelect: 'text',
        MozUserSelect: 'text',
      },
    }),
  },
  eyeBtn: {
    padding: 15,
  },
  Button: {
    backgroundColor: '#6c63ff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  Text3: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    color: '#6c63ff',
  },
  RegisterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  registerLink: {
    color: '#6c63ff',
    fontWeight: 'bold',
    marginLeft: 0,
    marginTop: 2,
  },
});