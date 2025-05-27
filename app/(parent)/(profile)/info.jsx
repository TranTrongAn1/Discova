import { StyleSheet, Text, View, Button, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import default_image from '../../../assets/images/default-profile.png'; // Default image if no profile image is set
const Info = ({ navigation }) => {

  // Example of mock data you could load later
  const userInfo = {
    img: 'https://cdn2.tuoitre.vn/thumb_w/1200/471584752817336320/2025/5/14/cristiano-ronaldo-jr-132310840-16x90-17471807958871762145-37-0-602-1080-crop-1747180832899812951086.jpg', // Replace with actual image URL
    name: 'Dzolo',
    birthDay: '12/11/2004',
    gender: 'Nam',
    phone: '0375377310',
    email: 'hello@gmail.com',
    address: 'Hà Nội, Việt Nam',
    problems: ['Rối loạn lo âu', 'Mất ngủ', 'Trầm cảm'],
  };

return (
   <View style={styles.container}>
      <Text style={styles.title}>Thông tin cơ bản</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Image
            source={{ uri: userInfo.img || default_image }}
            style={styles.avatar}
          />

            <Text style={styles.label}>
              <Text style={styles.bold}>Họ và Tên:</Text> {userInfo?.name || 'Chưa nhập'}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Ngày Sinh:</Text> {userInfo?.birthDay || 'Chưa nhập'}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Giới tính:</Text> {userInfo?.gender || 'Chưa nhập'}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Số điện thoại:</Text> {userInfo?.phone || 'Chưa nhập'}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Email:</Text> {userInfo?.email || 'Chưa nhập'}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Địa chỉ:</Text> {userInfo?.address || 'Chưa nhập'}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Vấn đề gặp phải:</Text>{' '}
              {userInfo?.problems?.length > 0 ? userInfo.problems.join(', ') : 'Chưa nhập'}
            </Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>
    </View>
);

};

export default Info;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  noPlan: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4a67ff',
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  row: {
  flexDirection: 'column',
  alignItems: 'flex-start',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
    marginBottom: 10,
  },
});
