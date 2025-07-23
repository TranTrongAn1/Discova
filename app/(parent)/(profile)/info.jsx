import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../../(auth)/api';
import default_image from '../../../assets/images/default-profile.png';

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
        <Text style={styles.title}>Loading information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Basic Information</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarSection}>
          <Image
            source={userInfo.img && userInfo.img.startsWith('http') ? { uri: userInfo.img } : default_image}
            style={styles.avatar}
          />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>First Name</Text>
            <Text style={styles.infoValue}>{userInfo.first_name || 'Not entered'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Name</Text>
            <Text style={styles.infoValue}>{userInfo.last_name || 'Not entered'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{userInfo.phone_number || 'Not entered'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>
              {userInfo.address_line1 || 'Not entered'}{userInfo.address_line2 ? `, ${userInfo.address_line2}` : ''}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
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
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default Info;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9ff',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e8eaff',
  },
  backButtonText: {
    fontSize: 15,
    color: '#6c63ff',
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#e8eaff',
    backgroundColor: '#f8f9ff',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4a5568',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: '#2d3748',
    flex: 2,
    textAlign: 'right',
  },
  editButton: {
    backgroundColor: '#6c63ff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6c63ff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
