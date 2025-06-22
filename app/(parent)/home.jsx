
import Logo from '../../assets/images/Logo.png';
import psychologists from '../(Pychologist)/pyschcologists';

import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../(auth)/api';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExternalLink, Brain, Heart, Users, Baby, Lightbulb } from 'lucide-react-native';



const problemsData = [
  'Rối loạn lo âu',
  'Hướng nghiệp cho con',
  'Stress công việc',
  'Mất ngủ',
  'Trầm cảm',
  'Cải thiện mối quan hệ'
];

const psychologyResources = [
  {
    id: 1,
    title: "Child Psychology Assessment",
    description: "Comprehensive psychological evaluation tools and developmental milestone assessments for children aged 3-17. Identify learning difficulties, behavioral patterns, and emotional development.",
    iconName: "Baby",
    link: "https://www.childmind.org/",
    linkText: "Take Child Assessment",
    backgroundColor: "#EBF4FF"
  },
  {
    id: 2,
    title: "Mental Health Screening",
    description: "Professional-grade screening tools for anxiety, depression, and stress disorders. Get insights into your mental wellbeing with evidence-based questionnaires.",
    iconName: "Brain",
    link: "https://www.psychology.com/",
    linkText: "Start Mental Health Quiz",
    backgroundColor: "#F3E8FF"
  },
  {
    id: 3,
    title: "Relationship Compatibility",
    description: "Discover your attachment style and relationship patterns. Learn about communication styles, conflict resolution, and building stronger connections.",
    iconName: "Heart",
    link: "https://www.gottman.com/",
    linkText: "Assess Your Relationship",
    backgroundColor: "#FEF2F2"
  },
  {
    id: 4,
    title: "Personality Insights",
    description: "Explore your personality traits, cognitive preferences, and behavioral tendencies. Understand your strengths and areas for personal growth.",
    iconName: "Users",
    link: "https://www.16personalities.com/",
    linkText: "Discover Your Type",
    backgroundColor: "#F0FDF4"
  },
  {
    id: 5,
    title: "Cognitive Function Test",
    description: "Evaluate memory, attention, processing speed, and executive function. Ideal for tracking cognitive health and identifying potential concerns.",
    iconName: "Lightbulb",
    link: "https://www.cambridgebrainsciences.com/",
    linkText: "Test Cognitive Ability",
    backgroundColor: "#FFFBEB"
  }
];

// Alternative approach with better error handling
const handleLinkPress = async (url) => {
  try {
    // For web URLs, we can skip the canOpenURL check
    if (url.startsWith('http://') || url.startsWith('https://')) {
      await Linking.openURL(url);
    } else {
      // For other URL schemes, check if supported first
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Cannot Open Link',
          'This type of link is not supported on your device.',
          [{ text: 'OK' }]
        );
      }
    }
  } catch (error) {
    console.error('Failed to open URL:', error);
    Alert.alert(
      'Cannot Open Link',
      'Unable to open the link. Please try again later.',
      [{ text: 'OK' }]
    );
  }
};

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

// Helper function to render icons
const renderIcon = (iconName) => {
  const iconProps = { size: 32, color: "#4F46E5" };
  
  switch (iconName) {
    case "Baby":
      return <Baby {...iconProps} />;
    case "Brain":
      return <Brain {...iconProps} />;
    case "Heart":
      return <Heart {...iconProps} />;
    case "Users":
      return <Users {...iconProps} />;
    case "Lightbulb":
      return <Lightbulb {...iconProps} />;
    default:
      return <Brain {...iconProps} />;
  }
};

const Home = () => {
  const [userName, setUserName] = useState(null); // default is null
  const [loading, setLoading] = useState(true);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [topPsychologists, setTopPsychologists] = useState([]);

  // Fetch top psychologists from API
  useEffect(() => {
    const fetchTopPsychologists = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) return;

        const response = await api.get('/api/psychologists/marketplace/');
        
        if (response.data && response.data.results) {
          // Sort by profile completeness and experience, then take top 3
          const sorted = response.data.results
            .sort((a, b) => {
              // Sort by years of experience (descending)
              const expA = a.years_of_experience || 0;
              const expB = b.years_of_experience || 0;
              return expB - expA;
            })
            .slice(0, 3)
            .map(psychologist => ({
              id: psychologist.user,
              name: psychologist.full_name,
              img: psychologist.profile_picture_url,
              des: psychologist.biography || 'No biography available',
              rating: 0, // Rating not available in marketplace API
              numberOfReviews: 0, // Reviews not available in marketplace API
              yearsOfExperience: psychologist.years_of_experience,
              offersOnline: psychologist.offers_online_sessions,
              offersConsultation: psychologist.offers_initial_consultation,
              hourlyRate: psychologist.hourly_rate,
              consultationRate: psychologist.initial_consultation_rate
            }));
          
          setTopPsychologists(sorted);
        }
      } catch (error) {
        console.error('Error fetching top psychologists:', error);
      }
    };

    fetchTopPsychologists();
  }, []);

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
        setNextAppointment(upcoming);
        console.log('Next appointment:', upcoming);
      } catch (error) {
        console.error('Failed to fetch upcoming appointment:', error);
      }
    };

    fetchUpcomingAppointment();
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token'); // Get token from storage
        console.log('token:', token);
        if (!token) {
          console.warn('No token found in storage.');
          return;
        }

        const response = await api.get('api/parents/profile/profile/', {
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

        <Text style={styles.text}>Lịch hẹn sắp tới</Text>
        {nextAppointment ? (
          <View style={styles.appointmentContainer}>
            <View style={styles.card}>
              <Text style={styles.cardText}>
                <Text style={styles.bold}>Ngày & giờ:</Text> {formatDate(nextAppointment.scheduled_start_time)} - {new Date(nextAppointment.scheduled_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} đến {new Date(nextAppointment.scheduled_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.bold}>Người được tư vấn:</Text> {nextAppointment.child_name}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.bold}>Chuyên gia:</Text> {nextAppointment.psychologist_name}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.bold}>Hình thức tư vấn:</Text> {nextAppointment.session_type === 'InitialConsultation' ? 'Tư vấn trực tiếp' : nextAppointment.session_type}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.bold}>Thời lượng:</Text> {nextAppointment.duration_hours} giờ
              </Text>
              <Text style={styles.cardText}>
                {nextAppointment.session_type == 'InitialConsultation' ? (
                  <>
                    <Text style={styles.bold}>Địa chỉ:</Text> {nextAppointment.meeting_address}
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        if (nextAppointment.meeting_link) {
                          Linking.openURL(nextAppointment.meeting_link).catch(() =>
                            Alert.alert('Invalid Link', 'Unable to open the Zoom link.')
                          );
                        }
                      }}
                    >
                      <Text style={[styles.bold, { color: 'blue', textDecorationLine: 'underline' }]}>
                        Zoom Link 
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.bold}>Trạng thái:</Text> {nextAppointment.appointment_status === 'Scheduled' ? 'Đã lên lịch' : nextAppointment.appointment_status}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.cardText, { marginLeft: 20 }]}>Không có lịch hẹn sắp tới.</Text>
        )}

        {/* Psychology Resources Section - Fixed to React Native */}
        <View style={styles.resourcesContainer}>
          <Text style={styles.resourcesTitle}>
            Psychology Resources & Assessments
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.resourcesScrollView}
            contentContainerStyle={styles.resourcesScrollContent}
          >
            {psychologyResources.map((resource) => (
              <View
                key={resource.id}
                style={[styles.resourceCard, { backgroundColor: resource.backgroundColor }]}
              >
                {/* Header with Icon */}
                <View style={styles.resourceCardHeader}>
                  <View style={styles.resourceIconContainer}>
                    {renderIcon(resource.iconName)}
                  </View>
                  <Text style={styles.resourceCardTitle} numberOfLines={2}>
                    {resource.title}
                  </Text>
                </View>
                
                {/* Description */}
                <Text style={styles.resourceDescription} numberOfLines={4}>
                  {resource.description}
                </Text>
                
                {/* Link Button */}
                <TouchableOpacity
                  style={styles.resourceLinkButton}
                  onPress={() => handleLinkPress(resource.link)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resourceLinkButtonText}>{resource.linkText}</Text>
                  <ExternalLink size={16} color="#374151" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          
          {/* Scroll Indicator */}
          <View style={styles.resourcesScrollIndicator}>
            <Text style={styles.resourcesScrollText}>Swipe to explore more resources →</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => router.push('/(booking)/psychologistsList')}>
          <Text style={styles.more}>Tìm kiếm các chuyên gia khác phù hợp </Text>
        </TouchableOpacity>
      </View>
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
    ...Platform.select({

      ios: {

        shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2

      },

      android: {

        elevation: 2,

      },

      web: {

        boxShadow: '0 1 2px rgba(0,0,0,0000000.1)',

      },

    }),
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
    ...Platform.select({

      ios: {

        shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5

      },

      android: {

        elevation: 5,

      },

      web: {

        boxShadow: '0 2 5px rgba(0,0,0,0000.1)',

      },

    }),
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
  // Psychology Resources Styles
  resourcesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  resourcesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  resourcesScrollView: {
    flexGrow: 0,
  },
  resourcesScrollContent: {
    paddingRight: 16,
  },
  resourceCard: {
    width: 300,
    height: 280,
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  resourceCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  resourceIconContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    lineHeight: 24,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 20,
    flex: 1,
  },
  resourceLinkButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resourceLinkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  resourcesScrollIndicator: {
    alignItems: 'center',
    marginTop: 16,
  },
  resourcesScrollText: {
    fontSize: 12,
    color: '#6B7280',
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
    ...Platform.select({

      ios: {

        shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4

      },

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 2 4px rgba(0,0,0,0000.1)',

      },

    }),
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
    paddingHorizontal: 12,
    backgroundColor: '#7B68EE',
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'stretch',
    minWidth: '100%',
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