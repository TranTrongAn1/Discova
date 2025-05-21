import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const info = () => {
  return (
    <View style={styles.container}>
      <Text>info</Text>
    </View>
  )
}

export default info

const styles = StyleSheet.create({
    container: {
    flex: 1,
    paddingTop: 50,
  },
})