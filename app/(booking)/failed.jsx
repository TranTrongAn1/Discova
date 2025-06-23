import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Failed = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>❌</Text>
      <Text style={styles.title}>Thanh toán thất bại</Text>
      <Text style={styles.message}>
        Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại hoặc kiểm tra kết nối mạng.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(parent)/home')}>
        <Text style={styles.buttonText}>Về Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Failed;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDEDED',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
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
