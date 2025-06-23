import { router } from 'expo-router'; // required to navigate
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LottieAnimation from '../../components/LottieAnimation';

const Success = () => {
  return (
    <View style={styles.container}>
      <LottieAnimation
        source={require('../../assets/images/Animation - 1750083506267.json')}
        autoPlay
        loop={false}
        style={styles.animation}
      />
      <Text style={styles.title}>Thanh toán thành công!</Text>
      <Text style={styles.message}>
        Cảm ơn bạn đã đặt lịch. Hẹn gặp bạn trong buổi tư vấn!
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(parent)/home')}>
        <Text style={styles.buttonText}>Về Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Success;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F9EF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  animation: {
    width: 150,
    height: 150,
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#8E97FD',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
