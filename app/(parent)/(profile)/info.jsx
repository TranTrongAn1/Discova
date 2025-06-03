import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import default_image from '../../../assets/images/default-profile.png';
import api from '../../(auth)/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';

const Info = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);

  useFocusEffect(
  React.useCallback(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          console.warn('No token found');
          return;
        }

        const response = await api.get(
          'api/parents/profile/profile/',
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        const data = response.data;
        setUserInfo({
          img: data?.profile_picture_url || null, 
          first_name: data?.first_name || '',
          last_name: data?.last_name || '',
          email: data?.email || '',
          phone_number: data?.phone_number || '',
          address_line1: data?.address_line1 || '',
          address_line2: data?.address_line2 || '',
        });

      } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
      }
    };

    fetchProfile();
  }, [])
);



  if (!userInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông tin cơ bản</Text>

        <View style={styles.card}>
          <View style={styles.avatarRow}>
              <Image
                source={userInfo.img && userInfo.img.startsWith('http') ? { uri: userInfo.img } : default_image}
                style={styles.avatar}
              />

          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.label}>
              <Text style={styles.bold}>Họ:</Text> {userInfo.first_name || 'Chưa nhập'}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Tên:</Text> {userInfo.last_name || 'Chưa nhập'}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Số điện thoại:</Text> {userInfo.phone_number || 'Chưa nhập'}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Địa chỉ:</Text> {userInfo.address_line1 || 'Chưa nhập'}, {userInfo.address_line2 || 'Chưa nhập'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: '/EditProfile',
                params: {
                  first_name: userInfo.first_name,
                  last_name: userInfo.last_name,
                  phone: userInfo.phone_number,
                  address_line1: userInfo.address_line1,
                  address_line2: userInfo.address_line2,
                  profile_picture_url: userInfo.img, 
                },
              })
            }
          >
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
  avatarRow: {
  alignItems: 'center',
  marginBottom: 20,
},
infoBlock: {
  paddingHorizontal: 10,
},
avatar: {
  width: 120,
  height: 120,
  borderRadius: 60,
  borderWidth: 2,
  borderColor: '#7B8CE4', // Optional: a nice color ring
},

});
