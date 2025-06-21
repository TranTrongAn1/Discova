import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import api from '../(auth)/api';

const Availability = () => {
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [repeatWeekly, setRepeatWeekly] = useState(true);

  // Time slots configuration (30-minute intervals)
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30'
  ];

  // Days of the week (fixed order: Monday-Sunday)
  const daysOfWeek = [
    { key: 1, name: 'Monday', short: 'Mon' },
    { key: 2, name: 'Tuesday', short: 'Tue' },
    { key: 3, name: 'Wednesday', short: 'Wed' },
    { key: 4, name: 'Thursday', short: 'Thu' },
    { key: 5, name: 'Friday', short: 'Fri' },
    { key: 6, name: 'Saturday', short: 'Sat' },
    { key: 0, name: 'Sunday', short: 'Sun' },
  ];

  // Fetch existing availability
  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/psychologists/availability/my_availability/');
      
      // Transform API data to our format
      const availabilityData = {};
      if (response.data && response.data.results) {
        response.data.results.forEach(block => {
          const dayKey = block.day_of_week;
          if (!availabilityData[dayKey]) {
            availabilityData[dayKey] = [];
          }
          availabilityData[dayKey].push({
            start_time: block.start_time,
            end_time: block.end_time,
            is_recurring: block.is_recurring,
            availability_id: block.availability_id
          });
        });
      }
      
      setAvailability(availabilityData);
    } catch (error) {
      console.error('Error fetching availability:', error);
      Alert.alert('Error', 'Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  // Toggle time slot selection
  const toggleTimeSlot = (dayOfWeek, timeSlot) => {
    setAvailability(prev => {
      const newAvailability = { ...prev };
      
      if (!newAvailability[dayOfWeek]) {
        newAvailability[dayOfWeek] = [];
      }

      // Check if this time slot is already selected
      const existingIndex = newAvailability[dayOfWeek].findIndex(
        block => block.start_time === timeSlot
      );

      if (existingIndex >= 0) {
        // Remove the time slot
        newAvailability[dayOfWeek].splice(existingIndex, 1);
        if (newAvailability[dayOfWeek].length === 0) {
          delete newAvailability[dayOfWeek];
        }
      } else {
        // Add the time slot (30-minute block)
        const endTime = addMinutes(timeSlot, 30);
        newAvailability[dayOfWeek].push({
          start_time: timeSlot,
          end_time: endTime,
          is_recurring: repeatWeekly
        });
      }

      return newAvailability;
    });
  };

  // Helper function to add minutes to time
  const addMinutes = (time, minutes) => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  // Check if a time slot is selected
  const isTimeSlotSelected = (dayOfWeek, timeSlot) => {
    if (!availability[dayOfWeek]) return false;
    return availability[dayOfWeek].some(
      block => block.start_time === timeSlot
    );
  };

  // Save availability
  const saveAvailability = async () => {
    try {
      setSaving(true);
      
      // Prepare data for bulk create
      const weeklySchedule = {};
      
      Object.keys(availability).forEach(dayOfWeek => {
        const dayName = daysOfWeek.find(d => d.key === parseInt(dayOfWeek))?.name.toLowerCase();
        if (dayName) {
          weeklySchedule[dayName] = availability[dayOfWeek].map(block => ({
            start_time: block.start_time,
            end_time: block.end_time
          }));
        }
      });

      console.log('Saving weekly schedule:', weeklySchedule);

      // Use bulk create endpoint
      const response = await api.post('/api/psychologists/availability/bulk_create/', {
        weekly_schedule: weeklySchedule
      });

      Alert.alert('Success', 'Availability schedule saved successfully!');
      fetchAvailability(); // Refresh data
    } catch (error) {
      console.error('Error saving availability:', error);
      Alert.alert('Error', 'Failed to save availability schedule');
    } finally {
      setSaving(false);
    }
  };

  // Clear all availability
  const clearAvailability = () => {
    Alert.alert(
      'Clear Schedule',
      'Are you sure you want to clear all availability?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => setAvailability({})
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading availability...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Set Availability</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.clearButton} onPress={clearAvailability}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={saveAvailability}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Repeat Weekly Toggle */}
      <View style={styles.repeatContainer}>
        <Text style={styles.repeatLabel}>Repeat weekly schedule</Text>
        <Switch
          value={repeatWeekly}
          onValueChange={setRepeatWeekly}
          trackColor={{ false: '#767577', true: '#6c5ce7' }}
          thumbColor={repeatWeekly ? '#ffffff' : '#f4f3f4'}
        />
      </View>

      {/* Weekly Schedule Table */}
      <ScrollView style={styles.tableContainer} horizontal>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeHeaderText}>Time</Text>
            </View>
            {daysOfWeek.map((day, index) => (
              <View key={index} style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>{day.short}</Text>
                <Text style={styles.dateHeaderText}>{day.name}</Text>
              </View>
            ))}
          </View>

          {/* Time Slots Rows */}
          {timeSlots.map((timeSlot, timeIndex) => (
            <View key={timeIndex} style={styles.timeRow}>
              <View style={styles.timeCell}>
                <Text style={styles.timeText}>{timeSlot}</Text>
              </View>
              {daysOfWeek.map((day, dayIndex) => (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.timeSlot,
                    isTimeSlotSelected(day.key, timeSlot) && styles.selectedTimeSlot
                  ]}
                  onPress={() => toggleTimeSlot(day.key, timeSlot)}
                >
                  {isTimeSlotSelected(day.key, timeSlot) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How to use:</Text>
        <Text style={styles.instructionsText}>
          • Tap on time slots to select/deselect your availability{'\n'}
          • Each slot represents 30 minutes{'\n'}
          • Toggle "Repeat weekly" to apply the same schedule every week{'\n'}
          • Click "Save" to apply your schedule
        </Text>
      </View>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#b8b5d6',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  repeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
  repeatLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  tableContainer: {
    flex: 1,
    margin: 16,
  },
  table: {
    backgroundColor: 'white',
    borderRadius: 12,
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
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#6c5ce7',
  },
  timeHeader: {
    width: 80,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeHeaderText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  dayHeader: {
    width: 100,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.2)',
  },
  dayHeaderText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  dateHeaderText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  timeCell: {
    width: 80,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
  },
  timeText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  timeSlot: {
    width: 100,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    backgroundColor: 'white',
  },
  selectedTimeSlot: {
    backgroundColor: '#6c5ce7',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    padding: 16,
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
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
    fontSize: 16,
  },
});

export default Availability; 