import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { COLORS } from '../../config/env'

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>SM</Text>
      </View>
      <ActivityIndicator color={COLORS.primary} size="large" />
      <Text style={styles.text}>Signal Moi charge votre espace...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
    gap: 18
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900'
  },
  text: {
    color: COLORS.muted,
    fontSize: 15
  }
})
