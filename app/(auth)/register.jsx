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
} from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [showPwd, setShowPwd]     = useState(false);   
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
  >
    {/* scroll in case content is still taller than screen */}
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
    <View style={styles.container}>
     <TouchableOpacity style={styles.backButton} onPress={router.back}>
        <Ionicons name="arrow-back" size={24} color="black" />
     </TouchableOpacity>


      <Text style={styles.Welcome}>Tạo Tài Khoản</Text>

      {/* Social sign-up placeholders */}
      <Text style={styles.Welcome}>Facebook</Text>
      <Text style={styles.Welcome}>Google</Text>

      <Text style={styles.Text}>HOẶC ĐĂNG KÝ BẰNG EMAIL</Text>

      {/* Tên người dùng */}
      <TextInput
        style={styles.input}
        placeholder="Tên người dùng"
        placeholderTextColor="#A1A4B2"
        value={username}
        onChangeText={setUsername}
      />

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
      <TouchableOpacity style={styles.Button} activeOpacity={0.8} onPress={() => {}}>
        <Text style={styles.buttonText}>BẮT ĐẦU</Text>
      </TouchableOpacity>
    </View>
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

});
