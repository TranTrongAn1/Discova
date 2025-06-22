import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../../(auth)/api';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const profileImage = null; // Replace this with your image URL or null
  const settingsOptions = [
    { label: 'Thông tin cơ bản', route: 'info' },
    { label: 'Hồ sơ của bé', route: 'childRecord' },
    { label: 'Thông tin đặt lịch', route: 'bookingInfo' },
  ];

  const handleLogout = async () => {
    console.log('Logout button pressed');
    
    // For web, we'll do a direct logout without confirmation for now
    if (Platform.OS === 'web') {
      try {
        console.log('Starting logout process...');
        // Clear all stored tokens
        await AsyncStorage.multiRemove([
          'access_token',
          'refresh_token',
          'user_type',
          'user_id'
        ]);
        console.log('Tokens cleared successfully');
        
        // Navigate to welcome screen
        console.log('Navigating to welcome screen...');
        router.replace('/(auth)/welcome');
      } catch (error) {
        console.error('Error during logout:', error);
        alert('Có lỗi xảy ra khi đăng xuất');
      }
    } else {
      // For mobile, use the confirmation dialog
      Alert.alert(
        'Đăng xuất',
        'Bạn có chắc chắn muốn đăng xuất?',
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Đăng xuất',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('Starting logout process...');
                // Clear all stored tokens
                await AsyncStorage.multiRemove([
                  'access_token',
                  'refresh_token',
                  'user_type',
                  'user_id'
                ]);
                console.log('Tokens cleared successfully');
                
                // Navigate to welcome screen
                console.log('Navigating to welcome screen...');
                router.replace('/(auth)/welcome');
              } catch (error) {
                console.error('Error during logout:', error);
                Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng xuất');
              }
            },
          },
        ]
      );
    }
  };

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
      <Text style={styles.text}>Hồ Sơ</Text>

      <Image
        style={styles.image}
        resizeMode="cover"
        source={
          userInfo.img
            ? { uri: userInfo.img }
            : require('../../../assets/images/default-profile.png')
        }
      />
      <Text style={styles.username}>
        {userInfo.first_name} {userInfo.last_name}
      </Text>
      <Text style={styles.mail}>{userInfo.email}</Text>
      <FlatList
        data={settingsOptions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push(`/${item.route}`)} // Navigate to the screen
            activeOpacity={0.6}
          >
            <Text style={styles.listText}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
          </TouchableOpacity>
        )}
      />

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.6}
      >
        <Ionicons name="log-out-outline" size={20} color="#F44336" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,

  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginLeft: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee', // fallback background if image fails to load
    alignSelf: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  mail: {
    fontSize: 16,
    color: '#71727A',
    textAlign: 'center',
    marginTop: 5,
  },
  listItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  listText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  logoutButton: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginLeft: 10,
  },
});
