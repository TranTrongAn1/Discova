import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../(auth)/api';

const statusLabels = {
  all: 'All Clients',
  completed: 'Completed',
  in_progress: 'In Progress',
  upcoming: 'Upcoming',
  cancelled: 'Cancelled',
};

const ClientScreen = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animated spinner
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spin.start();

    return () => spin.stop();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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

      let errorMessage = 'Unable to load client list. Please try again.';
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'No appointments found.';
      }

      Alert.alert('Error', errorMessage);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in_progress':
        return 'time';
      case 'upcoming':
        return 'calendar';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in_progress':
        return '#F59E0B';
      case 'upcoming':
        return '#3B82F6';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderAppointmentCard = ({ item }) => {
    if (!item) {
      console.warn('Received null or undefined item in renderAppointmentCard');
      return null;
    }

    const status = getAppointmentStatus(item);
    const statusColor = getStatusColor(status);
    const statusIcon = getStatusIcon(status);

    return (
      <View style={styles.card}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Ionicons name={statusIcon} size={12} color="white" />
          <Text style={styles.statusBadgeText}>{statusLabels[status]}</Text>
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
          <View style={styles.clientHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(item.child_name || 'C').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.clientDetails}>
              <Text style={styles.clientName}>{item.child_name || 'Client'}</Text>
              <Text style={styles.clientAge}>
                {item.child_age || 'N/A'} years old • {item.child_gender === 'M' ? 'Male' : item.child_gender === 'F' ? 'Female' : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Session Details */}
        <View style={styles.sessionDetails}>
          <View style={styles.sessionRow}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.sessionText}>
              {moment(item.scheduled_start_time).format('dddd, MMMM D, YYYY')}
            </Text>
          </View>

          <View style={styles.sessionRow}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.sessionText}>
              {moment(item.scheduled_start_time).format('HH:mm')} - {moment(item.scheduled_end_time).format('HH:mm')}
            </Text>
          </View>

          <View style={styles.sessionRow}>
            <Ionicons
              name={item.session_type === 'OnlineMeeting' ? 'videocam-outline' : 'business-outline'}
              size={16}
              color="#6B7280"
            />
            <Text style={styles.sessionText}>
              {item.session_type === 'OnlineMeeting' ? 'Online Session' : 'In-Person Session'}
            </Text>
          </View>
        </View>

        {/* Notes Section */}
        {(item.parent_notes || item.psychologist_notes) && (
          <View style={styles.notesSection}>
            {item.parent_notes && (
              <View style={styles.noteItem}>
                <Text style={styles.noteLabel}>Parent Notes</Text>
                <Text style={styles.noteText}>{item.parent_notes}</Text>
              </View>
            )}

            {item.psychologist_notes && (
              <View style={styles.noteItem}>
                <Text style={styles.noteLabel}>Your Notes</Text>
                <Text style={styles.noteText}>{item.psychologist_notes}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Client Management</Text>
            <Text style={styles.subtitle}>Manage your appointments and client information</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        </ScrollView>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredAppointments.length}</Text>
          <Text style={styles.statLabel}>Total Clients</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {appointments.filter(a => getAppointmentStatus(a) === 'upcoming').length}
          </Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {appointments.filter(a => getAppointmentStatus(a) === 'completed').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Client List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingSpinner,
              { transform: [{ rotate: spin }] }
            ]}
          />
          <Text style={styles.loadingText}>Loading clients...</Text>
        </View>
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
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No clients found</Text>
              <Text style={styles.emptyText}>
                No clients match the selected filter criteria
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

export default ClientScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clientInfo: {
    marginBottom: 16,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  clientDetails: {
    marginLeft: 16,
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  clientAge: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  sessionDetails: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  noteItem: {
    marginBottom: 12,
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingSpinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#6366F1',
    borderBottomColor: 'transparent',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  listContainer: {
    paddingBottom: 20,
  },
});
