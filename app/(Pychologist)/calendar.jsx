import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

const mockAppointments = [
  { id: '1', date: '2025-10-10', time: '10:00 AM', title: 'Send typing results' },
  { id: '2', date: '2025-10-14', time: '3:00 PM', title: 'Assignment 1' },
  { id: '3', date: '2025-10-16', time: '9:00 AM', title: 'Assignment 2' },
];

const getUpcomingAppointments = (appointments, today) => {
  return appointments
    .filter(appt => moment(appt.date).isSameOrAfter(today))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);
};


const CalendarScreen = () => {
  const today = moment().format('YYYY-MM-DD');
  const upcoming = getUpcomingAppointments(mockAppointments, today);

  const markedDates = {
  [today]: {
    selected: true,
    marked: true,
    selectedColor: '#6c63ff',
  },
};

mockAppointments.forEach((appt) => {
  markedDates[appt.date] = {
    ...markedDates[appt.date],
    marked: true,
    dotColor: '#ff5252',
  };
});
  return (
    <View style={styles.container}>
      {/* Calendar */}
      <Calendar
        current={today}
        markedDates={markedDates}
        theme={{
          todayTextColor: '#6c63ff',
          arrowColor: '#6c63ff',
          selectedDayBackgroundColor: '#6c63ff',
        }}
      />


      {/* Appointments List */}
      <View style={styles.appointmentContainer}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        {upcoming.length > 0 ? (
          <FlatList
            data={upcoming}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.appointmentCard}>
                <Text style={styles.dateText}>{moment(item.date).format('ddd, MMM D')}</Text>
                <Text style={styles.titleText}>{item.title}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noAppointments}>No upcoming appointments 🎉</Text>
        )}
      </View>
    </View>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  appointmentContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  appointmentCard: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c63ff',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  noAppointments: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});
