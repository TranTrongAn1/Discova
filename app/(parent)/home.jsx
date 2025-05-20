import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Logo from '../../assets/images/Logo.png';

const Home = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
      <Image source={Logo} style={styles.logo} resizeMode='contain' />
      </View>
      <Text style={styles.text}>Chào buổi sáng, User</Text>
      <Text style={styles.text}>Lịch hẹn sắp tới của bạn</Text>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
     // or 'center' depending on design
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
  }
});
