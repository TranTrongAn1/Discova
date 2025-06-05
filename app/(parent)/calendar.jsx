import { Dimensions, ImageBackground, StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import top from '../../assets/images/TopCalendar.png';
import { Feather } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../(auth)/api';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const sampleUpcomingAppointment = {
  id: 'upcoming1',
  expert: 'ThS. Trần Thị Thu Vân',
  service: 'Tư vấn online',
  time: '5:00PM',
  date: 'Thứ 4, 30/3/2025', // Keep as a future date for upcoming
  user: {
    name: 'Nguyễn Thị Mai',
    phone: '0375377310',
    email: 'mainguyen123@gmail.com'
  }
};

const samplePastAppointments = [
  {
    id: 'past1',
    expert: 'BS. Nguyễn Văn Nam',
    service: 'Khám sức khỏe định kỳ',
    time: '10:00AM',
    date: 'Thứ 2, 10/3/2025', // Past date
    user: {
      name: 'Lê Văn Hùng',
      phone: '0987654321',
      email: 'hung.le@example.com'
    },
    status: 'Đã hoàn thành' // You might want a status for past appointments
  },
  {
    id: 'past2',
    expert: 'ThS. Phạm Thị Lan Anh',
    service: 'Tư vấn tâm lý',
    time: '3:30PM',
    date: 'Thứ 5, 27/02/2025', // Past date
    user: {
      name: 'Trần Ngọc Bích',
      phone: '0912345678',
      email: 'bich.tran@example.com'
    },
    status: 'Đã hủy'
  },
  {
    id: 'past3',
    expert: 'GS. Hoàng Minh Đức',
    service: 'Khám chuyên khoa',
    time: '9:00AM',
    date: 'Thứ 7, 15/02/2025', // Past date
    user: {
      name: 'Nguyễn Thị Mai', // Same user as upcoming for variety
      phone: '0375377310',
      email: 'mainguyen123@gmail.com'
    },
    status: 'Đã hoàn thành'
  }
];
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
const Calendar = () => {
  // Get current date for display
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const daysOfWeek = ['S', 'M', 'T', 'W', 'Th', 'F', 'S'];
  const [pastAppointments, setPastAppointments] = useState([]);
 const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  // Function to get Vietnamese day name
  const getVietnameseDayName = (dayOfWeek) => {
    const vietDayNames = [
      'Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'
    ];
    return vietDayNames[dayOfWeek];
  };
  
   useEffect(() => {
        const fetchUpcomingAppointment = async () => {
          try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
              console.warn('No token found in storage.');
              return;
            }

            const response = await api.get('api/appointments/upcoming/', {
              headers: {
                Authorization: `Token ${token}`
              }
            });

            const upcoming = response.data.next_appointment;
            setUpcomingAppointments(upcoming);
            console.log('Next appointment:', upcoming);

            const historyRes = await api.get('api/appointments/history/', {
            headers: { Authorization: `Token ${token}` }
              });
              setPastAppointments(historyRes.data.history); // assuming the key is 'history'
              console.log('Appointment history:', historyRes.data.history);
          } catch (error) {
            console.error('Failed to fetch upcoming appointment:', error);
          }
        };

        fetchUpcomingAppointment();
      }, []);

  // Calculate the days of the week containing the current date
  useEffect(() => {
    const today = new Date(currentDate);
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate the start of the week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    
    // Generate array of dates for the week
    const weekDaysArray = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDaysArray.push(day);
    }
    
    setWeekDays(weekDaysArray);
  }, [currentDate]);

  return (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.container}>
      <ImageBackground 
        source={top} 
        style={styles.top} 
        resizeMode="cover" 
        imageStyle={styles.image}
      >
        {/* Title */}
        <Text style={styles.title}>Quản lý lịch hẹn</Text>
        
        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <Text style={styles.monthText}>
            Tháng {currentDate.getMonth() + 1}
          </Text>
          <Feather name="chevron-right" size={24} color="white" />
        </View>
        
        {/* Days of Week */}
        <View style={styles.daysRow}>
          {daysOfWeek.map((day, index) => (
            <View 
              key={`day-${index}`} 
              style={styles.dayCol}
            >
              <Text style={styles.dayText}>{day}</Text>
            </View>
          ))}
        </View>
        
        {/* Day Numbers */}
        <View style={styles.daysRow}>
          {weekDays.map((day, index) => {
            const isToday = day.getDate() === currentDate.getDate() && 
              day.getMonth() === currentDate.getMonth() && 
              day.getFullYear() === currentDate.getFullYear();
            return (
        //Replace TouchableOpacity with View to avoid touchable effect
              <View
                key={`num-${index}`} 
                style={[
                  styles.dayCol, 
                  isToday ? styles.selectedDay : null
                ]}
                onPress={() => setCurrentDate(new Date(day))}
              >
                <Text style={[
                  styles.dayNumText,
                  isToday ? styles.selectedDayText : null
                ]}>
                  {day.getDate()}
                </Text>
              </View>
            );
          })}
        </View>
        
        {/* Date Display */}
        <View style={styles.dateDisplay}>
          <Text style={styles.dateText}>
            {getVietnameseDayName(currentDate.getDay())} ngày {currentDate.getDate()} tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
          </Text>
          <Feather name="calendar" size={20} color="white" />
        </View>
      </ImageBackground>
      {/* lịch hẹn của bạn */}
    <View style={styles.appointmentContainer}>
        <Text style={styles.sectionTitle}>Lịch hẹn của bạn</Text>
        {upcomingAppointments ? (
            <View style={styles.appointmentCardWrapper} >
              <View style={styles.card}>
                <Text style={styles.cardText}><Text style={styles.bold}>Chuyên gia:</Text> {upcomingAppointments.psychologist_name}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Ngày & giờ:</Text> {formatDate(upcomingAppointments.scheduled_start_time)} - {new Date(upcomingAppointments.scheduled_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} đến {new Date(upcomingAppointments.scheduled_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Hình thức tư vấn:</Text> {upcomingAppointments.session_type === 'InitialConsultation' ? 'Tư vấn trực tiếp' : upcomingAppointments.session_type}</Text>
                <Text style={styles.cardText}>
                  <Text style={styles.bold}>Thời lượng:</Text> {upcomingAppointments.duration_hours} giờ
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.bold}>Địa chỉ:</Text> {upcomingAppointments.meeting_address}
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.bold}>Trạng thái:</Text> {upcomingAppointments.appointment_status === 'Scheduled' ? 'Đã lên lịch' : upcomingAppointments.appointment_status}
                </Text>
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.detailButton}>
                  <Text style={styles.detailButtonText}>CHI TIẾT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>HUỶ LỊCH</Text>
                </TouchableOpacity>
              </View>
            </View>
        ) : (
          <Text style={styles.noAppointmentText}>Không có lịch hẹn nào sắp tới.</Text>
        )}
      </View>
      {/* lịch sử hẹn */}
      <View style={styles.appointmentContainer}>
        <Text style={styles.sectionTitle}>Lịch sử hẹn</Text>
        {pastAppointments ? (
          pastAppointments.map((appointment) => (
           <View style={styles.appointmentCardWrapper} >
              <View style={styles.card}>
                <Text style={styles.cardText}><Text style={styles.bold}>Chuyên gia:</Text> {appointment.psychologist_name}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Ngày & giờ:</Text> {formatDate(appointment.scheduled_start_time)} - {new Date(appointment.scheduled_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} đến {new Date(appointment.scheduled_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={styles.cardText}><Text style={styles.bold}>Hình thức tư vấn:</Text> {appointment.session_type === 'InitialConsultation' ? 'Tư vấn trực tiếp' : appointment.session_type}</Text>
                <Text style={styles.cardText}>
                  <Text style={styles.bold}>Thời lượng:</Text> {appointment.duration_hours} giờ
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.bold}>Địa chỉ:</Text> {appointment.meeting_address}
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.bold}>Trạng thái:</Text> {appointment.appointment_status === 'Scheduled' ? 'Đã lên lịch' : appointment.appointment_status}
                </Text>
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.detailButton}>
                  <Text style={styles.detailButtonText}>CHI TIẾT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>HUỶ LỊCH</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noAppointmentText}>Không có lịch sử hẹn nào.</Text>
        )}
      </View>
    </View>
  </ScrollView>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
  paddingBottom: 40, // So nothing is cut off at the bottom
},
  top: {
    width: SCREEN_WIDTH,
    height: 375, // Increased height to fit all elements
    padding: 20,
    paddingTop: 40, // Add more padding at the top
    overflow: 'hidden',
    
  },
  image: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginTop: 40,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 20,
    color: '#fff',
    marginRight: 5,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dayCol: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDay: {
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  dayText: {
    color: '#fff',
    fontSize: 16,
  },
  dayNumText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#7b68ee', // Purple color matching the background
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    justifyContent: 'center',
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 70,
  },
  appointmentContainer: {
  padding: 20,
},
sectionTitle: {
  fontSize: 18,
  fontWeight: '600',
  marginBottom: 10,
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
},
bold: {
  fontWeight: 'bold',
},
buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 15,
  marginBottom: 20,
},
detailButton: {
  paddingVertical: 8,
  paddingHorizontal: 50,
  borderWidth: 1,
  borderColor: '#7B68EE',
  borderRadius: 20,
},
detailButtonText: {
  color: '#7B68EE',
  fontWeight: '600',
},
cancelButton: {
  paddingVertical: 8,
  paddingHorizontal: 50,
  backgroundColor: '#7B68EE',
  borderRadius: 20,
},
cancelButtonText: {
  color: '#fff',
  fontWeight: '600',
}

});