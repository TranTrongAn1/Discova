import { StyleSheet, Text, View, Image } from 'react-native';
import React from 'react';

const Success = () => {
   const booking = JSON.parse(bookingData);
    useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Wait for real payment confirmation from Stripe webhook or SDK
        // For now we assume payment success for demo purposes
        const token = await AsyncStorage.getItem('access_token');

        const response = await api.post(
          '/api/appointments/',
          {
            child: booking.childId,
            psychologist: booking.psychologistId,
            session_type: booking.session_type,
            start_slot_id: booking.start_slot_id,
            parent_notes: booking.parent_notes,
          },
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        Alert.alert('Thành công', 'Lịch hẹn của bạn đã được tạo.');
        router.push('/home'); // or navigate to receipt screen
      } catch (error) {
        console.error('Failed to create appointment:', error);
        Alert.alert('Lỗi', 'Thanh toán thành công nhưng đặt lịch thất bại.');
      }
    };

    handlePaymentSuccess();
  }, []);
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
      />
      <Text style={styles.title}>Thanh toán thành công!</Text>
      <Text style={styles.message}>
        Cảm ơn bạn đã đặt lịch. Hẹn gặp bạn trong buổi tư vấn!
      </Text>
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
  image: {
    width: 120,
    height: 120,
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
  },
});
