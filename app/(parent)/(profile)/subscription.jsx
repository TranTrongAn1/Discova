import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { router } from 'expo-router';

const subscription = () => {
  // Simulate having or not having subscription data
  const subscriptionData = {
    name: 'Chó Thiện',
    startDate: '1/3/2025',
    endDate: '1/6/2025',
    status: 'Còn hiệu lực',
  };

  const hasSubscription = !!subscriptionData;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gói đăng ký</Text>

      {!hasSubscription ? (
        <Text style={styles.noPlan}>Chưa đăng ký gói nào</Text>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>
              <Text style={styles.bold}>Tên nhà tâm lý học:</Text> {subscriptionData.name}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Ngày bắt đầu:</Text> {subscriptionData.startDate}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Ngày hết hạn:</Text> {subscriptionData.endDate}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Trạng thái:</Text> {subscriptionData.status}
            </Text>
              <TouchableOpacity onPress={() => router.push('/childRecord')}>
                  <Text style={styles.child}>Hồ sơ trẻ</Text>
              </TouchableOpacity>
          </View>

        </>
      )}
    </View>
  );
};

export default subscription;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  noPlan: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
    marginTop: 50,
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  child: {
    fontSize: 16,
    color: '#007BFF',
    marginTop: 10,
    textAlign: 'center',
  },
});
