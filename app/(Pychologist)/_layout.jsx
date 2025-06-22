import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slot, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api, { checkPsychologistProfile } from '../(auth)/api';

const Layout = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [paymentChecked, setPaymentChecked] = useState(false);

  const navItems = [
    { name: 'calendar', label: 'Calendar', icon: 'calendar-outline' },
    { name: 'availability', label: 'Availability', icon: 'time-outline' },
    { name: 'mess', label: 'Mess', icon: 'chatbox-ellipses-outline' },
    { name: 'client', label: 'Client', icon: 'people-outline' },
    { name: 'profile', label: 'Profile', icon: 'person-outline' },
  ];

  // Check payment status when layout loads
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) return;

        // Check psychologist profile and verification status
        const profileData = await checkPsychologistProfile();
        
        if (profileData) {
          // If verification status is "Pending", redirect to payment
          if (profileData.verification_status === 'Pending') {
            Alert.alert(
              'Payment Required',
              'You need to complete the registration payment before accessing the platform.',
              [
                { 
                  text: 'Pay Now', 
                  onPress: () => router.replace('/(auth)/psychologistPayment') 
                },
                { text: 'Cancel', style: 'cancel', onPress: () => router.replace('/(auth)/welcome') }
              ]
            );
            return;
          }
          
          // If verification status is "Rejected", show error
          if (profileData.verification_status === 'Rejected') {
            Alert.alert(
              'Verification Rejected',
              'Your verification has been rejected. Please contact support.',
              [{ text: 'OK', onPress: () => router.replace('/(auth)/welcome') }]
            );
            return;
          }
        }
        
        setPaymentChecked(true);
      } catch (error) {
        // If profile doesn't exist (404), that's fine - user needs to pay first
        console.log('No profile found - user needs to pay first');
        Alert.alert(
          'Payment Required',
          'You need to complete the registration payment before accessing the platform.',
          [
            { 
              text: 'Pay Now', 
              onPress: () => router.replace('/(auth)/psychologistPayment') 
            },
            { text: 'Cancel', style: 'cancel', onPress: () => router.replace('/(auth)/welcome') }
          ]
        );
      }
    };

    checkPaymentStatus();
  }, []);

  // Fetch psychologist profile for avatar
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) return;

        const response = await api.get('/api/psychologists/profile/profile/');
        if (response.data && response.data.profile_picture_url) {
          setProfileImage(response.data.profile_picture_url);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (paymentChecked) {
      fetchProfile();
      fetchNotifications();
    }
  }, [paymentChecked]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_type', 'user_id']);
      router.replace('/(auth)/welcome');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  // Fetch notifications based on appointment data
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;

      // Get upcoming appointments for notifications
      const upcomingResponse = await api.get('/api/appointments/upcoming/');
      const appointmentsResponse = await api.get('/api/appointments/');
      
      const notifications = [];
      let notificationId = 1;

      // Process upcoming appointments
      if (upcomingResponse.data && upcomingResponse.data.appointments) {
        upcomingResponse.data.appointments.forEach(appointment => {
          const appointmentDate = new Date(appointment.scheduled_start_time);
          const now = new Date();
          const timeDiff = appointmentDate.getTime() - now.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);

          // Add notification for appointments within 24 hours
          if (hoursDiff <= 24 && hoursDiff > 0) {
            notifications.push({
              id: notificationId++,
              title: 'Upcoming Appointment',
              message: `You have an appointment with ${appointment.child_name} in ${Math.round(hoursDiff)} hours`,
              time: `${Math.round(hoursDiff)} hours ago`,
              type: 'appointment',
              read: false,
              appointmentId: appointment.appointment_id,
            });
          }
        });
      }

      // Process recent appointments for status changes
      if (appointmentsResponse.data && appointmentsResponse.data.results) {
        const recentAppointments = appointmentsResponse.data.results
          .filter(app => {
            const appointmentDate = new Date(app.scheduled_start_time);
            const now = new Date();
            const daysDiff = (now.getTime() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7; // Last 7 days
          });

        recentAppointments.forEach(appointment => {
          if (appointment.appointment_status === 'Payment_Pending') {
            notifications.push({
              id: notificationId++,
              title: 'Payment Pending',
              message: `Payment is pending for appointment with ${appointment.child_name}`,
              time: '1 day ago',
              type: 'payment',
              read: false,
              appointmentId: appointment.appointment_id,
            });
          } else if (appointment.appointment_status === 'No_Show') {
            notifications.push({
              id: notificationId++,
              title: 'No Show',
              message: `Client ${appointment.child_name} did not show up for their appointment`,
              time: '2 days ago',
              type: 'no_show',
              read: false,
              appointmentId: appointment.appointment_id,
            });
          }
        });
      }

      // Add system notifications
      notifications.push({
        id: notificationId++,
        title: 'System Update',
        message: 'New features are available in your dashboard',
        time: '3 hours ago',
        type: 'system',
        read: true,
      });

      setNotifications(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleNotificationPress = (notification) => {
    // Mark as read and handle navigation
    const updatedNotifications = notifications.map(n =>
      n.id === notification.id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'appointment':
      case 'payment':
      case 'no_show':
        router.push('/(Pychologist)/calendar');
        break;
      case 'system':
        // Stay on current page for system notifications
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return 'calendar';
      case 'payment':
        return 'card';
      case 'no_show':
        return 'close-circle';
      case 'system':
        return 'settings';
      default:
        return 'notifications';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Show loading while checking payment status
  if (!paymentChecked) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="refresh" size={32} color="#6c63ff" />
        <Text style={styles.loadingText}>Checking account status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => setMenuOpen((prev) => !prev)}>
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={() => setNotificationsModalVisible(true)} style={styles.iconButton}>
            <View style={styles.notificationContainer}>
              <Ionicons name="notifications-outline" size={22} color="#333" style={styles.icon} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/(Pychologist)/profile')} style={styles.avatarContainer}>
            <Image
              source={profileImage ? { uri: profileImage } : require('../../assets/images/default-profile.png')}
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

      {/* Notifications Modal */}
      <Modal
        visible={notificationsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNotificationsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notificationsModal}>
            <View style={styles.notificationsModalHeader}>
              <Text style={styles.notificationsModalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotificationsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {notificationsLoading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="refresh" size={24} color="#6c63ff" />
                <Text style={styles.loadingText}>Loading notifications...</Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.notificationItem, !item.read && styles.unreadNotification]}
                    onPress={() => handleNotificationPress(item)}
                  >
                    <View style={styles.notificationIcon}>
                      <Ionicons name={getNotificationIcon(item.type)} size={20} color="#6c63ff" />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{item.title}</Text>
                      <Text style={styles.notificationMessage}>{item.message}</Text>
                      <Text style={styles.notificationTime}>{item.time}</Text>
                    </View>
                    {!item.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyNotificationsContainer}>
                    <Ionicons name="notifications-off" size={48} color="#ccc" />
                    <Text style={styles.emptyNotificationsText}>No notifications</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
  },
  icon: {
    marginHorizontal: 6,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: 2,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  avatarContainer: {
    marginLeft: 8,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  // Notifications Modal Styles
  notificationsModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 -5px 10px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  notificationsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notificationsModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  unreadNotification: {
    backgroundColor: '#f8f9ff',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6c63ff',
    marginLeft: 8,
    marginTop: 8,
  },
  emptyNotificationsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
});
