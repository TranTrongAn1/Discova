import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/70x70.png?text=Avatar';

const PsychologistsList = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [nextUrl, setNextUrl] = useState('https://kmdiscova.id.vn/api/psychologists/marketplace/');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!nextUrl || loading) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          console.warn('No token found');
          return;
        }
      const res = await axios.get(nextUrl, {
                    headers: {
              Authorization: `Token ${token}`,
            },
      });
      if (res.data?.results?.length) {
        setData(prev => [...prev, ...res.data.results]);
        setNextUrl(res.data.next);
        console.log('Psychologist ID:', data.user);
      } else if (data.length === 0) {
        setError('Không có nhà tâm lý nào để hiển thị.');
      }
    } catch (err) {
      setError('Lỗi khi tải dữ liệu.');
      console.error('Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [nextUrl, loading]);

  useEffect(() => {
    fetchData();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.cardShadowWrapper}>
      <View style={styles.card}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: item.profile_picture_url || PLACEHOLDER_IMAGE }} style={styles.image} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.name}>{item.full_name}</Text>
          <View style={styles.rowInfo}>
            <Ionicons name="briefcase" size={14} color="#8e6be8" style={{ marginRight: 4 }} />
            <Text style={styles.experience}>Experience: {item.years_of_experience} years</Text>
          </View>
          <Text style={styles.biography}>{item.biography}</Text>
          <Text style={styles.pricing}>
            {item.pricing
              ? `Price: Initial - ${item.pricing.initial_consultation_rate} ${item.pricing.currency}, Online - ${item.pricing.online_session_rate} ${item.pricing.currency}`
              : 'No pricing information'}
          </Text>
          <View style={styles.rowInfo}>
            <Ionicons name="chatbubbles" size={14} color="#8e6be8" style={{ marginRight: 4 }} />
            <Text style={styles.consultation}>
              Mode: {item.offers_online_sessions && item.offers_initial_consultation
                ? 'In-person, Online'
                : item.offers_online_sessions
                ? 'Online'
                : item.offers_initial_consultation
                ? 'In-person'
                : 'No information'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push(`/psychologistDetails?id=${item.user}`)}
          >
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

return (
  <LinearGradient
    colors={["#f3e9ff", "#e9e4fc", "#f8f6ff"]}
    style={styles.gradientBg}
  >
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#8e6be8" />
      </TouchableOpacity>
      {data.length === 0 && !loading ? (
        <Text style={styles.emptyText}>
          {error || 'No psychologists to display.'}
        </Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          onEndReached={fetchData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading && <ActivityIndicator size="small" color="#8e6be8" />}
        />
      )}
    </View>
  </LinearGradient>
);

};

export default PsychologistsList;

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#ede7fa',
    borderRadius: 20,
    padding: 6,
  },
  cardShadowWrapper: {
    shadowColor: '#8e6be8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderRadius: 16,
    marginVertical: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ede7fa',
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: '#b39ddb',
    borderRadius: 50,
    padding: 2,
    marginRight: 16,
    backgroundColor: '#f3e9ff',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ede7fa',
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#6c5ce7',
    marginBottom: 2,
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  experience: {
    fontSize: 13,
    color: '#8e6be8',
    fontWeight: '500',
  },
  biography: {
    fontSize: 13,
    color: '#6e6592',
    marginVertical: 2,
  },
  pricing: {
    fontSize: 13,
    color: '#7c6bb3',
    marginVertical: 2,
  },
  consultation: {
    fontSize: 12,
    color: '#8e6be8',
    marginBottom: 5,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#8e6be8',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
    marginTop: 8,
    shadowColor: '#8e6be8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#8e6be8',
    fontSize: 16,
    fontWeight: '500',
  },
});
