import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const psychologist = {
  name: 'BS CKI. Vũ Thị Hà',
  specialty: 'Tư vấn và điều trị tâm lý học đường, trầm cảm, lo âu, rối loạn cảm xúc...',
  introduction:
    'Bác sĩ Hà là chuyên gia hàng đầu trong lĩnh vực tâm lý học đường với hơn 15 năm kinh nghiệm. Bà đã giúp hàng trăm học sinh vượt qua các vấn đề về lo âu, trầm cảm và định hướng học tập.',
  price: '150.000',
  image: 'https://randomuser.me/api/portraits/women/44.jpg',
  schedule: {
    'Thứ 2': ['8:00-9:00', '9:00-10:00'],
    'Thứ 3': ['10:00-11:00', '13:00-14:00'],
    'Thứ 5': ['14:00-15:00', '15:00-16:00'],
    'Thứ 7': ['8:00-9:00', '9:00-10:00'],
  },
};

const PsychologistDetails = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Image + Name + Specialty */}
      <View style={styles.headerRow}>
        <Image source={{ uri: psychologist.image }} style={styles.profileImage} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{psychologist.name}</Text>
          <Text style={styles.specialty}>{psychologist.specialty}</Text>
        </View>
      </View>

      {/* Introduction */}
      <Text style={styles.sectionTitle}>Giới thiệu</Text>
      <Text style={styles.introduction}>{psychologist.introduction}</Text>

      {/* Schedule */}
      <Text style={styles.sectionTitle}>Lịch khám</Text>
      <View style={styles.scheduleContainer}>
        {Object.entries(psychologist.schedule).map(([day, times]) => (
          <View key={day} style={styles.scheduleRow}>
            <Text style={styles.day}>{day}</Text>
            <Text style={styles.timeSlots}>{times.join(', ')}</Text>
          </View>
        ))}
      </View>

      {/* Price */}
      <Text style={styles.price}>Giá: {psychologist.price} VNĐ</Text>

      {/* Booking Button */}
      <TouchableOpacity style={styles.bookButton} onPress={()=> router.push('/bookingPage')}>
        <Text style={styles.bookButtonText}>Đặt lịch ngay</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default PsychologistDetails;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,    
    paddingTop: 50, // Adjust for status bar height
  },
  backButton: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flexWrap: 'wrap',
  },
  specialty: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#444',
  },
  introduction: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  scheduleContainer: {
    marginTop: 8,
  },
  scheduleRow: {
    marginBottom: 8,
  },
  day: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
  },
  timeSlots: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 24,
    color: '#000',
  },
  bookButton: {
    marginTop: 20,
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
