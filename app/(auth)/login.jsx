import { StyleSheet, Text, View, TouchableOpacity, TextInput, Dimensions, TouchableWithoutFeedback, KeyboardAvoidingView, ScrollView, Platform, Keyboard } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
  import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

 const { width: SCREEN_WIDTH } = Dimensions.get('window'); 
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');



const handleLogin = async () => {
  if (!email || !password) {
    Toast.show({
      type: 'error',
      text1: 'Missing Fields',
      text2: 'Please enter both email and password',
    });
    return;
  }

  try {
    const response = await axios.post('https://kmdiscova.id.vn/api/auth/login/', {
      email,
      password,
    });

    const { token, user } = response.data;

    // Save token and user info to AsyncStorage
    await AsyncStorage.setItem('access_token', token);
    await AsyncStorage.setItem('user_type', user.user_type);
    await AsyncStorage.setItem('user_id', user.id.toString()); // optional
      try {
        const childrenResponse = await axios.get(`https://kmdiscova.id.vn/api/children/profile/my_children`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const childrenData = childrenResponse.data;

        // ✅ Get only the first child's ID
        const firstChildId = childrenData.results?.[0]?.id;

        if (firstChildId) {
          await AsyncStorage.setItem('child_id', firstChildId);
          console.log('Saved first child ID:', firstChildId);
        } else {
          console.log('No children found.');
        }

      } catch (childrenError) {
        console.log('Failed to fetch children:', childrenError.response?.data || childrenError.message);
      }

    console.log('Login successful:', response.data);

    Toast.show({
      type: 'success',
      text1: 'Login Successful',
      text2: 'Redirecting you...',
    });

    // Navigate to welcome screen
    router.push('/welcome');

  } catch (error) {
    console.log('Login error:', error.response?.data || error.message);
    Toast.show({
      type: 'error',
      text1: 'Login Failed',
      text2: error.response?.data?.message || 'Invalid credentials',
    });
  }
};


  return (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    
  {/* lifts content when keyboard shows */}
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
  >
    {/* scroll if still taller than screen */}
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
    <View style={styles.container}>
      <Toast position="top" visibilityTime={4000} topOffset={50}  />
      <TouchableOpacity style={styles.backButton} onPress={router.back}>
          <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.Welcome}>CHÀO MỪNG TRỞ LẠI!</Text>

      <Text style={styles.Welcome}>Facebook</Text>
      <Text style={styles.Welcome}>Google</Text>

      <Text style={styles.Text}>HOẶC ĐĂNG NHẬP BẰNG EMAIL</Text>

      {/* Địa chỉ email input */}
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ email"
        placeholderTextColor="#A1A4B2"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Mật khẩu input */}
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        placeholderTextColor="#A1A4B2"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.Button} activeOpacity={0.8} onPress={() => {handleLogin()}}>
        <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>
      </TouchableOpacity>

      <Text style={styles.Text3}> Quên mật khẩu ?</Text>

      <View style={styles.RegisterContainer}>
                <Text style={styles.Text}> CHƯA CÓ TÀI KHOẢN? </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={styles.registerLink}>ĐĂNG KÝ</Text>
                </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => router.push('/welcome')}>
                  <Text style={styles.registerLink}>Welcome Test</Text>
                </TouchableOpacity>
    </View>
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
    width: SCREEN_WIDTH - 70, // Adjust width as needed
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
