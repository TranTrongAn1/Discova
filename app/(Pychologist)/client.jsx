import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../(auth)/api';

const statusLabels = {
  all: 'Tất cả',
  completed: 'Hoàn thành',
  in_progress: 'Đang diễn ra',
  upcoming: 'Sắp tới',
  cancelled: 'Đã hủy',
};

const ClientScreen = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log('=== STARTING FETCH ===');
      const response = await api.get('/api/appointments/my_appointments/');
      
      // Extract appointments from the correct location in the response
      let appointmentsData = [];
      if (response.data && response.data.appointments) {
        appointmentsData = response.data.appointments;
      } else if (response.data && response.data.results) {
        appointmentsData = response.data.results;
      } else if (Array.isArray(response.data)) {
        appointmentsData = response.data;
      }
      
      console.log('=== ABOUT TO SET STATE ===');
      console.log('Appointments data length:', appointmentsData.length);
      console.log('First appointment:', appointmentsData[0]);
      
      setAppointments(appointmentsData);
      console.log('=== STATE SET ===');
    } catch (error) {
      console.error('Error fetching appointments:', error);
      
      let errorMessage = 'Không thể tải danh sách khách hàng. Vui lòng thử lại.';
      if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy lịch hẹn nào.';
      }
      
      Alert.alert('Lỗi', errorMessage);
      setAppointments([]);
    } finally {
      setLoading(false);
      console.log('=== FETCH COMPLETED ===');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Debug: Log when appointments state changes
  useEffect(() => {
    console.log('Appointments state changed:', appointments.length, 'items');
  }, [appointments]);

  const getAppointmentStatus = (appointment) => {
    if (!appointment) {
      return 'upcoming';
    }
    
    const now = moment();
    const startTime = moment(appointment.scheduled_start_time);
    const endTime = moment(appointment.scheduled_end_time);
    
    // Handle API status values
    const apiStatus = appointment.appointment_status || appointment.status;
    if (apiStatus === 'Cancelled' || apiStatus === 'No_Show') return 'cancelled';
    if (apiStatus === 'Completed') return 'completed';
    if (apiStatus === 'In_Progress') return 'in_progress';
    
    // Fallback to time-based status
    if (now.isBefore(startTime)) return 'upcoming';
    if (now.isBetween(startTime, endTime)) return 'in_progress';
    return 'completed';
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (selectedStatus === 'all') return true;
    return getAppointmentStatus(appointment) === selectedStatus;
  });

  const renderAppointmentCard = ({ item }) => {
    if (!item) {
      console.warn('Received null or undefined item in renderAppointmentCard');
      return null;
    }
    
    const status = getAppointmentStatus(item);
    const statusColor = {
      completed: '#28a745',
      in_progress: '#ffc107',
      upcoming: '#17a2b8',
      cancelled: '#dc3545',
    }[status] || '#999';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.child_name || 'Khách hàng'}</Text>
          <Text style={[styles.status, { color: statusColor }]}>
            {statusLabels[status]}
          </Text>
        </View>
        
        <Text style={styles.time}>
          {moment(item.scheduled_start_time).format('ddd, MMM D')} | {' '}
          {moment(item.scheduled_start_time).format('HH:mm')} - {' '}
          {moment(item.scheduled_end_time).format('HH:mm')}
        </Text>
        
        <Text style={styles.sessionType}>
          {item.session_type === 'OnlineMeeting' ? '🌐 Trực tuyến' : '🏢 Tại văn phòng'}
        </Text>
        
        {item.parent_notes && (
          <>
            <Text style={styles.label}>Ghi chú từ phụ huynh:</Text>
            <Text style={styles.text}>{item.parent_notes}</Text>
          </>
        )}
        
        {item.psychologist_notes && (
          <>
            <Text style={styles.label}>Ghi chú của bạn:</Text>
            <Text style={styles.text}>{item.psychologist_notes}</Text>
          </>
        )}
        
        <View style={styles.cardFooter}>
          <Text style={styles.childAge}>
            Tuổi: {item.child_age || 'N/A'} tuổi
          </Text>
          <Text style={styles.childGender}>
            Giới tính: {item.child_gender === 'M' ? 'Nam' : item.child_gender === 'F' ? 'Nữ' : 'N/A'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Khách hàng đã đặt lịch</Text>
      

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {Object.keys(statusLabels).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === status && styles.filterTextActive,
              ]}
            >
              {statusLabels[status]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Client List */}
      {loading ? (
        <Text style={styles.loadingText}>Đang tải...</Text>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => {
            const key = item?.appointment_id || item?.id || `appointment-${Math.random()}`;
            return key.toString();
          }}
          renderItem={renderAppointmentCard}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Không có khách hàng nào trong trạng thái này
            </Text>
          }
        />
      )}
    </View>
  );
};

export default ClientScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  filterButtonActive: {
    backgroundColor: '#6c63ff',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6c63ff',
    elevation: 2,
    ...Platform.select({

      ios: {

        shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4

      },

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 2 4px rgba(0,0,0,0000.1)',

      },

    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  time: {
    fontSize: 14,
    color: '#6c63ff',
    marginBottom: 4,
  },
  sessionType: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    color: '#555',
  },
  text: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  childAge: {
    fontSize: 12,
    color: '#666',
  },
  childGender: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
  },
});
