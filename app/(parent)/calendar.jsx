import { Dimensions, ImageBackground, StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import top from '../../assets/images/TopCalendar.png';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../(auth)/api';
import CancelModal from '../../app/cancelModal';
import Toast from 'react-native-toast-message';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
import DetailsModal from '../detailsModal'; // adjust path as needed

const formatDateTimeRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Manually shift 7 hours for Vietnam time
  startDate.setHours(startDate.getHours() - 7);
  endDate.setHours(endDate.getHours() - 7);

  const daysOfWeek = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dayOfWeek = daysOfWeek[startDate.getDay()];
  const formattedDate = `${dayOfWeek}, ${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()}`;

  const formattedStartTime = startDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedEndTime = endDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${formattedDate} từ ${formattedStartTime} đến ${formattedEndTime}`;
};

const Calendar = () => {
  // Get current date for display
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const daysOfWeek = ['S', 'M', 'T', 'W', 'Th', 'F', 'S'];
  const [pastAppointments, setPastAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPastStatus, setSelectedPastStatus] = useState('All');
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const pastItemsPerPage = 6;
const [pastCurrentPage, setPastCurrentPage] = useState(1);

  // Function to get Vietnamese day name
  const getVietnameseDayName = (dayOfWeek) => {
    const vietDayNames = [
      'Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'
    ];
    return vietDayNames[dayOfWeek];
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          console.warn('No token found in storage.');
          return;
        }

        const response = await api.get('api/appointments/', {
          headers: {
            Authorization: `Token ${token}`
          }
        });

        const allAppointments = response.data.results; // Access the results array
        console.log('All appointments:', allAppointments);

        // Filter appointments based on is_upcoming field
        const upcoming = allAppointments.filter(appointment => appointment.is_upcoming === true);
        const past = allAppointments.filter(appointment => appointment.is_upcoming === false);

        setUpcomingAppointments(upcoming);
        setPastAppointments(past);

        console.log('Upcoming appointments:', upcoming);
        console.log('Past appointments:', past);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
    };

    fetchAppointments();
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

  const handleCancelPress = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setCancelModalVisible(true);
  };

  const handleCancelSubmit = async (cancellation_reason) => {
    try {
      console.log('id của mày nè: ', selectedAppointmentId)
      const token = await AsyncStorage.getItem('access_token');
      await api.post(`/api/appointments/${selectedAppointmentId}/cancel/`, { cancellation_reason }, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      // Optionally reload data
      setCancelModalVisible(false);
      setToast(true);
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      setToast(false);
    }
  };
  useEffect(() => {
    if (toast !== null) {
      Toast.show({
        type: toast ? 'success' : 'error',
        text1: toast ? 'Hủy thành công' : 'Hủy thất bại',
      });
      // Reset toast state after showing
      setToast(null);
    }
  }, [toast]);

  const getStatusColor = (status) => {
    const statusColors = {
      'Payment_Pending': '#FF9500', // Orange
      'Scheduled': '#34C759',       // Green
      'In_Progress': '#007AFF',     // Blue
      'Completed': '#8E8E93',       // Gray
      'Cancelled': '#FF3B30',       // Red
      'No_Show': '#FF6B35',         // Orange-Red
      'Payment_Failed': '#D70015'   // Dark Red
    };
    return statusColors[status] || '#000000'; // Default black
  };

  // Status display text mapping
  const getStatusDisplayText = (status) => {
    const statusTexts = {
      'Payment_Pending': 'Chờ thanh toán',
      'Scheduled': 'Đã lên lịch',
      'In_Progress': 'Đang tiến hành',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy',
      'No_Show': 'Không có mặt',
      'Payment_Failed': 'Thanh toán thất bại'
    };
    return statusTexts[status] || status;
  };

  // Check if cancel button should be disabled
  const isCancelDisabled = (status) => {
    const disabledStatuses = ['Completed', 'Cancelled', 'No_Show', 'In_Progress'];
    return disabledStatuses.includes(status);
  };
  const filteredAppointments = selectedStatus === 'All'
    ? upcomingAppointments
    : upcomingAppointments.filter(a => a.appointment_status === selectedStatus);
  const filteredPastAppointments = selectedPastStatus === 'All'
    ? pastAppointments
    : pastAppointments.filter(a => a.appointment_status === selectedPastStatus);

const totalPastPages = Math.ceil(filteredPastAppointments.length / pastItemsPerPage);

const paginatedPastAppointments = filteredPastAppointments.slice(
  (pastCurrentPage - 1) * pastItemsPerPage,
  pastCurrentPage * pastItemsPerPage
);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>

      <View style={styles.container}>
        <ImageBackground
          source={top}
          style={styles.top}
          resizeMode="cover"
          imageStyle={styles.image}
        >
          <Toast position="top" visibilityTime={4000} topOffset={50} style={styles.toastContainer} />
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
                <TouchableOpacity
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
                </TouchableOpacity>
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {['All', 'Payment_Pending', 'Scheduled', 'In_Progress', 'Completed', 'Cancelled', 'No_Show', 'Payment_Failed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  selectedStatus === status && styles.activeFilterButton
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedStatus === status && styles.activeFilterButtonText
                ]}>
                  {status === 'All' ? 'Tất cả' : getStatusDisplayText(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>


          {filteredAppointments && filteredAppointments.length > 0 ? (
            paginatedAppointments.map((appointment, index) => (
              <View key={appointment.appointment_id || index} style={styles.appointmentCardWrapper}>
                <View style={styles.card}>
                  <Text style={styles.cardText}>
                    <Text style={styles.bold}>Chuyên gia:</Text> {appointment.psychologist_name}
                  </Text>
                  <Text style={styles.cardText}>
                    <Text style={styles.bold}>Ngày & giờ:</Text> {formatDateTimeRange(appointment.scheduled_start_time, appointment.scheduled_end_time)}
                  </Text>
                  <Text style={styles.cardText}>
                    <Text style={styles.bold}>Hình thức tư vấn:</Text> {appointment.session_type === 'InitialConsultation' ? 'Tư vấn trực tiếp' : appointment.session_type}
                  </Text>
                  <Text style={styles.cardText}>
                    <Text style={styles.bold}>Thời lượng:</Text> {appointment.duration_hours} giờ
                  </Text>
                  <Text style={styles.cardText}>
                    <Text style={styles.bold}>Trạng thái: </Text>
                    <Text style={[styles.statusText, { color: getStatusColor(appointment.appointment_status) }]}>
                      {getStatusDisplayText(appointment.appointment_status)}
                    </Text>
                  </Text>
                  <Text style={styles.cardText}>
                    {appointment.session_type == 'InitialConsultation' ? (
                      <>
                        <Text style={styles.bold}>Địa chỉ:</Text> {appointment.meeting_address}
                      </>
                    ) : (
                      <>
                        <TouchableOpacity
                          onPress={() => {
                            if (appointment.meeting_link) {
                              Linking.openURL(appointment.detail.meeting_link).catch(() =>
                                Alert.alert('Invalid Link', 'Unable to open the Zoom link.')
                              );
                            }
                          }}
                        >
                          <Text style={[styles.bold]}>
                            Zoom Link ở trong chi tiết
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </Text>
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => {
                      setSelectedAppointment(appointment);
                      setDetailsModalVisible(true);
                    }}
                  >
                    <Text style={styles.detailButtonText}>CHI TIẾT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      isCancelDisabled(appointment.appointment_status) && styles.disabledButton
                    ]}
                    onPress={() => {
                      if (!isCancelDisabled(appointment.appointment_status)) {
                        handleCancelPress(appointment.appointment_id);
                      }
                    }}
                    disabled={isCancelDisabled(appointment.appointment_status)}
                  >
                    <Text style={[
                      styles.cancelButtonText,
                      isCancelDisabled(appointment.appointment_status) && styles.disabledButtonText
                    ]}>
                      HUỶ LỊCH
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noAppointmentText}>Không có lịch hẹn nào.</Text>
          )}
        </View>
        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
              onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <Text style={styles.pageButtonText}>Trước</Text>
            </TouchableOpacity>

            <Text style={styles.pageIndicator}>
              {currentPage} / {totalPages}
            </Text>

            <TouchableOpacity
              style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
              onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <Text style={styles.pageButtonText}>Tiếp</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* lịch sử hẹn */}
        <View style={styles.appointmentContainer}>
          <Text style={styles.sectionTitle}>Lịch sử hẹn</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {['All', 'Payment_Pending', 'Scheduled', 'In_Progress', 'Completed', 'Cancelled', 'No_Show', 'Payment_Failed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  selectedPastStatus === status && styles.activeFilterButton
                ]}
                onPress={() => setSelectedPastStatus(status)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedPastStatus === status && styles.activeFilterButtonText
                ]}>
                  {status === 'All' ? 'Tất cả' : getStatusDisplayText(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredPastAppointments && filteredPastAppointments.length > 0 ? (
            paginatedPastAppointments.map((appointment, index) => (
              <View key={appointment.id || index} style={styles.appointmentCardWrapper}>
                <View style={styles.card}>
                  <Text style={styles.cardText}><Text style={styles.bold}>Chuyên gia:</Text> {appointment.psychologist_name}</Text>
                  <Text style={styles.cardText}><Text style={styles.bold}>Ngày & giờ:</Text> {formatDateTimeRange(appointment.scheduled_start_time, appointment.scheduled_end_time)}</Text>
                  <Text style={styles.cardText}><Text style={styles.bold}>Hình thức tư vấn:</Text> {appointment.session_type === 'InitialConsultation' ? 'Tư vấn trực tiếp' : appointment.session_type}</Text>
                  <Text style={styles.cardText}><Text style={styles.bold}>Thời lượng:</Text> {appointment.duration_hours} giờ</Text>
                  <Text style={styles.cardText}>
                    {appointment.session_type == 'InitialConsultation' ? (
                      <>
                        <Text style={styles.bold}>Địa chỉ:</Text> {appointment.meeting_address}
                      </>
                    ) : (
                      <>
                        <Text style={styles.bold}>Zoom Link:</Text> is on the details
                      </>
                    )}
                  </Text>
                  <Text style={styles.cardText}>
                    <Text style={styles.bold}>Trạng thái:</Text> {getStatusDisplayText(appointment.appointment_status)}
                  </Text>
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => {
                      setSelectedAppointment(appointment);
                      setDetailsModalVisible(true);
                    }}
                  >
                    <Text style={styles.detailButtonText}>CHI TIẾT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.reviewButton}>
                    <Text style={styles.reviewButtonText}>ĐÁNH GIÁ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noAppointmentText}>Không có lịch sử hẹn nào.</Text>
          )}

        </View>
{totalPastPages > 1 && (
  <View style={styles.paginationContainer}>
    <TouchableOpacity
      style={[styles.pageButton, pastCurrentPage === 1 && styles.disabledButton]}
      onPress={() => setPastCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={pastCurrentPage === 1}
    >
      <Text style={styles.pageButtonText}>Trước</Text>
    </TouchableOpacity>

    <Text style={styles.pageIndicator}>
      {pastCurrentPage} / {totalPastPages}
    </Text>

    <TouchableOpacity
      style={[styles.pageButton, pastCurrentPage === totalPastPages && styles.disabledButton]}
      onPress={() => setPastCurrentPage((prev) => Math.min(prev + 1, totalPastPages))}
      disabled={pastCurrentPage === totalPastPages}
    >
      <Text style={styles.pageButtonText}>Tiếp</Text>
    </TouchableOpacity>
  </View>
)}

      </View>
      <CancelModal
        visible={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        onSubmit={handleCancelSubmit} />
      <DetailsModal
        visible={detailsModalVisible}
        appointment={selectedAppointment}
        onClose={() => setDetailsModalVisible(false)}
      />

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
  appointmentCardWrapper: {
    marginBottom: 15,
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
  },
  reviewButton: {
    paddingVertical: 8,
    paddingHorizontal: 50,
    backgroundColor: '#28a745',
    borderRadius: 20,
  },
  reviewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  noAppointmentText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  toastContainer: {
    zIndex: 9999,
    elevation: 9999, // For Android
  },
  statusText: {
    fontWeight: 'bold',
    marginLeft: 5,
  },
  disabledButton: {
    backgroundColor: '#E5E5EA',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#8E8E93',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    justifyContent: 'center',
  },
  filterButton: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
    borderRadius: 12,
  },
  activeFilterButton: {
    backgroundColor: '#8E97FD',
  },
  filterButtonText: {
    color: 'black',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  pageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  pageButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

});