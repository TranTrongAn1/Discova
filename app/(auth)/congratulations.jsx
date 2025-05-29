import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

const Congratulations = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉🎊🥳</Text>
      <Text style={styles.title}>Chúc mừng!</Text>
      <Text style={styles.subtitle}>
        Bạn đã đăng ký thành công với vai trò chuyên gia.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/(Pychologist)/calendar')}
      >
        <Text style={styles.buttonText}>Đi đến Trang Chính</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Congratulations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4b0082',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4b0082',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
