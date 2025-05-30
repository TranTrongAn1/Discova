import { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

const EmailVerificationScreen = () => {
  const { uidb64, token } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axiosInstance.get(
          `http://127.0.0.1:8000/api/auth/verify-email/${uidb64}/${token}/`
        );
        setMessage('✅ Xác nhận email thành công!');
        setTimeout(() => router.replace('/login'), 2000);
      } catch (error) {
        console.error(error);
        setMessage(
          error.response?.data?.detail || '❌ Xác nhận thất bại.'
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#8E97FD" />
      ) : (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
};

export default EmailVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  message: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
});
