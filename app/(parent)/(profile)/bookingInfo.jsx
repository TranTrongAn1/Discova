import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

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

// Simulated appointment data for multiple days
const sampleAppointments = {
  '2025-05-26': [
    {
      startHour: 9,
      endHour: 10,
      title: 'Child therapy session',
      avatars: [
        'https://randomuser.me/api/portraits/men/1.jpg',
        'https://randomuser.me/api/portraits/women/2.jpg',
      ],
    },
    {
      startHour: 13,
      endHour: 14,
      title: 'Parent follow-up call',
      avatars: ['https://randomuser.me/api/portraits/women/3.jpg'],
    },
  ],
  '2025-05-27': [
    {
      startHour: 10,
      endHour: 11,
      title: 'Session with new client',
      avatars: ['https://randomuser.me/api/portraits/men/4.jpg'],
    },
  ],
};

const BookingInfo = () => {
  const week = getCurrentWeek();
  const todayIndex = week.findIndex((d) => d.isToday);
  const [selectedDateKey, setSelectedDateKey] = useState(week[todayIndex].key);

  const hours = Array.from({ length: 10 }, (_, i) => 8 + i); // 08:00 to 17:00
  const appointments = sampleAppointments[selectedDateKey] || [];

  return (
    <View style={styles.container}>
      {/* Weekday Header */}
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

      {/* Schedule Label */}
      <Text style={styles.scheduleTitle}>Schedule</Text>

      {/* Scrollable Time Column */}
      <ScrollView contentContainerStyle={styles.scrollArea}>
        {hours.map((hour) => {
          const appt = appointments.find((a) => a.startHour === hour);
          const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

          return (
            <View key={hour} style={styles.timeSlot}>
              <Text style={styles.timeText}>{timeLabel}</Text>

              {appt ? (
                <View style={styles.appointmentCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{appt.title}</Text>
                    <Text style={styles.cardTime}>
                      {appt.startHour}:00 - {appt.endHour}:00
                    </Text>
                  </View>
                  <View style={styles.avatars}>
                    {appt.avatars.map((uri, idx) => (
                      <Image
                        key={idx}
                        source={{ uri }}
                        style={[
                          styles.avatar,
                          { marginLeft: idx === 0 ? 0 : -10 },
                        ]}
                      />
                    ))}
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
  );
};

export default BookingInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  dateBox: {
    alignItems: 'center',
    padding: 6,
  },
  selectedDateBox: {
    backgroundColor: '#ffe6e6',
    borderRadius: 12,
  },
  dayLabel: {
    fontSize: 12,
    color: '#888',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedText: {
    color: '#e33',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e33',
    marginTop: 2,
  },
  scheduleTitle: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  scrollArea: {
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  timeText: {
    width: 60,
    fontSize: 13,
    color: '#888',
  },
  emptyLine: {
    flex: 1,
    height: 40,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginLeft: 10,
  },
  appointmentCard: {
    flex: 1,
    backgroundColor: '#f2547d',
    padding: 12,
    borderRadius: 16,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardTime: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  avatars: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
