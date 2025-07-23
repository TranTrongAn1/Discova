import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import api from '../(auth)/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
const PsychologistDetails = () => {
  const { id } = useLocalSearchParams(); // get id from route
  const router = useRouter();
  const [psychologist, setPsychologist] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  console.log('Psychologist ID:', id); // Log the ID to ensure it's correct
    const fetchPsychologist = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          console.warn('No token found');
          return;
        }
        const res = await axios.get(`https://kmdiscova.id.vn/api/psychologists/marketplace/${id}/`,{

          headers: {
              Authorization: `Token ${token}`,
            },});
        setPsychologist(res.data);
      } catch (err) {
        console.error('Failed to fetch psychologist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPsychologist();
  }, [id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  if (!psychologist) return <Text style={{ padding: 20 }}>Psychologist not found.</Text>;

  const {
    full_name,
    user,
    years_of_experience,
    biography,
    hourly_rate,
    initial_consultation_rate,
    offers_initial_consultation,
    offers_online_sessions,
    services_offered
  } = psychologist;

  return (
    <LinearGradient
      colors={["#f3e9ff", "#e9e4fc", "#f8f6ff"]}
      style={styles.gradientBg}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#8e6be8" />
        </TouchableOpacity>
        <View style={styles.card}>
          <View style={styles.profileImageWrapper}>
            <Image source={{ uri: user?.profile_picture_url || 'https://via.placeholder.com/100' }} style={styles.profileImage} />
          </View>
          <Text style={styles.name}>{full_name}</Text>
          <View style={styles.rowInfo}>
            <Ionicons name="briefcase" size={16} color="#8e6be8" style={{ marginRight: 6 }} />
            <Text style={styles.specialty}>{years_of_experience} years experience</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.introduction}>{biography}</Text>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.rowInfo}>
            <Ionicons name="chatbubbles" size={16} color="#8e6be8" style={{ marginRight: 6 }} />
            <Text style={styles.servicesText}>
              {offers_initial_consultation && offers_online_sessions
                ? 'In-person, Online'
                : offers_initial_consultation
                ? 'In-person'
                : offers_online_sessions
                ? 'Online'
                : 'No information'}
            </Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Pricing</Text>
          <Text style={styles.price}>
            Online: {hourly_rate ? `${hourly_rate} VND / hour` : 'N/A'}
            {"\n"}
            In-person: {initial_consultation_rate ? `${initial_consultation_rate} VND / session` : 'N/A'}
          </Text>
          <View style={styles.buttonRow}>
            {offers_initial_consultation && (
              <TouchableOpacity
                style={[styles.bookButton, styles.purpleButton]}
                onPress={() =>
                  router.push({ pathname: '/bookingPage', params: { id: `${id}`, type: 'offline' } })
                }
              >
                <Text style={styles.bookButtonText}>Book In-person</Text>
              </TouchableOpacity>
            )}
            {offers_online_sessions && (
              <TouchableOpacity
                style={[styles.bookButton, styles.greenButton]}
                onPress={() =>
                  router.push({ pathname: '/bookingPage', params: { id: `${id}`, type: 'online' } })
                }
              >
                <Text style={styles.bookButtonText}>Book Online</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default PsychologistDetails;

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  scrollContent: {
    padding: 0,
    minHeight: '100%',
  },
  backButton: {
    marginTop: 40,
    marginLeft: 10,
    marginBottom: 0,
    alignSelf: 'flex-start',
    backgroundColor: '#ede7fa',
    borderRadius: 20,
    padding: 6,
    zIndex: 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginTop: 60,
    marginHorizontal: 12,
    shadowColor: '#8e6be8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    alignItems: 'center',
  },
  profileImageWrapper: {
    borderWidth: 3,
    borderColor: '#b39ddb',
    borderRadius: 60,
    padding: 4,
    backgroundColor: '#f3e9ff',
    marginBottom: 12,
    shadowColor: '#8e6be8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ede7fa',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6c5ce7',
    marginBottom: 2,
    textAlign: 'center',
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    alignSelf: 'center',
  },
  specialty: {
    fontSize: 15,
    color: '#8e6be8',
    fontWeight: '500',
    marginTop: 0,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 6,
    color: '#8e6be8',
    alignSelf: 'flex-start',
  },
  introduction: {
    fontSize: 15,
    color: '#6e6592',
    lineHeight: 22,
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  servicesText: {
    fontSize: 14,
    color: '#7c6bb3',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#ede7fa',
    width: '100%',
    marginVertical: 12,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#6c5ce7',
    alignSelf: 'flex-start',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  bookButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: 2,
    shadowColor: '#8e6be8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  purpleButton: {
    backgroundColor: '#8e6be8',
  },
  greenButton: {
    backgroundColor: '#6CB28E',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

