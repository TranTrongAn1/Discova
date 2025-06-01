import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const welcome = () => {

  useEffect(() => {
  const checkUserTypeAndRedirect = async () => {
    try {
      const userType = await AsyncStorage.getItem('user_type');

      if (userType == 'Parent') {
        router.replace('/(parent)/home');
      } else if (userType == 'Psychologist') {
        router.replace('/payment');
      }
    } catch (error) {
      console.error('Error reading user_type:', error);
    }
  };

  checkUserTypeAndRedirect();
}, []);

  return (
    <View style={styles.container}>
      <View>
      <Text style={styles.text1}>Chào mừng</Text>
      <Text style={styles.text2}>Đến với K&MDiscova</Text>
      <Text style={styles.text3}>Chúng tôi sẽ giúp bạn kết nối với chuyên gia</Text>
      <Text style={styles.text4}>phù hợp để hỗ trợ con bạn tốt nhất</Text>
      </View>
      <TouchableOpacity style={styles.Button} activeOpacity={0.8} onPress={() => checkUserTypeAndRedirect()}>
              <Text style={styles.buttonText}>BẮT ĐẦU</Text>
            </TouchableOpacity>
    </View>
  )
}

export default welcome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8E97FD',
    justifyContent: 'space-between',
  },
  text1: {
    marginTop: 150,
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
})