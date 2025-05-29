import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import comming from '../../assets/images/CommingSoon.png'
const communication = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cộng đồng</Text>
            <Image
              source={comming}
              style={styles.image}
            />
            <Text style={styles.title}>Tính năng sắp ra mắt!</Text>
            <Text style={styles.subtitle}>
              Tính năng này được phát triển. Hãy quay lại sau nhé!
            </Text>
    </View>
  )
}

export default communication

const styles = StyleSheet.create({
      container: {
    flex: 1,
    paddingTop: 50,
     // or 'center' depending on design
  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
  },
    text1: {
        fontSize: 50,
        color: '#333',
        marginLeft: 20,
        marginTop: 10,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',   
        fontWeight: 'bold',
    },
image: {
    width: 180,
    height: 180,
    marginBottom: 24,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 185,
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
})