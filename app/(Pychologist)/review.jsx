import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Animated, FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [spin, setSpin] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    
    // Reviews API endpoint not implemented yet
    console.log('Reviews feature coming soon - no API call made');
    
    // Set empty reviews array
    setReviews([]);
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const renderStars = (rating) => {
    const stars = [];
    const numRating = parseFloat(rating);
    
    for (let i = 1; i <= 5; i++) {
      if (numRating >= i) {
        stars.push(<Ionicons key={i} name="star" size={16} color="#f5b50a" />);
      } else if (numRating >= i - 0.5) {
        stars.push(<Ionicons key={i} name="star-half" size={16} color="#f5b50a" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={16} color="#f5b50a" />);
      }
    }
    return stars;
  };

  const renderReviewCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        {item.parent_profile_picture ? (
          <Image source={{ uri: item.parent_profile_picture }} style={styles.avatar} />
        ) : (
          <View style={styles.defaultAvatar}>
            <Ionicons name="person" size={24} color="#666" />
          </View>
        )}
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>
          {item.parent_name || 'Phụ huynh'}
        </Text>
        
        <Text style={styles.description}>
          {item.comment || 'Không có nhận xét'}
        </Text>
        
        <View style={styles.ratingRow}>
          {renderStars(item.rating)}
          <Text style={styles.ratingText}>
            {item.rating} · {moment(item.created_at).format('DD/MM/YYYY')}
          </Text>
        </View>
        
        {item.child_name && (
          <Text style={styles.childInfo}>
            Con: {item.child_name} ({item.child_age} tuổi)
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Average Rating */}
      <View style={styles.header}>
        <View style={styles.avgRatingContainer}>
          <Text style={styles.avgRatingNumber}>{avgRating}</Text>
          <View style={styles.starsContainer}>
            {renderStars(avgRating)}
          </View>
        </View>
        <Text style={styles.avgText}>Đánh giá trung bình</Text>
        <Text style={styles.reviewCount}>
          {reviews.length} đánh giá
        </Text>
      </View>

      {/* List of Reviews */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Animated.View 
            style={[
              styles.loadingSpinner,
              { transform: [{ rotate: spin }] }
            ]} 
          />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={renderReviewCard}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Tính năng đánh giá sẽ sớm được cập nhật! 🌟{'\n'}
              Phụ huynh sẽ có thể đánh giá và nhận xét về các buổi tư vấn.
            </Text>
          }
        />
      )}
    </View>
  );
};

export default Review;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  avgRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avgRatingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  avgText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#888',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f5b50a',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 13,
    marginLeft: 8,
    color: '#666',
  },
  childInfo: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#f5b50a',
    borderBottomColor: 'transparent',
  },
});
