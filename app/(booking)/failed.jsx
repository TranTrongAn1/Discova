import { StyleSheet, Text, View, Image } from 'react-native';
import React from 'react';

const Failed = () => {
  return (
    <View style={styles.container}>
      <Image

        style={styles.image}
      />
      <Text style={styles.title}>Thanh toán thất bại</Text>
      <Text style={styles.message}>
        Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại hoặc kiểm tra kết nối mạng.
      </Text>
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
  image: {
    width: 120,
    height: 120,
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
});
