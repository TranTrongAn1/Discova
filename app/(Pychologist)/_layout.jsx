import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Slot, useRouter, usePathname } from 'expo-router';

const Layout = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'calendar',label: 'Calendar', icon: 'calendar-outline' },
    { name: 'mess',label: 'Mess', icon: 'chatbox-ellipses-outline' },
    { name: 'client',label: 'Client', icon: 'people-outline' },
    { name: 'workInfo',label: 'Profile', icon: 'person-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <Ionicons name="menu" size={24} color="#333" />
        <View style={styles.rightIcons}>
          <Ionicons name="search" size={22} color="#333" style={styles.icon} />
          <Ionicons name="notifications-outline" size={22} color="#333" style={styles.icon} />
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.avatar}
          />
        </View>
      </View>

      {/* Top Navigation */}
      <View style={styles.navRow}>
        {navItems.map((item) => {
          const isActive = pathname.includes(item.name);
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => router.push(`/${item.name}`)}
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

      {/* Current Screen Content */}
      <View style={{ flex: 1 }}>
        <Slot /> {/* This will render the current route’s screen */}
      </View>
    </View>
  );
};

export default Layout;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
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
});
