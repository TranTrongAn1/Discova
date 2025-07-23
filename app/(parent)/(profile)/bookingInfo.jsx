import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import api from '../../(auth)/api';
// Get the current week's dates (Monday to Sunday)
const getCurrentWeek = () => {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday
  const mondayOffset = day === 0 ? -6 : 1 - day;

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + mondayOffset + i);
    return {
      date: date,
      dateNum: date.getDate(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue
      isToday: date.toDateString() === new Date().toDateString(),
      key: date.toISOString().split('T')[0],
    };
  });
};


const BookingInfo = () => {
  const week = getCurrentWeek();
  const todayIndex = week.findIndex((d) => d.isToday);
  const [selectedDateKey, setSelectedDateKey] = useState(week[todayIndex].key);
  const [appointmentsData, setAppointmentsData] = useState({});

  const hours = Array.from({ length: 10 }, (_, i) => 8 + i); // 08:00 to 17:00

  // Fetch and process data
  useEffect(() => {
    const fetchAppointments = async () => {

      try {
         const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          console.warn('No token found');
          return;
        }
        const res = await api.get('/api/appointments/',{
          headers: {
              Authorization: `Token ${token}`,
            },
        });
        const fetched = res.data.results;

        const formatted = {};

        fetched.forEach((appt) => {
          const startDate = new Date(appt.scheduled_start_time);
          const endDate = new Date(appt.scheduled_end_time);
          const dateKey = startDate.toISOString().split('T')[0];

          if (!formatted[dateKey]) formatted[dateKey] = [];

          formatted[dateKey].push({
            startHour: startDate.getUTCHours(),
            endHour: endDate.getHours(),
            title: `${appt.child_name} - ${appt.session_type}`,
          });

        });

        setAppointmentsData(formatted);
        console.log('Formatted appointments:', formatted);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, []);

  const appointments = appointmentsData[selectedDateKey] || [];

console.log('Selected Date:', selectedDateKey);
console.log('Appointments for selected date:', appointments);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Appointments</Text>
      </View>

      {/* Calendar Section */}
      <View style={styles.calendarSection}>
        <View style={styles.weekRow}>
          {week.map((d) => (
            <TouchableOpacity
              key={d.key}
              onPress={() => setSelectedDateKey(d.key)}
              style={[
                styles.dateBox,
                selectedDateKey === d.key && styles.selectedDateBox,
              ]}
            >
              <Text
                style={[
                  styles.dayLabel,
                  selectedDateKey === d.key && styles.selectedText,
                ]}
              >
                {d.dayName}
              </Text>
              <Text
                style={[
                  styles.dateLabel,
                  selectedDateKey === d.key && styles.selectedText,
                ]}
              >
                {d.dateNum}
              </Text>
              {d.isToday && <View style={styles.dot} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Schedule Section */}
      <View style={styles.scheduleSection}>
        <Text style={styles.scheduleTitle}>Schedule</Text>

        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {hours.map((hour) => {
            const appt = appointments.find((a) => a.startHour === hour);
            const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

            return (
              <View key={hour} style={styles.timeSlot}>
                <Text style={styles.timeText}>{timeLabel}</Text>

                {appt ? (
                  <View style={styles.appointmentCard}>
                    <View style={styles.appointmentContent}>
                      <Text style={styles.cardTitle}>{appt.title}</Text>
                      <Text style={styles.cardTime}>
                        {appt.startHour}:00 - {appt.endHour}:00
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyLine} />
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

export default BookingInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9ff',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e8eaff',
  },
  backButtonText: {
    fontSize: 15,
    color: '#6c63ff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
  },
  calendarSection: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  dateBox: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 50,
  },
  selectedDateBox: {
    backgroundColor: '#e8eaff',
    borderWidth: 1,
    borderColor: '#6c63ff',
  },
  dayLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
  },
  selectedText: {
    color: '#6c63ff',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6c63ff',
    marginTop: 4,
  },
  scheduleSection: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 20,
  },
  scrollArea: {
    flex: 1,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  timeText: {
    width: 60,
    fontSize: 14,
    color: '#718096',
    fontWeight: '600',
  },
  emptyLine: {
    flex: 1,
    height: 40,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginLeft: 12,
  },
  appointmentCard: {
    flex: 1,
    backgroundColor: '#6c63ff',
    padding: 16,
    borderRadius: 12,
    marginLeft: 12,
    shadowColor: '#6c63ff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  appointmentContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardTime: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.9,
  },
});
