import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Logo from '../../assets/images/Logo.png';
import psychologists from '../(Pychologist)/pyschcologists';
import { router } from 'expo-router';
import axios from 'axios';
import api from '../(auth)/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
const problemsData = [
  'Rối loạn lo âu',
  'Hướng nghiệp cho con',
  'Stress công việc',
  'Mất ngủ',
  'Trầm cảm',
  'Cải thiện mối quan hệ'
];
const user = {
  name: 'Ronaldo',
}
const allAppointments = [
  {
    expert: 'ThS. Trần Thị Thu Vân',
    service: 'Tư vấn online',
    time: '17:00',
    date: '2025-05-26',
    status: 'upcoming',
    user: {
      name: 'Nguyễn Thị Mai',
      phone: '0375377310',
      email: 'mainguyen123@gmail.com'
    }
  },
  {
    expert: 'ThS. Nguyễn Văn B',
    service: 'Thăm khám trực tiếp',
    time: '09:00',
    date: '2025-05-27',
    status: 'upcoming',
    user: {
      name: 'Trần Văn A',
      phone: '0987654321',
      email: 'tranvana@example.com'
    }
  }
];

const topPsychologists = psychologists
  .sort((a, b) => {
    const scoreA = a.rating * a.numberOfReviews;
    const scoreB = b.rating * b.numberOfReviews;
    return scoreB - scoreA;
  })
  .slice(0, 3); // Get top 3

// Function to format date
const formatDate = (dateString) => {



  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  // Get day of week in Vietnamese
  const daysOfWeek = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dayOfWeek = daysOfWeek[date.getDay()];
  
  return `${dayOfWeek}, ${day}/${month}/${year}`;
};

const upcomingAppointments = allAppointments
  .filter(app => app.status === 'upcoming')
  .sort((a, b) => new Date(a.date) - new Date(b.date));

const Home = () => {
  const [userName, setUserName] = useState(null); // default is null
  const [loading, setLoading] = useState(true);
      useEffect(() => {
          const fetchUserName = async () => {
          try {
            const token = await AsyncStorage.getItem('access_token'); // Get token from storage
            console.log('token:',token);
                if (!token) {
                  console.warn('No token found in storage.');
                  return;
                }

          const response = await api.get('/api/parents/profile/profile/', {
            headers: {
              Authorization: `Token ${token}`
            }
          });

          const fullName = response.data.full_name;
          setUserName(fullName);
          console.log('User profile fetched successfully:', response.data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserName();
    }, []);
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={Logo} style={styles.logo} resizeMode='contain' />
        </View>
        
            <Text style={styles.text}>
              Chào buổi sáng{userName ? `, ${userName}` : ''}
            </Text>

        
        <View style={styles.searchWrap}>
          <Text style={styles.searchTitle}>
            Hãy tìm chuyên gia phù hợp với con bạn
          </Text>
          <Text style={styles.searchSubtitle}>
            Bạn đang cần chuyên gia hỗ trợ về vấn đề gì ?
          </Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Nhập vấn đề..."
              placeholderTextColor="#71727A"
              style={styles.searchInput}
            />
            <TouchableOpacity style={styles.searchButton}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.problemsLabel}>
            CÁC VẤN ĐỀ PHỔ BIẾN:
          </Text>
          
          <View style={styles.problemsGridContainer}>
            {problemsData.map((problem, index) => (
              <TouchableOpacity
                key={index}
                style={styles.button}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>{problem}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <Text style={styles.text}>Lịch hẹn sắp tới của bạn</Text>
        
        {upcomingAppointments.length > 0 && (
          <View style={styles.appointmentContainer}>
            <View style={styles.card}>
              <Text style={styles.cardText}>
                <Text style={styles.bold}>Chuyên gia:</Text> {upcomingAppointments[0].expert}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.bold}>Dịch vụ:</Text> {upcomingAppointments[0].service}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.bold}>Thời gian:</Text> {upcomingAppointments[0].time} {formatDate(upcomingAppointments[0].date)}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.bold}>Thông tin người hẹn:</Text>
              </Text>
              <Text style={styles.cardText}>{upcomingAppointments[0].user.name}</Text>
              <Text style={styles.cardText}>{upcomingAppointments[0].user.phone}</Text>
              <Text style={styles.cardText}>{upcomingAppointments[0].user.email}</Text>
            </View>
          </View>
        )}
      </View>
        <Text style={styles.text}>Các chuyên gia nổi bật</Text>

        <View style={styles.topPsychContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {topPsychologists.map((psych, index) => (
              <View key={index} style={styles.psychCard}>
                <Image source={{ uri: psych.img }} style={styles.psychImage} />
                <Text style={styles.psychName}>{psych.name}</Text>
                <Text numberOfLines={2} style={styles.psychDescription}>{psych.des}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text>⭐ {psych.rating} ({psych.numberOfReviews})</Text>
                </View>
                <TouchableOpacity style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Đặt hẹn nhanh</Text>
                </TouchableOpacity>
              </View>
              
            ))}

          </ScrollView>
        </View>
        <TouchableOpacity onPress={() => router.push('/(booking)/psychologistsList')}>
        <Text style={styles.more}>Xem thêm chuyên gia khác </Text>
        </TouchableOpacity>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  scrollContainer: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logo: {
    marginLeft: 20,
    width: 100,
    height: 100,
  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#7B68EE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  searchWrap: {
    backgroundColor: '#8E97FD',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
  },
  searchTitle: {
    color: '#EBEAEC',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchSubtitle: {
    color: '#EBEAEC',
    marginVertical: 10,
    fontSize: 14,
  },
  problemsLabel: {
    color: '#EBEAEC',
    fontSize: 11,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#7B8CE4',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginVertical: 6,
    marginHorizontal: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  problemsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  appointmentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardText: {
    fontSize: 14,
    marginVertical: 2,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  //pyschologist styles
topPsychContainer: {
  marginTop: 20,
  paddingHorizontal: 20,
  paddingBottom: 20,
},

psychCard: {
  backgroundColor: '#fff',
  padding: 12,
  borderRadius: 12,
  marginRight: 12,
  width: 180,
  height: 250,
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  alignItems: 'center',
  justifyContent: 'center',
},

psychImage: {
  width: 100,
  height: 100,
  borderRadius: 100,
  marginBottom: 8,
  alignSelf: 'center',
  borderWidth: 1,
},

psychName: {
  fontWeight: 'bold',
  fontSize: 13,
  textAlign: 'center',
  marginBottom: 4,
  alignSelf: 'center',
  color: '#333',
},

psychDescription: {
  fontSize: 12,
  color: '#555',
  textAlign: 'center',
  marginBottom: 8,
  alignSelf: 'center',    
},
bookButton: {
  paddingVertical: 8,
  paddingHorizontal: 12, // Reduced from 60 to 12
  backgroundColor: '#7B68EE',
  borderRadius: 20,
  marginTop: 10,
  alignSelf: 'stretch', // Make button stretch to full width of card
  minWidth: '100%', // Ensure full width
},
bookButtonText: {
  color: '#fff',
  fontSize: 12,
  textAlign: 'center', 
  fontWeight: 'bold',    
},
more: {
  color: '#7B68EE',
  fontSize: 14,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 20,
},

});