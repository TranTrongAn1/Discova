import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Linking, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LocaleConfig } from 'react-native-calendars';
import api from '../(auth)/api';

const Calendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Add state for current week navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + 1); // Monday
    return startOfWeek;
  });

  // Add ref for scroll control
  const scrollViewRef = useRef(null);
  const [tempWeekStart, setTempWeekStart] = useState(null);

  // Animated spinner
  const spinValue = useRef(new Animated.Value(0)).current;

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
        id: appointment.appointment_id || appointment.id,
        parentName: appointment.parent_name || appointment.parentName || 'Unknown Parent',
        childName: appointment.child_name || appointment.childName || 'Unknown Child',
        childAge: calculateAge(appointment.child_date_of_birth || appointment.childDateOfBirth) || 0,
        time: formatAppointmentTime(appointment.scheduled_start_time || appointment.scheduledStartTime),
        notes: appointment.parent_notes || appointment.notes || 'No notes provided',
        status: appointment.appointment_status || appointment.status || 'Scheduled',
        sessionType: appointment.session_type || appointment.sessionType || 'InPerson',
        durationHours: appointment.duration_hours || appointment.durationHours || 1,
        meetingAddress: appointment.meeting_address || appointment.meetingAddress,
        meetingLink: appointment.meeting_link || appointment.meetingLink,
        scheduledStartTime: appointment.scheduled_start_time || appointment.scheduledStartTime,
        scheduledEndTime: appointment.scheduled_end_time || appointment.scheduledEndTime,
        date: formatDateForCalendar(appointment.scheduled_start_time || appointment.scheduledStartTime),
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
          selected: false,
          appointmentCount: 1
        };
      } else {
        // If multiple appointments on same date, increment count
        marked[date].appointmentCount = (marked[date].appointmentCount || 1) + 1;
        // Use different dot if multiple appointments
        if (!marked[date].dots) {
          marked[date].dots = [
            { color: getStatusColor(status), key: appointment.id }
          ];
        } else {
        marked[date].dots.push({
          color: getStatusColor(status),
          key: appointment.id
        });
        }
      }
    });

    setMarkedDates(marked);
  };

  // Get color based on appointment status
  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': '#2196F3',
      'In_Progress': '#FF9800',
      'Completed': '#4CAF50',
      'Cancelled': '#F44336',
      'No_Show': '#F44336',
      'Payment_Pending': '#FF9800'
    };
    return colors[status] || '#6c757d';
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

  // Fetch appointments when component mounts
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Fetch appointments when week changes
  useEffect(() => {
    fetchAppointments();
  }, [currentWeekStart]);

  // Scroll to center week when component mounts
  useEffect(() => {
    setTimeout(() => {
      scrollToCenterWeek();
    }, 100);
  }, []);

  // Fetch latest appointment details when modal opens
  // Handle appointment actions
  const handleAppointmentAction = async (appointment, action) => {
    // Get the correct appointment ID for API calls
    const appointmentId = appointment.originalData?.appointment_id || appointment.id;

    switch (action) {
      case 'view':
        setSelectedAppointment(appointment);
        setShowAppointmentDetails(true);
        break;
      case 'cancel':
        Alert.alert(
          'Cancel Appointment',
          'Are you sure you want to mark this appointment as cancelled?',
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes',
              style: 'destructive',
              onPress: () => {
                // For Android, we'll use a default reason since Alert.prompt is not available
                if (Platform.OS === 'android') {
                  updateAppointmentStatus(appointmentId, 'Cancelled', 'Cancelled by psychologist');
                } else {
                  // For iOS, we can use Alert.prompt
                  Alert.prompt(
                    'Cancellation Reason',
                    'Please provide a reason for cancellation:',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Submit',
                        onPress: (reason) => {
                          if (reason && reason.trim()) {
                            updateAppointmentStatus(appointmentId, 'Cancelled', reason.trim());
                          } else {
                            Alert.alert('Error', 'Cancellation reason is required.');
                          }
                        }
                      }
                    ],
                    'plain-text',
                    ''
                  );
                }
              }
            }
          ]
        );
        break;
      case 'noShow':
        Alert.alert(
          'Mark as No-Show',
          'Are you sure you want to mark this appointment as no-show?',
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes',
              style: 'destructive',
              onPress: () => updateAppointmentStatus(appointmentId, 'No_Show')
            }
          ]
        );
        break;
      default:
        break;
    }
  };

  // Open zoom link
  const openZoomLink = async (meetingLink) => {
    try {
        await Linking.openURL(meetingLink);
    } catch (error) {
      console.error('Error opening zoom link:', error);
      Alert.alert('Error', 'Could not open zoom link. Please copy and paste it manually.');
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      Alert.alert('Copied', text);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Could not copy to clipboard');
    }
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

  // Get appointments for selected date
  const getAppointmentsForSelectedDate = () => {
    if (!selectedDate) return [];

    // Use real API data from appointments state
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.scheduledStartTime).toISOString().split('T')[0];
      return appointmentDate === selectedDate;
    });
  };

  // Generate week dates for the calendar strip
  const generateWeekDates = () => {
    const dates = [];
    const today = new Date();

    // Generate multiple weeks for smooth scrolling (3 weeks before, current week, 3 weeks after)
    const weeksToShow = 7; // Total weeks to show
    const startWeek = new Date(currentWeekStart);
    startWeek.setDate(currentWeekStart.getDate() - (weeksToShow - 1) * 7 / 2); // Center the current week

    for (let week = 0; week < weeksToShow; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(startWeek);
        date.setDate(startWeek.getDate() + week * 7 + day);
        const dateString = date.toISOString().split('T')[0];

        // Check if this date has appointments
        const dayAppointments = appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.scheduledStartTime).toISOString().split('T')[0];
          return appointmentDate === dateString;
        });

        dates.push({
          date: dateString,
          day: date.getDate(),
          isToday: date.toDateString() === today.toDateString(),
          isSelected: selectedDate === dateString,
          hasAppointments: dayAppointments.length > 0,
          appointmentCount: dayAppointments.length,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          weekIndex: week,
          isCurrentWeek: week === 3 // Center week is current week
        });
      }
    }

    return dates;
  };

  // Week navigation functions
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + 1); // Monday
    setCurrentWeekStart(startOfWeek);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // Generate dates for the current month view
  const generateMonthDates = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startOfWeek = new Date(firstDayOfMonth);
    startOfWeek.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay() + 1); // Monday
    
    const dates = [];
    const today = new Date();

    // Generate 6 weeks (42 days) to ensure we cover the full month
    for (let i = 0; i < 42; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      // Check if this date has appointments
      const dayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.scheduledStartTime).toISOString().split('T')[0];
        return appointmentDate === dateString;
      });
      
      dates.push({
        date: dateString,
        day: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        isSelected: selectedDate === dateString,
        hasAppointments: dayAppointments.length > 0,
        appointmentCount: dayAppointments.length,
        isCurrentMonth: date.getMonth() === currentMonth,
        isCurrentYear: date.getFullYear() === currentYear
      });
    }
    
    return dates;
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // Get month name for display
  const getMonthName = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[currentMonth];
  };

  // Handle date selection
  const onDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startTime = new Date('2024-04-01T09:00:00');
    const endTime = new Date('2024-04-01T18:00:00');
    const interval = 30; // minutes

    for (let currentTime = new Date(startTime); currentTime <= endTime; currentTime.setMinutes(currentTime.getMinutes() + interval)) {
      slots.push(currentTime.toISOString().split('T')[1].substring(0, 5));
    }

    return slots;
  };

  // Get appointments for a specific time slot
  const getAppointmentsForTimeSlot = (timeSlot) => {
    if (!selectedDate) return [];

    const time = new Date(`${selectedDate}T${timeSlot}`);
    return appointments.filter(appointment => {
      if (appointment.date !== selectedDate) return false;

      const start = new Date(appointment.scheduledStartTime);
      const end = new Date(appointment.scheduledEndTime);
      return start <= time && end > time;
    });
  };

  // Get event color based on session type
  const getEventColor = (sessionType) => {
    const colors = {
      'OnlineMeeting': '#4CAF50',
      'InPerson': '#FF9800',
      'PhoneCall': '#2196F3',
      'VideoCall': '#6c5ce7'
    };
    return colors[sessionType] || '#FF9800';
  };

  // Format time for display
  const formatTime = (timeString) => {
    try {
      const time = new Date(timeString);
      return time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return timeString;
    }
  };

  // Handle appointment status update
  const updateAppointmentStatus = async (appointmentId, newStatus, cancellationReason = null) => {
    try {
      console.log('Updating appointment status:', { appointmentId, newStatus, cancellationReason });
      
      let endpoint;
      let requestBody = {};
      
      // Use the correct endpoint based on the status
      switch (newStatus) {
        case 'Completed':
          endpoint = `/api/appointments/${appointmentId}/complete/`;
          break;
        case 'No_Show':
          endpoint = `/api/appointments/${appointmentId}/mark_no_show/`;
          break;
        case 'Cancelled':
          endpoint = `/api/appointments/${appointmentId}/cancel/`;
          requestBody = {
            cancellation_reason: cancellationReason || 'Cancelled by psychologist'
          };
          break;
        default:
          throw new Error(`Unsupported status: ${newStatus}`);
      }
      
      console.log('Making request to:', endpoint, 'with body:', requestBody);
      const response = await api.post(endpoint, requestBody);
      console.log('Status update response:', response);
      
      if (response.status === 200) {
        // Refresh appointments after status update
        await fetchAppointments();
        Alert.alert('Success', 'Appointment status updated successfully');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      console.error('Error details:', error.response?.data);
      Alert.alert('Error', 'Failed to update appointment status. Please try again.');
    }
  };

  // Function to scroll to center week
  const scrollToCenterWeek = () => {
    if (scrollViewRef.current) {
      const centerWeekOffset = 3 * 350; // 3 weeks * 350px per week
      scrollViewRef.current.scrollTo({ x: centerWeekOffset, animated: true });
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  // Fetch latest appointment details when modal opens
  useEffect(() => {
    if (showAppointmentDetails && selectedAppointment) {
      const fetchDetails = async () => {
        setDetailsLoading(true);
        try {
          const token = await AsyncStorage.getItem('access_token');
          const id = selectedAppointment.originalData?.appointment_id || selectedAppointment.id;
          const res = await api.get(`/api/appointments/${id}/`, {
            headers: { Authorization: `Token ${token}` },
          });
          setAppointmentDetails(res.data);
        } catch (err) {
          setAppointmentDetails(null);
        } finally {
          setDetailsLoading(false);
        }
      };
      fetchDetails();
    } else {
      setAppointmentDetails(null);
    }
  }, [showAppointmentDetails, selectedAppointment]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View 
          style={[
            styles.loadingSpinner,
            { transform: [{ rotate: spin }] }
          ]} 
        />
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

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.monthName}>
            {(tempWeekStart || currentWeekStart).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </Text>
          <TouchableOpacity style={styles.todayButton} onPress={goToCurrentWeek}>
            <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Strip */}
      <View style={styles.calendarStrip}>
        <View style={styles.weekDays}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <View key={`${day}-${index}`} style={styles.weekDay}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekStrip}
          ref={scrollViewRef}
          scrollEventThrottle={16}
          pagingEnabled={false}
          decelerationRate="normal"
          directionalLockEnabled={false}
          alwaysBounceHorizontal={true}
          bounces={true}
          onScroll={(event) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const weekWidth = 350; // Approximate width of one week
            const weekIndex = Math.round(offsetX / weekWidth);

            // Update temporary week for real-time month display
            if (weekIndex !== 3) { // 3 is the center week
              const newWeekStart = new Date(currentWeekStart);
              newWeekStart.setDate(currentWeekStart.getDate() + (3 - weekIndex) * 7);
              setTempWeekStart(newWeekStart);
            } else {
              setTempWeekStart(null);
            }
          }}
          onMomentumScrollEnd={(event) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const weekWidth = 350; // Approximate width of one week
            const weekIndex = Math.round(offsetX / weekWidth);

            // Final update when scroll momentum ends
            if (weekIndex !== 3) { // 3 is the center week
              const newWeekStart = new Date(currentWeekStart);
              newWeekStart.setDate(currentWeekStart.getDate() + (3 - weekIndex) * 7);
              setCurrentWeekStart(newWeekStart);
            }
            setTempWeekStart(null);
          }}
        >
          {generateWeekDates().map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateItem,
                date.isSelected && styles.selectedDateItem
              ]}
              onPress={() => onDateSelect(date.date)}
            >
              <Text style={styles.dayNameText}>{date.dayName}</Text>
              <Text style={[
                styles.dateText,
                date.isSelected && styles.selectedDateText
              ]}>
                {date.day}
              </Text>
              {date.hasAppointments && (
                <View style={styles.appointmentIndicator}>
                  <Text style={styles.appointmentCount}>
                    {date.appointmentCount > 3 ? '3+' : date.appointmentCount}
                  </Text>
                </View>
              )}
              {date.isToday && <View style={styles.todayIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.expandButton}>
          <Text style={styles.expandIcon}>⌄</Text>
        </TouchableOpacity>
      </View>

      {/* Day Schedule View */}
      {selectedDate && (
      <View style={styles.scheduleContainer}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleDateTitle}>
              Schedule for {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
              </View>
          <ScrollView
            style={styles.scheduleScroll}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#6c5ce7']}
                tintColor="#6c5ce7"
              />
            }
          >
            {loading ? (
              <View style={styles.emptySchedule}>
                <Text style={styles.emptyScheduleText}>Loading appointments...</Text>
              </View>
            ) : getAppointmentsForSelectedDate().length > 0 ? (
              getAppointmentsForSelectedDate().map((appointment, index) => (
                <TouchableOpacity
                  key={appointment.id}
                  style={styles.appointmentCard}
                  onPress={() => handleAppointmentAction(appointment, 'view')}
                >
                    <View style={[
                    styles.appointmentAccent,
                      { backgroundColor: getEventColor(appointment.sessionType) }
                    ]} />
                  <View style={styles.appointmentContent}>
                    <Text style={styles.appointmentTitle}>
                        {appointment.childName} - {appointment.sessionType}
                      </Text>
                    <Text style={styles.appointmentTime}>
                        {formatTime(appointment.scheduledStartTime)} - {formatTime(appointment.scheduledEndTime)}
                      </Text>
                    <Text style={styles.appointmentParent}>
                      Parent: {appointment.parentName}
                    </Text>
                    <View style={styles.appointmentStatus}>
                        <Text style={[
                          styles.statusText,
                          { color: getStatusColor(appointment.status) }
                        ]}>
                          {appointment.status}
                        </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : error ? (
              <View style={styles.emptySchedule}>
                <Text style={styles.emptyScheduleText}>Error: {error}</Text>
                          <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchAppointments}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptySchedule}>
                <Text style={styles.emptyScheduleText}>No appointments scheduled for this day</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* No date selected message */}
      {!selectedDate && (
        <View style={styles.noDateSelectedContainer}>
          <Text style={styles.noDateSelectedText}>
            Select a date from the calendar above to view your schedule
          </Text>
        </View>
      )}

      {/* Appointment Details Modal */}
      {showAppointmentDetails && selectedAppointment && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Appointment Details</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedAppointment.status) }]}> 
                  <Text style={styles.statusBadgeText}>{selectedAppointment.status}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => {
                  setShowAppointmentDetails(false);
                  setSelectedAppointment(null);
                }}
              >
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {detailsLoading ? (
                <Text style={{ textAlign: 'center', marginVertical: 40 }}>Loading...</Text>
              ) : appointmentDetails ? (
                <>
                  {/* Patient Information */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Patient Information</Text>
                    <View style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Child Name</Text>
                        <Text style={styles.infoValue}>{appointmentDetails.child_name}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Parent/Guardian</Text>
                        <Text style={styles.infoValue}>{appointmentDetails.parent?.full_name || appointmentDetails.parent_name}</Text>
                      </View>
                    </View>
                  </View>
                  {/* Session Details */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Session Details</Text>
                    <View style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Date & Time</Text>
                        <Text style={styles.infoValue}>{formatAppointmentTime(appointmentDetails.scheduled_start_time)}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Session Type</Text>
                        <Text style={styles.infoValue}>{appointmentDetails.session_type}</Text>
                      </View>
                    </View>
                  </View>
                  {/* Notes Section */}
                  {appointmentDetails.parent_notes && (
                    <View style={styles.infoSection}>
                      <Text style={styles.sectionTitle}>Notes</Text>
                      <View style={styles.notesCard}>
                        <Text style={styles.notesText}>{appointmentDetails.parent_notes}</Text>
                      </View>
                    </View>
                  )}
                  {/* Meeting Link Section */}
                  {appointmentDetails.session_type === 'OnlineMeeting' && appointmentDetails.meeting_link && (
                    <View style={styles.infoSection}>
                      <Text style={styles.sectionTitle}>Zoom Meeting</Text>
                      <View style={styles.linkCard}>
                        <Text style={styles.linkText} numberOfLines={2} ellipsizeMode="tail">
                          {appointmentDetails.meeting_link}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.primaryButton, { marginTop: 12 }]}
                        onPress={() => openZoomLink(appointmentDetails.meeting_link)}
                      >
                        <Text style={styles.actionButtonText}>Join Meeting</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                <Text style={{ color: '#f44336', textAlign: 'center', marginVertical: 40 }}>Could not load appointment details.</Text>
              )}
            </ScrollView>
            {/* Professional Action Buttons */}
            <View style={styles.modalActions}>
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.dangerButton]}
                  onPress={() => handleAppointmentAction(selectedAppointment, 'noShow')}
                >
                  <Text style={styles.actionButtonText}>Mark as No-Show</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#6c5ce7',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  monthName: {
    fontSize: 20,
    fontStyle: 'italic',
    fontFamily: 'serif',
    color: 'white',
    fontWeight: '500',
  },
  todayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  todayButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  calendarStrip: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 20,
    minWidth: 2450, // 7 weeks * 350px per week
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  dateItem: {
    width: 50,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 2,
    marginHorizontal: 2,
    paddingVertical: 4,
  },
  selectedDateItem: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#6c5ce7',
  },
  dayNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  selectedDateText: {
    fontWeight: 'bold',
    color: '#6c5ce7',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6c5ce7',
  },
  expandButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  expandIcon: {
    fontSize: 16,
    color: '#6c757d',
  },
  scheduleContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  scheduleHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  scheduleDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  scheduleScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timeSlotRow: {
    flexDirection: 'row',
    minHeight: 60,
    paddingVertical: 8,
  },
  timeColumn: {
    width: 60,
    paddingTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  eventsColumn: {
    flex: 1,
    paddingLeft: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
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
  eventAccent: {
    width: 4,
    backgroundColor: '#FF9800',
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  eventNotes: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 8,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#6c5ce7',
    borderBottomColor: 'transparent',
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
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  appointmentIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  appointmentCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  eventStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noDateSelectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDateSelectedText: {
    color: '#6c757d',
    fontSize: 16,
    textAlign: 'center',
  },
  appointmentAccent: {
    width: 4,
    backgroundColor: '#FF9800',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  appointmentContent: {
    flex: 1,
    padding: 16,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 4,
  },
  appointmentParent: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
  },
  appointmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  emptySchedule: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyScheduleText: {
    color: '#6c757d',
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeModalButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
  },
  modalBody: {
    padding: 24,
    maxHeight: 400,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  notesCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  notesText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    fontWeight: '400',
  },
  linkCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  linkText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    fontWeight: '400',
  },
  modalActions: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.3,
  },
  primaryButton: {
    backgroundColor: '#6c5ce7',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default Calendar;
