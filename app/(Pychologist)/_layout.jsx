import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slot, usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import psychologists from '../(Pychologist)/pyschcologists';

const Layout = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: 'calendar', label: 'Calendar', icon: 'calendar-outline' },
    { name: 'availability', label: 'Availability', icon: 'time-outline' },
    { name: 'mess', label: 'Mess', icon: 'chatbox-ellipses-outline' },
    { name: 'client', label: 'Client', icon: 'people-outline' },
    { name: 'profile', label: 'Profile', icon: 'person-outline' },
  ];

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => setMenuOpen((prev) => !prev)}>
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.rightIcons}>
          <Ionicons name="search" size={22} color="#333" style={styles.icon} />
          <Ionicons name="notifications-outline" size={22} color="#333" style={styles.icon} />
          <TouchableOpacity onPress={() => router.push('/(Pychologist)/profile')}>
            <Image
              source={{ uri: psychologists[0].img }}
              resizeMode="cover"
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Menu */}
      {menuOpen && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            onPress={() => {
              setMenuOpen(false);
              router.push('/(Pychologist)/review');
            }}
          >
            <Text style={styles.dropdownItem}>Review</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMenuOpen(false);
              handleLogout();
            }}
          >
            <Text style={styles.dropdownItem}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Top Navigation Tabs */}
      <View style={styles.navRow}>
        {navItems.map((item) => {
          const isActive = pathname.includes(item.name);
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => router.push(`/(Pychologist)/${item.name}`)}
              style={[styles.navItem, isActive && styles.activeTab]}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={isActive ? '#000' : '#666'}
              />
              <Text style={[styles.navText, isActive && { color: '#000' }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Screen Content */}
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </View>
  );
};

export default Layout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6c63ff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        ...Platform.select({

          ios: {

            shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4

          },

          android: {

            elevation: 4,

          },

          web: {

            boxShadow: '0 2 4px rgba(0,0,0,0000.2)',

          },

        }),
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#a78bfa',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  navItem: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: '#000',
  },
  dropdown: {
    position: 'absolute',
    top: 90,
    left: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    zIndex: 10,
    padding: 8,
    ...Platform.select({
      ios: {
        ...Platform.select({

          ios: {

            shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4

          },

          android: {

            elevation: 4,

          },

          web: {

            boxShadow: '0 2 4px rgba(0,0,0,0000.2)',

          },

        }),
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#333',
  },
});
