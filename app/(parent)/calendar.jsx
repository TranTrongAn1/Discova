import { Dimensions, ImageBackground, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import top from '../../assets/images/TopCalendar.png';
import { Feather } from '@expo/vector-icons'; 

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Calendar = () => {
  // Get current date for display
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const daysOfWeek = ['S', 'M', 'T', 'W', 'Th', 'F', 'S'];
  
  // Function to get Vietnamese day name
  const getVietnameseDayName = (dayOfWeek) => {
    const vietDayNames = [
      'Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'
    ];
    return vietDayNames[dayOfWeek];
  };
  
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
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  }
});