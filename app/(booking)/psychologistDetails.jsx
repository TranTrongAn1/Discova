import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
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
        const res = await axios.get(`http://kmdiscova.id.vn/api/psychologists/marketplace/${id}/`,{
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

  if (!psychologist) return <Text style={{ padding: 20 }}>Không tìm thấy thông tin bác sĩ.</Text>;

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
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <Image source={{ uri: user?.profile_picture_url || 'https://via.placeholder.com/100' }} style={styles.profileImage} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{full_name}</Text>
          <Text style={styles.specialty}>{years_of_experience} năm kinh nghiệm</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Giới thiệu</Text>
      <Text style={styles.introduction}>{biography}</Text>

      <Text style={styles.sectionTitle}>Dịch vụ</Text>
      <Text style={styles.introduction}>
        {offers_initial_consultation ? 'Tư vấn trực tiếp, ' : ''}
        {offers_online_sessions ? 'Tư vấn online, ' : ''}
        {services_offered?.join(', ')}
      </Text>

      <Text style={styles.price}>
        Giá tư vấn online: {hourly_rate} VNĐ{"\n"}
        Giá tư vấn trực tiếp: {initial_consultation_rate} VNĐ
      </Text>

<View style={styles.buttonRow}>
  {offers_initial_consultation && (
    <TouchableOpacity
      style={[styles.bookButton, { backgroundColor: '#7B8CE4' }]}
      onPress={() =>
        router.push({
          pathname: '/bookingPage',
          params: { id: user, type: 'offline' },
        })
      }
    >
      <Text style={styles.bookButtonText}>Tư vấn ban đầu</Text>
    </TouchableOpacity>
  )}

  {offers_online_sessions && (
    <TouchableOpacity
      style={[styles.bookButton, { backgroundColor: '#6CB28E' }]}
      onPress={() =>
        router.push({
          pathname: '/bookingPage',
          params: { id: user, type: 'online' },
        })
      }
    >
      <Text style={styles.bookButtonText}>Tư vấn online</Text>
    </TouchableOpacity>
  )}
</View>

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
  buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 10,
  marginTop: 20,
},

bookButton: {
  flex: 1,
  paddingVertical: 14,
  borderRadius: 8,
  alignItems: 'center',
},

bookButtonText: {
  color: '#fff',
  fontSize: 15,
  fontWeight: '600',
},

});

