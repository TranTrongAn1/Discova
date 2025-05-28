import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const psychologists = [
  {
    name: 'BS CKI. Vũ Thị Hà',
    specialty: 'Điều trị, tư vấn các bệnh lý về mắt như đục thủy tinh thể, glaucoma...',
    schedule: 'Thứ 2,3,4,5,6,7, Chủ nhật, Hẹn khám',
    price: '150.000',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'BS. Nguyễn Văn An',
    specialty: 'Tư vấn và trị liệu rối loạn lo âu, trầm cảm, stress...',
    schedule: 'Thứ 2,4,6, Chủ nhật',
    price: '200.000',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'BS. Trần Thị Lan',
    specialty: 'Chuyên điều trị tâm lý trẻ em, tự kỷ, tăng động giảm chú ý...',
    schedule: 'Thứ 3,5,7',
    price: '180.000',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    name: 'BS. Lê Đức Minh',
    specialty: 'Trị liệu tâm lý hôn nhân, gia đình, tiền hôn nhân...',
    schedule: 'Thứ 2 - 6',
    price: '220.000',
    image: 'https://randomuser.me/api/portraits/men/54.jpg',
  },
  {
    name: 'BS. Nguyễn Thị Hoa',
    specialty: 'Tư vấn tâm lý học đường, hành vi học sinh...',
    schedule: 'Thứ 4,5,6',
    price: '160.000',
    image: 'https://randomuser.me/api/portraits/women/22.jpg',
  },
  {
    name: 'BS. Phạm Văn Khôi',
    specialty: 'Chuyên trị liệu chấn thương tâm lý sau tai nạn, PTSD...',
    schedule: 'Thứ 2 - Chủ nhật',
    price: '250.000',
    image: 'https://randomuser.me/api/portraits/men/73.jpg',
  },
  {
    name: 'BS. Đỗ Thị Hạnh',
    specialty: 'Trị liệu nhóm, điều trị mất ngủ, suy nhược thần kinh...',
    schedule: 'Thứ 2,3,6',
    price: '190.000',
    image: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
  {
    name: 'BS. Hoàng Minh Đức',
    specialty: 'Điều trị rối loạn lưỡng cực, rối loạn nhân cách...',
    schedule: 'Thứ 3,5,7',
    price: '230.000',
    image: 'https://randomuser.me/api/portraits/men/29.jpg',
  },
  // ➕ Add more mock data as needed
];



const PAGE_SIZE = 6;

const PsychologistsList = () => {
  const router = useRouter();
  const [visibleData, setVisibleData] = useState(psychologists.slice(0, PAGE_SIZE));
  const [page, setPage] = useState(1);

  const loadMore = useCallback(() => {
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const nextData = psychologists.slice(start, end);

    if (nextData.length > 0) {
      setVisibleData(prev => [...prev, ...nextData]);
      setPage(prev => prev + 1);
    }
  }, [page]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.specialty}</Text>
        <Text style={styles.schedule}>Lịch khám: {item.schedule}</Text>
        <Text style={styles.fee}>Giá khám: {item.price}đ</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push(`/psychologistDetails?name=${encodeURIComponent(item.name)}`)}>
          <Text style={styles.buttonText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top bar with back button */}
            {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <FlatList
        data={visibleData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          visibleData.length < psychologists.length ? (
            <Text style={styles.loadingText}>Đang tải thêm...</Text>
          ) : null
        }
      />
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
    justifyContent: 'center',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
  },
  schedule: {
    fontSize: 12,
    color: '#444',
  },
  fee: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#00cfff',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  loadingText: {
    textAlign: 'center',
    padding: 12,
    color: '#666',
  },
});
