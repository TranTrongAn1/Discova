import { StyleSheet, Text, View, FlatList, Image } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import psychologists from '../(Pychologist)/pyschcologists';

const Review = () => {
  // Calculate average rating
  const avgRating = (
    psychologists.reduce((sum, p) => sum + p.rating, 0) / psychologists.length
  ).toFixed(1);
    const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
        stars.push(<Ionicons key={i} name="star" size={16} color="#f5b50a" />);
        } else if (rating >= i - 0.5) {
        stars.push(<Ionicons key={i} name="star-half" size={16} color="#f5b50a" />);
        } else {
        stars.push(<Ionicons key={i} name="star-outline" size={16} color="#f5b50a" />);
        }
    }
    return stars;
    };

  return (
    <View style={styles.container}>
      {/* Average Rating */}
            <View style={styles.header}>
            <Text style={styles.avgRating}>{avgRating} {renderStars(avgRating)}</Text>
            
            <Text style={styles.avgText}>Average Rating</Text>
            </View>


      {/* List of Reviews */}
      <FlatList
        data={psychologists}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.img }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.des}</Text>
              <View style={styles.ratingRow}>
                {renderStars(avgRating)}
                <Text style={styles.ratingText}>
                  {item.rating} · 12/04/2025
                </Text>
              </View>
            </View>
          </View>
        )}
      />
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
  },
  avgRating: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    alignItems: 'center',
    
  },
  avgText: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#222',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    marginLeft: 4,
    color: '#444',
  },
});
