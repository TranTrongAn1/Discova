import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LocaleConfig, Calendar as RNCalendar } from 'react-native-calendars';
import api from '../(auth)/api';

const Calendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Configure calendar locale
  LocaleConfig.locales['vi'] = {
    monthNames: [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ],
    monthNamesShort: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    dayNames: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
    dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  };
  LocaleConfig.defaultLocale = 'vi';

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      console.log('Fetching psychologist appointments...');
      const response = await api.get('/api/appointments/my_appointments/');

      console.log('Appointments response:', response.data);

      // Extract appointments from the correct location in the response
      let appointmentsData = [];
      if (response.data && response.data.appointments) {
        appointmentsData = response.data.appointments;
      } else if (response.data && response.data.results) {
        appointmentsData = response.data.results;
      } else if (Array.isArray(response.data)) {
        appointmentsData = response.data;
      }

      // Transform API data to match our UI format
      const transformedAppointments = appointmentsData.map(appointment => ({
        id: appointment.appointment_id,
        parentName: appointment.parent_name || 'Unknown Parent',
        childName: appointment.child_name || 'Unknown Child',
        childAge: calculateAge(appointment.child_date_of_birth) || 0,
        time: formatAppointmentTime(appointment.scheduled_start_time),
        notes: appointment.parent_notes || 'No notes provided',
        status: mapStatusToUI(appointment.appointment_status),
        sessionType: appointment.session_type,
        durationHours: appointment.duration_hours,
        meetingAddress: appointment.meeting_address,
        meetingLink: appointment.meeting_link,
        scheduledStartTime: appointment.scheduled_start_time,
        scheduledEndTime: appointment.scheduled_end_time,
        date: formatDateForCalendar(appointment.scheduled_start_time),
        // Keep original data for API operations
        originalData: appointment
      }));

      setAppointments(transformedAppointments);
      createMarkedDates(transformedAppointments);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      if (err.response?.status === 401) {
        setError('Authentication expired. Please login again.');
      } else if (err.response?.status === 404) {
        setError('No appointments found');
        setAppointments([]);
      } else {
        setError('Failed to load appointments. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create marked dates for calendar
  const createMarkedDates = (appointments) => {
    const marked = {};

    appointments.forEach(appointment => {
      const date = appointment.date;
      const status = appointment.status;

      if (!marked[date]) {
        marked[date] = {
          marked: true,
          dotColor: getStatusColor(status),
          textColor: '#2c3e50',
          selected: false
        };
      } else {
        // If multiple appointments on same date, use different dot
        marked[date].dots = marked[date].dots || [];
        marked[date].dots.push({
          color: getStatusColor(status),
          key: appointment.id
        });
      }
    });

    setMarkedDates(marked);
  };

  // Get color based on appointment status
  const getStatusColor = (status) => {
    const colors = {
      confirmed: '#4CAF50',
      cancelled: '#F44336',
      pending: '#FF9800',
      completed: '#2196F3'
    };
    return colors[status] || '#FF9800';
  };

  // Helper functions
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age;
    } catch (error) {
      return null;
    }
  };

  const formatAppointmentTime = (dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDateForCalendar = (dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (error) {
      return '';
    }
  };

  const mapStatusToUI = (apiStatus) => {
    const statusMap = {
      'Payment_Pending': 'pending',
      'Scheduled': 'confirmed',
      'In_Progress': 'confirmed',
      'Completed': 'completed',
      'Cancelled': 'cancelled',
      'No_Show': 'cancelled',
      'Payment_Failed': 'pending'
    };
    return statusMap[apiStatus] || 'pending';
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAppointmentAction = async (appointment, action) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const appointmentId = appointment.originalData?.appointment_id || appointment.id;

      switch (action) {
        case 'complete':
          console.log('Completing appointment:', appointmentId);
          await api.post(`/api/appointments/${appointmentId}/complete/`);
          Alert.alert('Success', 'Appointment marked as completed');
          break;
        case 'cancel':
          console.log('Cancelling appointment:', appointmentId);
          await api.post(`/api/appointments/${appointmentId}/cancel/`);
          Alert.alert('Success', 'Appointment cancelled');
          break;
        case 'start':
          console.log('Starting online session:', appointmentId);
          console.log('Appointment ID being used:', appointmentId);
          console.log('Full original appointment data:', appointment.originalData);
          console.log('Appointment details:', appointment);
          console.log('Appointment status:', appointment.status);
          console.log('Original API status:', appointment.originalData?.appointment_status);
          console.log('Session type:', appointment.sessionType);
          console.log('Scheduled start time:', appointment.scheduledStartTime);
          console.log('Payment status:', appointment.originalData?.payment_status);
          console.log('Appointment status from API:', appointment.originalData?.appointment_status);
          
          // Check if appointment is in the correct status to start
          const originalStatus = appointment.originalData?.appointment_status;
          if (originalStatus !== 'Scheduled') {
            Alert.alert(
              'Cannot Start Session',
              `Appointment status is "${originalStatus}". Only "Scheduled" appointments can be started.`
            );
            return;
          }
          
          // Check payment status
          const paymentStatus = appointment.originalData?.payment_status;
          if (paymentStatus === 'Payment_Pending' || paymentStatus === 'Payment_Failed') {
            Alert.alert(
              'Cannot Start Session',
              `Payment status is "${paymentStatus}". Payment must be completed before starting the session.`
            );
            return;
          }
          
          // Additional validation checks
          console.log('Meeting ID:', appointment.originalData?.meeting_id);
          console.log('Meeting link exists:', !!appointment.originalData?.meeting_link);
          console.log('Can be verified:', appointment.originalData?.can_be_verified);
          console.log('Is upcoming:', appointment.originalData?.is_upcoming);
          console.log('Is past:', appointment.originalData?.is_past);
          
          // Validate appointment can be started
          const now = new Date();
          const scheduledStart = new Date(appointment.scheduledStartTime);
          const timeDiff = Math.abs(now - scheduledStart) / (1000 * 60); // difference in minutes
          
          console.log('Current time:', now);
          console.log('Scheduled start:', scheduledStart);
          console.log('Time difference (minutes):', timeDiff);
          
          // Show warning if appointment is significantly outside normal time window
          if (timeDiff > 30) {
            console.log('Warning: Starting session outside normal time window');
            
            // Show visible warning notification
            setWarningMessage('This appointment is outside the normal time window. Proceeding anyway for testing.');
            setShowWarning(true);
            
            // Also try Alert as backup
            Alert.alert('Warning', 'This appointment is outside the normal time window. Proceeding anyway for testing.');
            
            // Auto-hide warning after 5 seconds
            setTimeout(() => {
              setShowWarning(false);
              setWarningMessage('');
            }, 5000);
          }
          
          const apiUrl = `/api/appointments/${appointmentId}/start_online_session/`;
          console.log('Making API call to:', apiUrl);
          
          // First, let's try to get the appointment details to see if there are any issues
          try {
            console.log('Fetching appointment details first...');
            const detailsResponse = await api.get(`/api/appointments/${appointmentId}/`);
            console.log('Appointment details response:', detailsResponse.data);
          } catch (detailsError) {
            console.error('Error fetching appointment details:', detailsError);
          }
          
          const response = await api.post(apiUrl);
          
          console.log('API call successful');
          console.log('Response data:', response.data);
          
          // Handle Zoom link creation response
          if (response.data && response.data.appointment && response.data.appointment.meeting_link) {
            const meetingLink = response.data.appointment.meeting_link;
            Alert.alert(
              'Online Session Started',
              'Zoom meeting link has been created successfully!',
              [
                {
                  text: 'Open Zoom',
                  onPress: () => openZoomLink(meetingLink)
                },
                {
                  text: 'Copy Link',
                  onPress: () => copyToClipboard(meetingLink)
                },
                {
                  text: 'OK',
                  style: 'cancel'
                }
              ]
            );
          } else {
            Alert.alert('Success', 'Online session started');
          }
          break;
        case 'view':
          console.log('Viewing appointment details:', appointmentId);
          console.log('About to show appointment details inline');
          
          // Show details inline instead of using Alert
          setSelectedAppointment(appointment);
          setShowDetails(true);
          
          // Fallback: Also log to console
          const detailsMessage = `Parent: ${appointment.parentName}\n` +
            `Child: ${appointment.childName} (${appointment.childAge} years old)\n` +
            `Time: ${appointment.time}\n` +
            `Session Type: ${appointment.sessionType}\n` +
            `Duration: ${appointment.durationHours} hours\n` +
            `Status: ${appointment.status.toUpperCase()}`;
          
          console.log('=== APPOINTMENT DETAILS ===');
          console.log(detailsMessage);
          console.log('=== END APPOINTMENT DETAILS ===');
          
          return; // Don't refresh appointments for view action
        case 'openZoom':
          if (appointment.meetingLink) {
            openZoomLink(appointment.meetingLink);
          } else {
            Alert.alert('No Meeting Link', 'Zoom meeting link is not available yet. Please start the session first.');
          }
          return; // Don't refresh appointments for openZoom action
        default:
          console.log('Unknown action:', action);
          return; // Don't refresh appointments for unknown actions
      }

    } catch (err) {
      console.error('Error performing appointment action:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      console.error('Error response headers:', err.response?.headers);
      
      // Log the specific error messages
      if (err.response?.data?.non_field_errors) {
        console.error('Non-field errors:', err.response.data.non_field_errors);
        console.error('First non-field error:', err.response.data.non_field_errors[0]);
      }
      
      let errorMessage = 'Failed to perform action. Please try again.';

      if (err.response?.status === 401) {
        errorMessage = 'Authentication expired. Please login again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Permission denied. You cannot perform this action.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Appointment not found.';
      } else if (err.response?.status === 400) {
        // Show more detailed error information for 400 errors
        const errorData = err.response.data;
        if (errorData?.non_field_errors && errorData.non_field_errors.length > 0) {
          const errorMsg = errorData.non_field_errors[0];
          if (errorMsg.includes('cannot be started at this time')) {
            errorMessage = 'Session cannot be started at this time. This may be due to:\n\n• Appointment is too far in the past\n• Appointment is already completed\n• Server-side timing restrictions\n\nPlease contact support if you need to start this session.';
          } else {
            errorMessage = `Cannot start session: ${errorData.non_field_errors.join(', ')}`;
          }
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else {
          errorMessage = 'Cannot start session at this time. Please check appointment status and timing.';
        }
      }

      Alert.alert('Error', errorMessage);
    }
  };

  // Function to open Zoom link
  const openZoomLink = async (meetingLink) => {
    try {
      const supported = await Linking.canOpenURL(meetingLink);
      if (supported) {
        await Linking.openURL(meetingLink);
      } else {
        Alert.alert('Error', 'Cannot open Zoom link. Please check if Zoom is installed.');
      }
    } catch (error) {
      console.error('Error opening Zoom link:', error);
      Alert.alert('Error', 'Failed to open Zoom link');
    }
  };

  // Function to copy link to clipboard (placeholder for now)
  const copyToClipboard = (text) => {
    // For now, just show the link in an alert
    Alert.alert('Meeting Link', `Copy this link:\n\n${text}`);
  };

  const renderStatusBadge = (status) => {
    const colors = {
      confirmed: '#4CAF50',
      cancelled: '#F44336',
      pending: '#FF9800',
      completed: '#2196F3'
    };

    const labels = {
      confirmed: 'CONFIRMED',
      cancelled: 'CANCELLED',
      pending: 'PENDING',
      completed: 'COMPLETED'
    };

    return (
      <View style={[styles.statusBadge, { backgroundColor: colors[status] }]}>
        <Text style={styles.statusText}>{labels[status]}</Text>
      </View>
    );
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const getAppointmentsForSelectedDate = () => {
    if (!selectedDate) return [];
    return appointments.filter(appointment => appointment.date === selectedDate);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Warning Notification */}
      {showWarning && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>⚠️ {warningMessage}</Text>
          <TouchableOpacity 
            style={styles.warningCloseButton}
            onPress={() => {
              setShowWarning(false);
              setWarningMessage('');
            }}
          >
            <Text style={styles.warningCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch hẹn</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.testWarningButton} 
            onPress={() => {
              setWarningMessage('This is a test warning notification!');
              setShowWarning(true);
              setTimeout(() => {
                setShowWarning(false);
                setWarningMessage('');
              }, 5000);
            }}
          >
            <Text style={styles.testWarningButtonText}>Test Warning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchAppointments}>
            <Text style={styles.refreshButtonText}>Làm mới</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAppointments}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        {(() => {
          try {
            return (
              <RNCalendar
                onDayPress={onDayPress}
                markedDates={{
                  ...markedDates,
                  [selectedDate]: {
                    ...markedDates[selectedDate],
                    selected: true,
                    selectedColor: '#6c5ce7'
                  }
                }}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#2c3e50',
                  selectedDayBackgroundColor: '#6c5ce7',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#6c5ce7',
                  dayTextColor: '#2c3e50',
                  textDisabledColor: '#d9e1e8',
                  dotColor: '#6c5ce7',
                  selectedDotColor: '#ffffff',
                  arrowColor: '#6c5ce7',
                  monthTextColor: '#2c3e50',
                  indicatorColor: '#6c5ce7',
                  textDayFontWeight: '300',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '300',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 13
                }}
                {...(Platform.OS === 'web' && {
                  style: { width: '100%' },
                  hideExtraDays: true,
                  disableMonthChange: false,
                  firstDay: 1,
                  hideDayNames: false,
                  showWeekNumbers: false,
                  onPressArrowLeft: () => {},
                  onPressArrowRight: () => {}
                })}
              />
            );
          } catch (error) {
            console.error('Calendar rendering error:', error);
            return (
              <View style={styles.calendarFallback}>
                <Text style={styles.calendarFallbackText}>
                  Calendar view temporarily unavailable
                </Text>
                <Text style={styles.calendarFallbackSubtext}>
                  Please use the client tab to view appointments
                </Text>
              </View>
            );
          }
        })()}
      </View>

      {/* Appointments for selected date */}
      {selectedDate && (
        <View style={styles.appointmentsContainer}>
          <Text style={styles.dateTitle}>
            Lịch hẹn ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
          </Text>
          <ScrollView style={styles.appointmentsList}>
            {getAppointmentsForSelectedDate().map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.parentLabel}>
                    Phụ huynh: <Text style={styles.parentName}>{appointment.parentName}</Text>
                  </Text>
                  {renderStatusBadge(appointment.status)}
                </View>

                <Text style={styles.childInfo}>
                  Trẻ: {appointment.childName} ({appointment.childAge} tuổi)
                </Text>

                <Text style={styles.timeLabel}>Thời gian:</Text>
                <Text style={styles.timeText}>{appointment.time}</Text>

                <Text style={styles.notesLabel}>Ghi chú:</Text>
                <Text style={styles.notesText}>{appointment.notes}</Text>

                {/* Meeting Link Section */}
                {appointment.meetingLink && (
                  <View style={styles.meetingLinkContainer}>
                    <Text style={styles.meetingLinkLabel}>Zoom Meeting Link:</Text>
                    <Text style={styles.meetingLinkText} numberOfLines={1} ellipsizeMode="tail">
                      {appointment.meetingLink}
                    </Text>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => handleAppointmentAction(appointment, 'view')}
                  >
                    <Text style={styles.detailButtonText}>CHI TIẾT</Text>
                  </TouchableOpacity>

                  {/* Zoom Meeting Button */}
                  {appointment.meetingLink && (
                    <TouchableOpacity
                      style={[styles.detailButton, styles.zoomButton]}
                      onPress={() => handleAppointmentAction(appointment, 'openZoom')}
                    >
                      <Text style={styles.zoomButtonText}>ZOOM</Text>
                    </TouchableOpacity>
                  )}

                  {appointment.status === 'confirmed' && appointment.sessionType === 'OnlineMeeting' && (
                    <TouchableOpacity
                      style={[styles.detailButton, styles.startButton]}
                      onPress={() => handleAppointmentAction(appointment, 'start')}
                    >
                      <Text style={styles.startButtonText}>BẮT ĐẦU</Text>
                    </TouchableOpacity>
                  )}

                  {appointment.status === 'confirmed' && (
                    <TouchableOpacity
                      style={[styles.detailButton, styles.completeButton]}
                      onPress={() => handleAppointmentAction(appointment, 'complete')}
                    >
                      <Text style={styles.completeButtonText}>HOÀN THÀNH</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {getAppointmentsForSelectedDate().length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không có lịch hẹn nào trong ngày này</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Chú thích:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Đã xác nhận</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>Chờ xác nhận</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.legendText}>Đã hoàn thành</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>Đã hủy</Text>
          </View>
        </View>
      </View>

      {/* Inline Details Display */}
      {showDetails && selectedAppointment && (
        <View style={styles.detailsOverlay}>
          <View style={styles.detailsModal}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>Chi tiết lịch hẹn</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowDetails(false);
                  setSelectedAppointment(null);
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.detailsContent}>
              <Text style={styles.detailLabel}>Phụ huynh:</Text>
              <Text style={styles.detailValue}>{selectedAppointment.parentName}</Text>
              
              <Text style={styles.detailLabel}>Trẻ:</Text>
              <Text style={styles.detailValue}>{selectedAppointment.childName} ({selectedAppointment.childAge} tuổi)</Text>
              
              <Text style={styles.detailLabel}>Thời gian:</Text>
              <Text style={styles.detailValue}>{selectedAppointment.time}</Text>
              
              <Text style={styles.detailLabel}>Loại phiên:</Text>
              <Text style={styles.detailValue}>{selectedAppointment.sessionType}</Text>
              
              <Text style={styles.detailLabel}>Thời lượng:</Text>
              <Text style={styles.detailValue}>{selectedAppointment.durationHours} giờ</Text>
              
              <Text style={styles.detailLabel}>Trạng thái:</Text>
              <Text style={styles.detailValue}>{selectedAppointment.status.toUpperCase()}</Text>
              
              <Text style={styles.detailLabel}>Ghi chú:</Text>
              <Text style={styles.detailValue}>{selectedAppointment.notes}</Text>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testWarningButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  testWarningButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
    fontSize: 16,
  },
  calendarContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  appointmentsContainer: {
    flex: 1,
    padding: 16,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  appointmentsList: {
    flex: 1,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  parentLabel: {
    fontSize: 14,
    color: '#6c757d',
    flex: 1,
  },
  parentName: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  childInfo: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  detailButton: {
    borderWidth: 1,
    borderColor: '#6c5ce7',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: 100,
  },
  detailButtonText: {
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#6c5ce7',
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#6c757d',
    fontSize: 16,
    textAlign: 'center',
  },
  legendContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  calendarFallbackText: {
    color: '#6c757d',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  calendarFallbackSubtext: {
    color: '#6c757d',
    fontSize: 14,
    textAlign: 'center',
  },
  meetingLinkContainer: {
    marginBottom: 16,
  },
  meetingLinkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  meetingLinkText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  zoomButton: {
    backgroundColor: '#6c5ce7',
  },
  zoomButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  detailsContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  warningContainer: {
    backgroundColor: '#FF9800',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  warningText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  warningCloseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 4,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningCloseText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Calendar;
