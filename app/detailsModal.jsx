import { StyleSheet, Text, View, Image, Linking, Modal, TouchableOpacity, ScrollView, Animated } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Feather } from '@expo/vector-icons';
import api from './(auth)/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatTimeRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  startDate.setHours(startDate.getHours() - 7);
  endDate.setHours(endDate.getHours() - 7);

  const day = startDate.getDate();
  const month = startDate.getMonth() + 1;
  const year = startDate.getFullYear();
  const hours = (d) => d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return `Ngày ${day}/${month}/${year} từ ${hours(startDate)} đến ${hours(endDate)}`;
};

const DetailsModal = ({ visible, appointment, onClose }) => {
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!appointment || !appointment.appointment_id) return;
      
      setLoading(true);
      try {
        console.log('Fetching details for appointment_id:', appointment.appointment_id);
        const token = await AsyncStorage.getItem('access_token');
        const res = await api.get(`/api/appointments/${appointment.appointment_id}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setAppointmentDetails(res.data);
      } catch (err) {
        console.error('Failed to load appointment details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (visible && appointment) {
      fetchDetails();
    }
  }, [visible, appointment]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return '#4CAF50';
      case 'Completed': return '#2196F3';
      case 'Cancelled': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Scheduled': return 'Đã lên lịch';
      case 'Completed': return 'Đã hoàn thành';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
                {
                  scale: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
              opacity: slideAnim,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Feather name="calendar" size={24} color="#7B68EE" />
              <Text style={styles.title}>Chi tiết cuộc hẹn</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Feather name="loader" size={32} color="#7B68EE" />
                <Text style={styles.loadingText}>Đang tải thông tin...</Text>
              </View>
            ) : appointmentDetails ? (
              <>
                {/* Doctor Info Card */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Feather name="user" size={20} color="#7B68EE" />
                    <Text style={styles.cardTitle}>Thông tin chuyên gia</Text>
                  </View>
                  <View style={styles.doctorInfo}>
                    <Image 
                      source={{ uri: appointmentDetails.psychologist.profile_picture_url }} 
                      style={styles.avatar}
                      defaultSource={{ uri: 'https://via.placeholder.com/80x80/7B68EE/FFFFFF?text=Dr' }}
                    />
                    <View style={styles.doctorDetails}>
                      <Text style={styles.doctorName}>{appointmentDetails.psychologist.full_name}</Text>
                      <Text style={styles.doctorEmail}>{appointmentDetails.psychologist.email}</Text>
                      <View style={styles.experienceTag}>
                        <Feather name="award" size={14} color="#4CAF50" />
                        <Text style={styles.experienceText}>
                          {appointmentDetails.psychologist.years_of_experience} năm kinh nghiệm
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Appointment Details Card */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Feather name="clock" size={20} color="#7B68EE" />
                    <Text style={styles.cardTitle}>Thông tin lịch hẹn</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Feather name="calendar" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Thời gian:</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {formatTimeRange(appointmentDetails.scheduled_start_time, appointmentDetails.scheduled_end_time)}
                  </Text>

                  <View style={styles.detailRow}>
                    <Feather name="info" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Trạng thái:</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(appointmentDetails.appointment_status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(appointmentDetails.appointment_status) }]}>
                      {getStatusText(appointmentDetails.appointment_status)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Feather name="monitor" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Hình thức:</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {appointmentDetails.session_type === 'InitialConsultation' ? 'Tư vấn trực tiếp' : 
                     appointmentDetails.session_type === 'OnlineMeeting' ? 'Tư vấn trực tuyến' : 
                     appointmentDetails.session_type}
                  </Text>
                </View>

                {/* Meeting Info Card */}
                {appointmentDetails.session_type === 'OnlineMeeting' && (
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Feather name="video" size={20} color="#7B68EE" />
                      <Text style={styles.cardTitle}>Thông tin cuộc họp</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.linkButton}
                      onPress={() => Linking.openURL(appointmentDetails.meeting_link)}
                    >
                      <Feather name="external-link" size={16} color="#fff" />
                      <Text style={styles.linkButtonText}>Tham gia cuộc họp</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {appointmentDetails.session_type === 'InPersonMeeting' && (
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Feather name="map-pin" size={20} color="#7B68EE" />
                      <Text style={styles.cardTitle}>Địa điểm</Text>
                    </View>
                    <Text style={styles.addressText}>{appointmentDetails.meeting_address}</Text>
                  </View>
                )}

                {/* Notes Card */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Feather name="file-text" size={20} color="#7B68EE" />
                    <Text style={styles.cardTitle}>Ghi chú</Text>
                  </View>
                  <Text style={styles.notesText}>
                    {appointmentDetails.parent_notes || 'Không có ghi chú từ phụ huynh'}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={32} color="#f44336" />
                <Text style={styles.errorText}>Không thể tải thông tin cuộc hẹn</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default DetailsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  doctorInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#7B68EE',
  },
  doctorDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  doctorEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  experienceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  experienceText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
    marginLeft: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
    marginBottom: 8,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  linkButton: {
    backgroundColor: '#7B68EE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  linkButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  addressText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  notesText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
});