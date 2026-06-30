import React, { useCallback, useEffect, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { COLORS } from '../../config/env'
import ScreenHeader from '../../components/ScreenHeader'
import { getAdminDashboard, getSiteConfig } from '../../services/api'

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState(null)
  const [config, setConfig] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const [statsResult, configResult] = await Promise.allSettled([getAdminDashboard(), getSiteConfig()])
    if (statsResult.status === 'fulfilled') setStats(statsResult.value)
    if (configResult.status === 'fulfilled') setConfig(configResult.value)
  }, [])

  useEffect(() => {
    load().catch(() => {})
  }, [load])

  async function refresh() {
    setRefreshing(true)
    try {
      await load()
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      <ScreenHeader title="Administration" subtitle="Supervision mobile" />
      <View style={styles.grid}>
        <Box label="Signalements" value={stats?.totalSignalements || stats?.total || 0} />
        <Box label="Utilisateurs" value={stats?.totalUsers || stats?.users || 0} />
        <Box label="Campagnes" value={stats?.totalCampagnes || stats?.campaigns || 0} />
        <Box label="Logo BD" value={config?.logoUrl ? 'OK' : '...'} />
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Configuration</Text>
        <Text style={styles.text}>Le logo, les textes d accueil, les images du diaporama et les statistiques restent geres par le backend Render et le dashboard Vercel.</Text>
      </View>
    </ScrollView>
  )
}

function Box({ label, value }) {
  return (
    <View style={styles.box}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fbfa' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20 },
  box: { width: '47%', backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, padding: 16 },
  value: { color: COLORS.primary, fontSize: 24, fontWeight: '900' },
  label: { color: COLORS.muted, marginTop: 4 },
  card: { margin: 20, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, padding: 16 },
  title: { color: COLORS.ink, fontSize: 18, fontWeight: '900' },
  text: { color: COLORS.muted, marginTop: 8, lineHeight: 22 }
})
