import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
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

const Register = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd1, setShowPwd1] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [userType, setUserType] = useState('Parent'); // Default value
  const [userTimezone, setUserTimezone] = useState('UTC');  // Default timezone


// For EAS builds, use your custom scheme
const redirectUri = Constants.expoConfig?.hostUri 
  ? 'https://auth.expo.io/@fusia/Discova'  // Development (Expo Go only)
  : 'discova://';  // EAS builds (your deployed app)

const [requestGoogle, responseGoogle, promptGoogle] = Google.useAuthRequest({
  expoClientId: '973045964577-fisrk4ckqb2rv7nolon0hmuk1c78ua36.apps.googleusercontent.com',
  iosClientId: '973045964577-53veuk6btpi3da7h9gerl112ieoauef7.apps.googleusercontent.com', 
  androidClientId: '973045964577-3bffk3umbtsdgm5f26ud3folptakl2sv.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
  redirectUri,
});

  useEffect(() => {
    if (requestGoogle) {
      console.log("Actual redirect URI:", redirectUri);
    }
  }, [requestGoogle, responseGoogle]);

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
        useNativeDriver: false, // Disable for web compatibility
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false, // Disable for web compatibility
      }),
    ]).start();
  }, []);

  const animatePressIn = () => {
    Animated.spring(fadeAnim, {
      toValue: 0.95,
      friction: 8,
      tension: 40,
      useNativeDriver: false, // Disable for web compatibility
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(fadeAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: false, // Disable for web compatibility
    }).start();
  };

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

            <View style={styles.pwdWrapper}>
              <TextInput
                style={styles.input2}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor="#A1A4B2"
                secureTextEntry={!showPwd1}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
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
  Text12: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 15,
    color: '#333',
  },
  userTypeContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  userTypeButtonActive: {
    backgroundColor: '#6c63ff',
    borderColor: '#6c63ff',
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  userTypeTextActive: {
    color: '#fff',
  },
  policyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  Text3: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  terms: {
    color: '#6c63ff',
    fontWeight: '600',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#6c63ff',
    borderRadius: 4,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxTick: {
    width: 10,
    height: 10,
    backgroundColor: '#6c63ff',
    borderRadius: 2,
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
});
