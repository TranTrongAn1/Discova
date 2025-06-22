import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import api from '../(auth)/api';

const Availability = () => {
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [psychologistUUID, setPsychologistUUID] = useState(null);
  const [availabilityRules, setAvailabilityRules] = useState([]);
  const [appointmentSlots, setAppointmentSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [showDailyDetails, setShowDailyDetails] = useState(false);
  const [newRule, setNewRule] = useState({
    is_recurring: true,
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    specific_date: '',
  });

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

  // Days of the week for the form
  const daysOfWeek = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 0, label: 'Sunday' },
  ];

  // Fetch psychologist profile to get UUID
  const fetchPsychologistProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/psychologists/profile/profile/');
      console.log('Psychologist profile response:', response.data);

      // Try different possible response structures
      let uuid = null;
      if (response.data && response.data.user && response.data.user.id) {
        uuid = response.data.user.id;
      } else if (response.data && response.data.id) {
        uuid = response.data.id;
      } else if (response.data && response.data.user_id) {
        uuid = response.data.user_id;
      } else if (response.data && response.data.psychologist_id) {
        uuid = response.data.psychologist_id;
      }

      if (uuid) {
        setPsychologistUUID(uuid);
        console.log('Psychologist UUID set:', uuid);
      } else {
        console.error('No psychologist UUID found in response:', response.data);
        // Set a fallback UUID to prevent infinite loading
        setPsychologistUUID('fallback-uuid');
      }
    } catch (error) {
      console.error('Error fetching psychologist profile:', error);
      Alert.alert('Error', 'Failed to load psychologist profile');
      // Set a fallback UUID to prevent infinite loading
      setPsychologistUUID('fallback-uuid');
    }
  };

  // Fetch appointment slots for calendar display
  const fetchAppointmentSlots = async () => {
    try {
      const response = await api.get('/api/appointments/slots/my_slots/');
      console.log('Appointment slots response:', response.data);

      // Transform slots data for calendar
      const slots = {};
      if (response.data && response.data.slots) {
        response.data.slots.forEach(slot => {
          console.log('Processing slot:', slot);
          const date = slot.slot_date;
          if (!slots[date]) {
            slots[date] = [];
          }
          slots[date].push({
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_available: slot.is_available_for_booking
          });
        });
      }

      console.log('Transformed slots:', slots);
      setAppointmentSlots(slots);
    } catch (error) {
      console.error('Error fetching appointment slots:', error);
      Alert.alert('Error', 'Failed to load appointment slots');
    }
  };

  // Fetch availability rules for management modal
  const fetchAvailabilityRules = async () => {
    try {
      const response = await api.get('/api/psychologists/availability/my_availability/');
      console.log('Availability rules response:', response.data);

      // Handle the new API response structure
      let rules = [];
      if (response.data) {
        // Combine recurring and specific availability rules
        const recurringRules = response.data.recurring_availability || [];
        const specificRules = response.data.specific_availability || [];

        // Add type indicator to each rule
        const processedRecurring = recurringRules.map(rule => ({ ...rule, rule_type: 'recurring' }));
        const processedSpecific = specificRules.map(rule => ({ ...rule, rule_type: 'specific' }));

        rules = [...processedRecurring, ...processedSpecific];
      }

      console.log('Processed availability rules:', rules);
      setAvailabilityRules(rules);
    } catch (error) {
      console.error('Error fetching availability rules:', error);
      // If it's a 404, it means no availability rules exist yet, which is normal
      if (error.response?.status === 404) {
        console.log('No availability rules found yet - this is normal for new users');
        setAvailabilityRules([]);
      } else {
        console.error('Unexpected error loading availability rules:', error.response?.data);
        setAvailabilityRules([]);
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchPsychologistProfile();
        await fetchAppointmentSlots();
        await fetchAvailabilityRules();
      } catch (error) {
        console.error('Error in loadData:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Loading timeout reached, forcing loading to false');
      setLoading(false);
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeout);
  }, []);

  // Generate appointment slots from availability rules
  const generateAppointmentSlots = async () => {
    try {
      console.log('Generating appointment slots...');
      const response = await api.post('/api/appointments/slots/generate_slots/', {
        date_from: new Date().toISOString().split('T')[0], // Today
        date_to: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days from now
      });

      console.log('Slot generation response:', response.data);

      if (response.data.message) {
        console.log('Slots generated successfully:', response.data.total_slots_created, 'slots created');
        // Refresh appointment slots after generation
        await fetchAppointmentSlots();
      }
    } catch (error) {
      console.error('Error generating appointment slots:', error);
      // Don't show alert as this is a background process
    }
  };

  // Add new availability rule
  const addAvailabilityRule = async () => {
    try {
      // Check if we have the psychologist UUID
      if (!psychologistUUID) {
        Alert.alert('Error', 'Psychologist profile not loaded. Please try again.');
        return;
      }

      // Validate form data
      if (!newRule.start_time || !newRule.end_time) {
        Alert.alert('Error', 'Please fill in start and end times');
        return;
      }

      if (newRule.is_recurring && newRule.day_of_week === undefined) {
        Alert.alert('Error', 'Please select a day of the week');
        return;
      }

      if (!newRule.is_recurring && !newRule.specific_date) {
        Alert.alert('Error', 'Please enter a specific date');
        return;
      }

      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(newRule.start_time) || !timeRegex.test(newRule.end_time)) {
        Alert.alert('Error', 'Please enter valid time format (HH:MM)');
        return;
      }

      // Validate that end time is after start time
      const startTime = new Date(`2000-01-01T${newRule.start_time}:00`);
      const endTime = new Date(`2000-01-01T${newRule.end_time}:00`);
      if (endTime <= startTime) {
        Alert.alert('Error', 'End time must be after start time');
        return;
      }

      // Validate date format for specific date
      if (!newRule.is_recurring) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(newRule.specific_date)) {
          Alert.alert('Error', 'Please enter date in YYYY-MM-DD format');
          return;
        }

        // Check if date is in the future
        const selectedDate = new Date(newRule.specific_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          Alert.alert('Error', 'Date must be today or in the future');
          return;
        }
      }

      const ruleData = {
        psychologist: psychologistUUID,
        is_recurring: newRule.is_recurring,
        start_time: newRule.start_time,
        end_time: newRule.end_time,
        day_of_week: newRule.is_recurring ? newRule.day_of_week : 0, // Default to Sunday for non-recurring
        specific_date: newRule.is_recurring ? null : newRule.specific_date
      };

      console.log('Sending availability rule data:', ruleData);

      const response = await api.post('/api/psychologists/availability/', ruleData);

      if (response.data) {
        console.log('Availability rule created:', response.data);
        Alert.alert('Success', 'Availability rule added successfully');

        // Reset form
        setNewRule({
          rule_type: 'recurring',
          day_of_week: 1,
          start_time: '09:00',
          end_time: '17:00',
          specific_date: '',
        });

        // Refresh availability rules
        await fetchAvailabilityRules();

        // Generate appointment slots from the new rule
        await generateAppointmentSlots();
      }
    } catch (error) {
      console.error('Error adding availability rule:', error);
      if (error.response?.data) {
        console.error('API Error details:', error.response.data);
        const errorMessage = error.response.data.error || 'Unknown error occurred';

        // Handle specific error cases
        if (errorMessage.includes('overlaps with existing availability')) {
          Alert.alert('Time Conflict', 'This time slot overlaps with an existing availability rule. Please choose a different time or day.');
        } else if (errorMessage.includes('Invalid')) {
          Alert.alert('Invalid Data', 'Please check your input and try again.');
        } else {
          Alert.alert('Error', `Failed to add availability rule: ${errorMessage}`);
        }
      } else {
        Alert.alert('Error', 'Failed to add availability rule');
      }
    }
  };

  // Delete availability rule
  const deleteAvailabilityRule = async (availabilityId) => {
    console.log('Delete confirmed for ID:', availabilityId);

    if (!availabilityId) {
      console.error('No availability ID provided for deletion');
      Alert.alert('Error', 'Cannot delete: No ID found for this rule');
      return;
    }

    try {
      console.log('Attempting to delete availability rule with ID:', availabilityId);
      const response = await api.delete(`/api/psychologists/availability/${availabilityId}/`);

      console.log('Delete response:', response);

      if (response.status === 204 || response.data) {
        console.log('Availability rule deleted successfully');
        Alert.alert('Success', 'Availability rule deleted successfully');

        // Refresh availability rules
        await fetchAvailabilityRules();

        // Regenerate appointment slots after deletion
        await generateAppointmentSlots();
      }
    } catch (error) {
      console.error('Error deleting availability rule:', error);
      console.error('Error response:', error.response?.data);

      // Handle specific error cases
      if (error.response?.data?.error === 'Cannot delete availability block') {
        const reason = error.response.data.reason || 'Unknown reason';
        const suggestion = error.response.data.suggestion || '';
        Alert.alert(
          'Cannot Delete Rule',
          `${reason}\n\n${suggestion}`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert('Error', `Failed to delete availability rule: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  // Format time for display
  const formatTime = (time) => {
    if (!time || typeof time !== 'string') {
      console.log('Invalid time value:', time);
      return '00:00';
    }
    return time.substring(0, 5); // Remove seconds if present
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Get day name from day_of_week
  const getDayName = (dayOfWeek) => {
    if (dayOfWeek === undefined || dayOfWeek === null) {
      console.log('Invalid day_of_week value:', dayOfWeek);
      return 'Unknown';
    }
    const day = daysOfWeek.find(d => d.value === dayOfWeek);
    return day ? day.label : 'Unknown';
  };

  // Get marked dates for calendar
  const getMarkedDates = () => {
    const marked = {};

    // Mark dates with available slots
    Object.keys(appointmentSlots).forEach(date => {
      const slots = appointmentSlots[date];
      const availableSlots = slots.filter(slot => slot.is_available);

      if (availableSlots.length > 0) {
        marked[date] = {
          marked: true,
          dotColor: '#3498db',
          textColor: '#2c3e50',
          selected: selectedDate === date
        };
      }
    });

    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#6c5ce7',
        selectedTextColor: 'white'
      };
    }

    return marked;
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const timeSlots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return timeSlots;
  };

  // Check if a time slot is available
  const isTimeSlotAvailable = (dayOfWeek, timeSlot) => {
    return availabilityRules.some(rule => {
      // Only check recurring rules for the weekly schedule
      if (!rule.is_recurring && rule.rule_type !== 'recurring') {
        return false;
      }

      // Check if the day matches
      if (rule.day_of_week !== dayOfWeek) {
        return false;
      }

      // Check if the time slot falls within the rule's time range
      const startTime = rule.start_time;
      const endTime = rule.end_time;

      return timeSlot >= startTime && timeSlot < endTime;
    });
  };

  // Handle calendar day press
  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    setShowDailyDetails(true);
  };

  // Get appointments for selected date
  const getAppointmentsForSelectedDate = () => {
    if (!selectedDate || !appointmentSlots[selectedDate]) {
      return [];
    }
    return appointmentSlots[selectedDate];
  };

  // Calculate duration between two times
  const calculateDuration = (startTime, endTime) => {
    try {
      // Handle different time formats
      const formatTime = (time) => {
        if (!time) return null;
        
        // If time is already in HH:MM format, return as is
        if (typeof time === 'string' && time.includes(':')) {
          return time;
        }
        
        // If time is a number (minutes since midnight), convert to HH:MM
        if (typeof time === 'number') {
          const hours = Math.floor(time / 60);
          const minutes = time % 60;
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        
        return null;
      };

      const start = formatTime(startTime);
      const end = formatTime(endTime);
      
      if (!start || !end) {
        return '1 hour'; // fallback
      }

      // Parse times
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);
      
      if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
        return '1 hour'; // fallback
      }

      // Calculate difference in minutes
      const startTotalMinutes = startHour * 60 + startMin;
      const endTotalMinutes = endHour * 60 + endMin;
      const diffMinutes = endTotalMinutes - startTotalMinutes;
      
      if (diffMinutes <= 0) {
        return '1 hour'; // fallback
      }

      // Convert to hours and format
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      if (hours === 0) {
        return `${minutes} min`;
      } else if (minutes === 0) {
        return hours === 1 ? '1 hour' : `${hours} hours`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    } catch (error) {
      console.log('Duration calculation error:', error, 'startTime:', startTime, 'endTime:', endTime);
      return '1 hour'; // fallback
    }
  };

  if (loading || !psychologistUUID) {
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Availability</Text>
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.manageButtonText}>Manage Availability Rules</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.mainScrollView} showsVerticalScrollIndicator={false}>
        {/* Calendar View */}
        <View style={styles.calendarContainer}>
          <Text style={styles.sectionTitle}>Calendar View</Text>
          <RNCalendar
            onDayPress={onDayPress}
            markedDates={getMarkedDates()}
            markingType={'dot'}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#2c3e50',
              selectedDayBackgroundColor: '#6c5ce7',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#6c5ce7',
              dayTextColor: '#2c3e50',
              textDisabledColor: '#d9e1e8',
              dotColor: '#3498db',
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
          />
        </View>

        {/* Daily Details */}
        {showDailyDetails && selectedDate && (
          <View style={styles.dailyDetailsContainer}>
            <View style={styles.dailyDetailsHeader}>
              <View style={styles.dailyDetailsTitleContainer}>
                <Text style={styles.dailyDetailsTitle}>
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <Text style={styles.dailyDetailsSubtitle}>
                  {getAppointmentsForSelectedDate().length} time slots
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDailyDetails(false)}
                style={styles.closeDetailsButton}
              >
                <Text style={styles.closeDetailsButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.dailyDetailsScroll} showsVerticalScrollIndicator={false}>
              {getAppointmentsForSelectedDate().length === 0 ? (
                <View style={styles.noSlotsContainer}>
                  <Text style={styles.noSlotsIcon}>📅</Text>
                  <Text style={styles.noSlotsText}>No time slots available</Text>
                  <Text style={styles.noSlotsSubtext}>Add availability rules to create slots for this date</Text>
                </View>
              ) : (
                <View style={styles.slotsContainer}>
                  {getAppointmentsForSelectedDate().map((slot, index) => (
                    <View key={index} style={styles.slotItem}>
                      <View style={styles.slotTimeContainer}>
                        <View style={styles.slotTimeIcon}>
                          <Text style={styles.slotTimeIconText}>🕐</Text>
                        </View>
                        <View style={styles.slotTimeInfo}>
                          <Text style={styles.slotTimeText}>
                            {slot.start_time} - {slot.end_time}
                          </Text>
                          <Text style={styles.slotDurationText}>
                            {calculateDuration(slot.start_time, slot.end_time)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.slotStatusContainer}>
                        <View style={[
                          styles.slotStatusBadge,
                          { backgroundColor: slot.is_available ? '#e8f5e8' : '#ffeaea' }
                        ]}>
                          <Text style={[
                            styles.slotStatusText,
                            { color: slot.is_available ? '#27ae60' : '#e74c3c' }
                          ]}>
                            {slot.is_available ? 'Available' : 'Booked'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* Weekly Schedule Table */}
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>Weekly Schedule</Text>
          <ScrollView style={styles.scheduleScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.scheduleTable}>
              {/* Header Row */}
              <View style={styles.tableHeader}>
                <View style={styles.timeHeader}>
                  <Text style={styles.headerText}>Time</Text>
                </View>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <View key={day} style={styles.dayHeader}>
                    <Text style={styles.headerText}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Time Slots Rows */}
              {generateTimeSlots().map((timeSlot, rowIndex) => (
                <View key={rowIndex} style={styles.tableRow}>
                  <View style={styles.timeCell}>
                    <Text style={styles.timeText}>{timeSlot}</Text>
                  </View>
                  {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek, colIndex) => (
                    <View key={colIndex} style={styles.dayCell}>
                      {isTimeSlotAvailable(dayOfWeek, timeSlot) && (
                        <View style={styles.availableSlot}>
                          <Text style={styles.slotText}>✓</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Management Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Availability Rules</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Existing Rules List */}
              <View style={styles.rulesSection}>
                <Text style={styles.sectionTitle}>Current Rules ({availabilityRules.length})</Text>
                {availabilityRules.length === 0 ? (
                  <Text style={styles.noRulesText}>No availability rules set</Text>
                ) : (
                  availabilityRules.map((rule, index) => (
                    <View key={index} style={styles.ruleItem}>
                      <View style={styles.ruleInfo}>
                        <Text style={styles.ruleText}>
                          {rule.rule_type === 'recurring' || rule.is_recurring
                            ? getDayName(rule.day_of_week) + 's, ' + formatTime(rule.start_time) + ' - ' + formatTime(rule.end_time)
                            : (rule.specific_date || rule.date) + ', ' + formatTime(rule.start_time) + ' - ' + formatTime(rule.end_time)
                          }
                        </Text>
                        <Text style={styles.ruleType}>
                          {rule.rule_type === 'recurring' || rule.is_recurring ? 'Recurring' : 'One-time'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => {
                          setDeleteTargetId(rule.availability_id || rule.id || rule.block_id);
                          setDeleteConfirmationVisible(true);
                        }}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>


              {/* Add New Rule Form */}
              <View style={styles.addRuleSection}>
                <Text style={styles.sectionTitle}>Add New Rule</Text>

                {/* Rule Type Toggle */}
                <View style={styles.ruleTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.ruleTypeButton,
                      newRule.is_recurring && styles.ruleTypeButtonActive
                    ]}
                    onPress={() => setNewRule(prev => ({ ...prev, is_recurring: true }))}
                  >
                    <Text style={[
                      styles.ruleTypeButtonText,
                      newRule.is_recurring && styles.ruleTypeButtonTextActive
                    ]}>
                      Recurring
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.ruleTypeButton,
                      !newRule.is_recurring && styles.ruleTypeButtonActive
                    ]}
                    onPress={() => setNewRule(prev => ({ ...prev, is_recurring: false }))}
                  >
                    <Text style={[
                      styles.ruleTypeButtonText,
                      !newRule.is_recurring && styles.ruleTypeButtonTextActive
                    ]}>
                      Specific Date
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Day of Week (for recurring) */}
                {newRule.is_recurring && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Day of Week</Text>
                    <View style={styles.pickerContainer}>
                      {daysOfWeek.map((day) => (
                        <TouchableOpacity
                          key={day.value}
                          style={[
                            styles.dayButton,
                            newRule.day_of_week === day.value && styles.dayButtonActive
                          ]}
                          onPress={() => setNewRule(prev => ({ ...prev, day_of_week: day.value }))}
                        >
                          <Text style={[
                            styles.dayButtonText,
                            newRule.day_of_week === day.value && styles.dayButtonTextActive
                          ]}>
                            {day.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Specific Date (for one-time) */}
                {!newRule.is_recurring && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Date</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newRule.specific_date}
                      onChangeText={(text) => {
                        // Only allow numbers and hyphens
                        const cleaned = text.replace(/[^0-9-]/g, '');
                        setNewRule(prev => ({ ...prev, specific_date: cleaned }));
                      }}
                      placeholder="YYYY-MM-DD (e.g., 2024-12-25)"
                      placeholderTextColor="#999"
                      maxLength={10}
                      keyboardType="numeric"
                    />
                    <Text style={styles.inputHint}>
                      Enter date in YYYY-MM-DD format
                    </Text>
                  </View>
                )}

                {/* Time Range */}
                <View style={styles.timeContainer}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.inputLabel}>Start Time</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newRule.start_time}
                      onChangeText={(text) => setNewRule(prev => ({ ...prev, start_time: text }))}
                      placeholder="09:00"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.inputLabel}>End Time</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newRule.end_time}
                      onChangeText={(text) => setNewRule(prev => ({ ...prev, end_time: text }))}
                      placeholder="17:00"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>

                {/* Add Button */}
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addAvailabilityRule}
                >
                  <Text style={styles.addButtonText}>Add Rule</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteConfirmationVisible}
        onRequestClose={() => setDeleteConfirmationVisible(false)}
      >
        <View style={styles.deleteConfirmationOverlay}>
          <View style={styles.deleteConfirmationContent}>
            <Text style={styles.deleteConfirmationTitle}>Confirm Deletion</Text>
            <Text style={styles.deleteConfirmationMessage}>
              Are you sure you want to delete this availability rule?
            </Text>
            <View style={styles.deleteConfirmationButtons}>
              <TouchableOpacity
                style={styles.deleteConfirmationButton}
                onPress={() => {
                  setDeleteConfirmationVisible(false);
                  deleteAvailabilityRule(deleteTargetId);
                }}
              >
                <Text style={styles.deleteConfirmationButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteConfirmationButton, { backgroundColor: '#95a5a6', marginRight: 0, marginLeft: 8 }]}
                onPress={() => setDeleteConfirmationVisible(false)}
              >
                <Text style={styles.deleteConfirmationButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  manageButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  mainScrollView: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  dailyDetailsContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  dailyDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  dailyDetailsTitleContainer: {
    flex: 1,
  },
  dailyDetailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  dailyDetailsSubtitle: {
    fontSize: 14,
    color: '#6c5ce7',
    fontWeight: '600',
  },
  closeDetailsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeDetailsButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  dailyDetailsScroll: {
    maxHeight: 300,
  },
  noSlotsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noSlotsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noSlotsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  noSlotsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  slotsContainer: {
    padding: 16,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  slotTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  slotTimeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6c5ce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  slotTimeIconText: {
    fontSize: 18,
  },
  slotTimeInfo: {
    flex: 1,
  },
  slotTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  slotDurationText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  slotStatusContainer: {
    alignItems: 'flex-end',
  },
  slotStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  slotStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scheduleContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
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
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  scheduleScrollView: {
    maxHeight: 600,
  },
  scheduleTable: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#6c5ce7',
  },
  timeHeader: {
    width: 70,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeader: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  timeCell: {
    width: 70,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  dayCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  availableSlot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  rulesSection: {
    marginBottom: 32,
  },
  noRulesText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  ruleInfo: {
    flex: 1,
    marginRight: 12,
  },
  ruleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  ruleType: {
    fontSize: 13,
    color: '#6c5ce7',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deleteButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  addRuleSection: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
  },
  ruleTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    padding: 4,
  },
  ruleTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  ruleTypeButtonActive: {
    backgroundColor: '#6c5ce7',
  },
  ruleTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  ruleTypeButtonTextActive: {
    color: 'white',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dayButtonActive: {
    backgroundColor: '#6c5ce7',
    borderColor: '#6c5ce7',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  dayButtonTextActive: {
    color: 'white',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2c3e50',
    backgroundColor: 'white',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timeInputContainer: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  debugSection: {
    marginTop: 32,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  deleteConfirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteConfirmationContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
    padding: 20,
  },
  deleteConfirmationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  deleteConfirmationMessage: {
    color: '#666',
    fontSize: 16,
    marginBottom: 20,
  },
  deleteConfirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteConfirmationButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  deleteConfirmationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Availability;