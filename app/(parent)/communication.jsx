import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const communication = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cộng đồng</Text>
      <Text style={styles.text1}>Comming Soon</Text>
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

})