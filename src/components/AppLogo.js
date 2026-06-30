import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { COLORS, resolveMediaUrl } from '../config/env'
import { getSiteConfig } from '../services/api'

export default function AppLogo({ size = 44 }) {
  const [logoUrl, setLogoUrl] = useState(null)

  useEffect(() => {
    let mounted = true
    getSiteConfig()
      .then((config) => {
        if (mounted && config?.logoUrl) setLogoUrl(resolveMediaUrl(config.logoUrl))
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  if (logoUrl) {
    return <Image source={{ uri: logoUrl }} style={[styles.image, { width: size, height: size, borderRadius: size / 4 }]} />
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 4 }]}>
      <Text style={[styles.text, { fontSize: Math.max(14, size * 0.38) }]}>SM</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#fff'
  },
  fallback: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: '#fff',
    fontWeight: '900'
  }
})
