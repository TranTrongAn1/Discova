import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
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
  const [nextUrl, setNextUrl] = useState('http://kmdiscova.id.vn/api/psychologists/marketplace/');
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
    <View style={styles.card}>
      <Image source={{ uri: PLACEHOLDER_IMAGE }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.full_name}</Text>
        <Text style={styles.experience}>Kinh nghiệm: {item.years_of_experience} năm</Text>
        <Text style={styles.biography}>{item.biography}</Text>
          <Text style={styles.pricing}>
            {item.pricing
              ? `Giá: Tư vấn ban đầu - ${item.pricing.initial_consultation_rate} ${item.pricing.currency}, Online - ${item.pricing.online_session_rate} ${item.pricing.currency}`
              : 'Chưa có thông tin giá'}
          </Text>


        <Text style={styles.consultation}>
          Hình thức:{' '}
          {item.offers_online_sessions && item.offers_initial_consultation
            ? 'Trực tiếp, Online'
            : item.offers_online_sessions
            ? 'Online'
            : item.offers_initial_consultation
            ? 'Trực tiếp'
            : 'Không có thông tin'}
        </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                router.push(`/psychologistDetails?id=${item.user}`)
              }
            >
              <Text style={styles.buttonText}>Xem chi tiết</Text>
            </TouchableOpacity>


      </View>
    </View>
  );

return (
  <View style={styles.container}>
    {/* Always show back button at the top */}
    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
      <Ionicons name="arrow-back" size={24} color="#333" />
    </TouchableOpacity>

    {/* Main content: FlatList or empty message */}
    {data.length === 0 && !loading ? (
      <Text style={styles.emptyText}>
        {error || 'Hiện chưa có nhà tâm lý nào để hiển thị.'}
      </Text>
    ) : (
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        onEndReached={fetchData}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && <ActivityIndicator size="small" color="#00cfff" />}
      />
    )}
  </View>
);

};

export default PsychologistsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  backButton: {
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    marginVertical: 8,
    padding: 10,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  experience: {
    fontSize: 13,
    color: '#555',
  },
  biography: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
  },
  pricing: {
    fontSize: 13,
    color: '#444',
    marginVertical: 2,
  },
  consultation: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#00cfff',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontSize: 15,
  },
});
