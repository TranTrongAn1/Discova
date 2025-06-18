import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import axios from 'axios';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Register = ({ onSwitch }) => {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [showPwd, setShowPwd]  = useState(false); 
  const [showPwd1, setShowPwd1]  = useState(false); 
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [userType, setUserType] = useState('Parent'); // Default value
  const [userTimezone, setUserTimezone] = useState('UTC');  // Default timezone

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
          style={{ flex: 1, backgroundColor:'#fff' }}
        >
    {/* scroll in case content is still taller than screen */}
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }}
      >

      <Toast />
     <TouchableOpacity style={styles.backButton} onPress={router.back}>
        <Ionicons name="arrow-back" size={24} color="black" />
     </TouchableOpacity>


      <Text style={styles.Welcome}>Tạo Tài Khoản</Text>

      {/* Social sign-up placeholders */}
      <Text style={styles.Welcome}>Facebook</Text>
      <Text style={styles.Welcome}>Google</Text>

      <Text style={styles.Text}>HOẶC ĐĂNG KÝ BẰNG EMAIL</Text>


      {/* Địa chỉ email */}
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ email"
        placeholderTextColor="#A1A4B2"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Mật khẩu */}
        <View style={styles.pwdWrapper}>
        <TextInput
            style={styles.input2}
            placeholder="Mật khẩu"
            placeholderTextColor="#A1A4B2"
            secureTextEntry={!showPwd}
            value={password}
            onChangeText={setPassword}
        />
        <TouchableOpacity
            onPress={() => setShowPwd(!showPwd)}
            style={styles.eyeBtn}
        >
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
        <TouchableOpacity
            onPress={() => setShowPwd1(!showPwd1)}
            style={styles.eyeBtn}
        >
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
              <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAgreePolicy(!agreePolicy)}
        >
            {agreePolicy && <View style={styles.checkboxTick} />}
        </TouchableOpacity>
        </View>

            {/* Đăng ký */}
      <TouchableOpacity style={styles.Button} activeOpacity={0.8} onPress={async () => {
            // Basic validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!email || !password || !passwordConfirm) {
              Toast.show({
                type: 'error',
                text1: 'Vui lòng điền đầy đủ thông tin',
              });
              return;
            }

            if (!emailRegex.test(email)) {
              Toast.show({
                type: 'error',
                text1: 'Email không hợp lệ',
              });
              return;
            }

            if (password.length < 6) {
              Toast.show({
                type: 'error',
                text1: 'Mật khẩu phải có ít nhất 6 ký tự',
              });
              return;
            }

            if (password !== passwordConfirm) {
              Toast.show({
                type: 'error',
                text1: 'Mật khẩu không khớp',
              });
              return;
            }

            if (!agreePolicy) {
              Toast.show({
                type: 'error',
                text1: 'Bạn cần đồng ý với chính sách quyền riêng tư',
              });
              return;
            }

            const payload = {
              email,
              password,
              password_confirm: passwordConfirm,
              user_type: userType,
              user_timezone: userTimezone,
            };

            try {
              const { data } = await axios.post('https://kmdiscova.id.vn/api/auth/register/', payload);

              Toast.show({
                type: 'success',
                text1: 'Đăng ký thành công!',
              });
              router.replace('/login');
            } catch (error) {
              const message =
                error.response?.data?.message ||
                error.message ||
                'Đăng ký thất bại!';

              Toast.show({
                type: 'error',
                text1: message,
              });
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontSize: 14,
    color: '#A1A4B2',
  },
  terms: {
    color: '#8E97FD',
    fontWeight: 'bold',
  },
  policyContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: 40,
  marginTop: 10,
  justifyContent: 'space-between',
},

checkbox: {
  width: 20,
  height: 20,
  borderWidth: 1,
  borderColor: '#A1A4B2',
  borderRadius: 4,
  marginRight: 10,
  justifyContent: 'center',
  alignItems: 'center',
},

checkboxTick: {
  width: 12,
  height: 12,
  backgroundColor: '#8E97FD',
  borderRadius: 2,
},
/* wrapper lets eye sit on top */
pwdWrapper: {
  position: 'relative',
  alignSelf: 'center',
  width: SCREEN_WIDTH - 70,
  marginBottom: 20,
},

/* reuse input style but remove marginHorizontal */
input2: {
  height: 70,
  backgroundColor: '#F2F3F7',
  borderColor: '#EBEAEC',
  borderWidth: 1,
  borderRadius: 20,
  paddingHorizontal: 15,
  fontSize: 16,
  color: '#000',
  paddingRight: 50,      // space for eye icon
},

eyeBtn: {
  position: 'absolute',
  right: 15,
  top: 0,
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
},
userTypeContainer: {
  flexDirection: 'row',
  justifyContent: 'left',
  marginBottom: 20,
  marginLeft: 40,
  gap: 10,
},

userTypeButton: {
  borderWidth: 1,
  borderColor: '#A1A4B2',
  borderRadius: 10,
  paddingVertical: 12,
  paddingHorizontal: 20,
  backgroundColor: '#F2F3F7',
},

userTypeButtonActive: {
  backgroundColor: '#8E97FD',
  borderColor: '#8E97FD',
},

userTypeText: {
  color: '#A1A4B2',
  fontWeight: 'bold',
},

userTypeTextActive: {
  color: '#fff',
},
Text12: {
  fontSize: 14,
  color: '#A1A4B2',
  marginLeft: 40,
  marginBottom: 10,
}

});