import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as AuthSession from 'expo-auth-session';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const redirectUri = AuthSession.makeRedirectUri({
  useProxy: true,
  scheme: 'discova',
});

const Register = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd1, setShowPwd1] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [userType, setUserType] = useState('Parent');
  const [userTimezone, setUserTimezone] = useState('UTC');

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
        user_type: userType,
      };

      const { data } = await axios.post(endpoint, payload);

      Toast.show({
        type: 'success',
        text1: `Đăng nhập với ${provider} thành công!`,
      });

      router.replace('/login');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: `Đăng nhập với ${provider} thất bại`,
        text2: error.response?.data?.message || error.message,
      });
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: '#fff' }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <Toast />
            <TouchableOpacity style={styles.backButton} onPress={router.back}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.Welcome}>Tạo Tài Khoản</Text>

            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton} onPress={() => promptFacebook()}>
                <Ionicons name="logo-facebook" size={24} color="#fff" />
                <Text style={styles.socialText}>Đăng ký với Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#DB4437' }]} onPress={() => promptGoogle()}>
                <Ionicons name="logo-google" size={24} color="#fff" />
                <Text style={styles.socialText}>Đăng ký với Google</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.Text}>HOẶC ĐĂNG KÝ BẰNG EMAIL</Text>

            <TextInput
              style={styles.input}
              placeholder="Địa chỉ email"
              placeholderTextColor="#A1A4B2"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <View style={styles.pwdWrapper}>
              <TextInput
                style={styles.input2}
                placeholder="Mật khẩu"
                placeholderTextColor="#A1A4B2"
                secureTextEntry={!showPwd}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                <Ionicons name={showPwd ? 'eye-off' : 'eye'} size={22} color="#A1A4B2" />
              </TouchableOpacity>
            </View>

            <View style={styles.pwdWrapper}>
              <TextInput
                style={styles.input2}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor="#A1A4B2"
                secureTextEntry={!showPwd1}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
              />
              <TouchableOpacity onPress={() => setShowPwd1(!showPwd1)} style={styles.eyeBtn}>
                <Ionicons name={showPwd1 ? 'eye-off' : 'eye'} size={22} color="#A1A4B2" />
              </TouchableOpacity>
            </View>

            <Text style={styles.Text12}>Bạn là</Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[styles.userTypeButton, userType === 'Parent' && styles.userTypeButtonActive]}
                onPress={() => setUserType('Parent')}
              >
                <Text style={[styles.userTypeText, userType === 'Parent' && styles.userTypeTextActive]}>
                  Phụ huynh
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.userTypeButton, userType === 'Psychologist' && styles.userTypeButtonActive]}
                onPress={() => setUserType('Psychologist')}
              >
                <Text style={[styles.userTypeText, userType === 'Psychologist' && styles.userTypeTextActive]}>
                  Chuyên gia
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.policyContainer}>
              <Text style={styles.Text3}>
                Tôi đã đọc <Text style={styles.terms}>Chính sách quyền riêng tư</Text>
              </Text>
              <TouchableOpacity style={styles.checkbox} onPress={() => setAgreePolicy(!agreePolicy)}>
                {agreePolicy && <View style={styles.checkboxTick} />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.Button}
              activeOpacity={0.8}
              onPress={async () => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!email || !password || !passwordConfirm) {
                  Toast.show({ type: 'error', text1: 'Vui lòng điền đầy đủ thông tin' });
                  return;
                }

                if (!emailRegex.test(email)) {
                  Toast.show({ type: 'error', text1: 'Email không hợp lệ' });
                  return;
                }

                if (password.length < 6) {
                  Toast.show({ type: 'error', text1: 'Mật khẩu phải có ít nhất 6 ký tự' });
                  return;
                }

                if (password !== passwordConfirm) {
                  Toast.show({ type: 'error', text1: 'Mật khẩu không khớp' });
                  return;
                }

                if (!agreePolicy) {
                  Toast.show({ type: 'error', text1: 'Bạn cần đồng ý với chính sách quyền riêng tư' });
                  return;
                }

                try {
                  await axios.post('https://kmdiscova.id.vn/api/auth/register/', {
                    email,
                    password,
                    password_confirm: passwordConfirm,
                    user_type: userType,
                    user_timezone: userTimezone,
                  });

                  Toast.show({ type: 'success', text1: 'Đăng ký thành công!' });
                  router.replace('/login');
                } catch (error) {
                  const message = error.response?.data?.message || error.message || 'Đăng ký thất bại!';
                  Toast.show({ type: 'error', text1: message });
                }
              }}
            >
              <Text style={styles.buttonText}>BẮT ĐẦU</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Register;
