import { StyleSheet, Text, View, Image } from 'react-native';
import React from 'react';
import comming from '../../assets/images/CommingSoon.png'
const Mess = () => {
  return (
    <View style={styles.container}>
      <Image
        source={comming}
        style={styles.image}
      />
      <Text style={styles.title}>Tính năng sắp ra mắt!</Text>
      <Text style={styles.subtitle}>
        Tính năng này đang được phát triển. Hãy quay lại sau nhé!
      </Text>
    </View>
  );
};

export default Mess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4b0082',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
