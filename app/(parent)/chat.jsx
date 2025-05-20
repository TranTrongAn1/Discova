import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const chat = () => {
  return (
    <View style={styles.container}>
      <Text>chat</Text>
    </View>
  )
}

export default chat

const styles = StyleSheet.create({
      container: {
    flex: 1,
    paddingTop: 50,
     // or 'center' depending on design
  },
})