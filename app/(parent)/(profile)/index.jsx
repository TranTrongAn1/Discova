import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native';
import React, { use } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const profileImage = null; // Replace this with your image URL or null
const settingsOptions = [
  { label: 'Gói đăng ký', route: 'subscription' },
  { label: 'Thông tin cơ bản', route: 'info' },
  { label: 'Hồ sơ của bé', route: 'ChildProfile' },
  { label: 'Thông tin đặt lịch', route: 'BookingInfo' },
  { label: 'Cài đặt tài khoản', route: 'AccountSettings' },
  { label: 'Cộng đồng và bài đăng', route: 'CommunityPosts' },
  { label: 'Giao diện', route: 'Appearance' },
  { label: 'Ngôn ngữ', route: 'Language' },
  { label: 'Quyền & Bảo mật', route: 'PrivacySecurity' },
];
const Profile = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hồ Sơ</Text>

      <Image
        style={styles.image}
        resizeMode="cover"
        source={
          profileImage
            ? { uri: profileImage }
            : require('../../../assets/images/default-profile.png')
        }
      />
      <Text style={styles.username}>Tên người dùng</Text>
      <Text style={styles.mail}>Email</Text>
        <FlatList
            data={settingsOptions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity
                style={styles.listItem}
                onPress={() => router.push(`/${item.route}`)} // Navigate to the screen
                activeOpacity={0.6}
                >
                <Text style={styles.listText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
                </TouchableOpacity>
            )}
            />

    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    
  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginLeft: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee', // fallback background if image fails to load
    alignSelf: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
    mail: {
        fontSize: 16,
        color: '#71727A',
        textAlign: 'center',
        marginTop: 5,
    },
    listItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    listText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 10, 
    },

});
