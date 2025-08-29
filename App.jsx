import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import ChatScreen from './src/screen/ChatScreen'

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor:'#fff', padding:10 }}>
      <ChatScreen />
    </SafeAreaView>
  )
}

export default App

const styles = StyleSheet.create({})