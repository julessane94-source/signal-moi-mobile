import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'
import { COLORS } from '../../config/env'
import { getLiveSessions, getPoliceDashboard, takePoliceAction } from '../../services/api'
import { connectLiveSocket, disconnectLiveSocket } from '../../services/liveSocket'
import { useAuth } from '../../context/AuthContext'
import PrimaryButton from '../../components/PrimaryButton'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
})

export default function PoliceDashboardScreen() {
  const { token, user, signOut } = useAuth()
  const [cases, setCases] = useState([])
  const [lives, setLives] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('attente')

  const activeCases = useMemo(() => {
    return cases.filter((item) => {
      if (filter === 'tous') return true
      return String(item.statut || item.status || '').toLowerCase().includes(filter)
    })
  }, [cases, filter])

  const loadData = useCallback(async () => {
    const [dashboardResult, liveResult] = await Promise.allSettled([
      getPoliceDashboard(),
      getLiveSessions()
    ])
    if (dashboardResult.status === 'fulfilled') {
      const data = dashboardResult.value
      setCases(data.signalements || data.alerts || data.cases || [])
    }
    if (liveResult.status === 'fulfilled') {
      setLives(liveResult.value.sessions || liveResult.value.liveSessions || liveResult.value || [])
    }
  }, [])

  useEffect(() => {
    Notifications.requestPermissionsAsync()
    loadData()

    const socket = connectLiveSocket(token, user)
    const onNewCase = async (payload) => {
      setCases((current) => [payload.signalement || payload, ...current])
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Nouveau signalement',
          body: 'Une nouvelle alerte citoyenne vient d arriver.',
          sound: true
        },
        trigger: null
      })
    }
    const onLive = async (payload) => {
      setLives((current) => [payload.session || payload, ...current])
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Live citoyen en cours',
          body: 'Ouvrez l espace police pour suivre la video en temps reel.',
          sound: true
        },
        trigger: null
      })
    }

    socket?.on('new_signalement', onNewCase)
    socket?.on('signalement:new', onNewCase)
    socket?.on('live_session_started', onLive)
    socket?.on('live:started', onLive)

    return () => {
      socket?.off('new_signalement', onNewCase)
      socket?.off('signalement:new', onNewCase)
      socket?.off('live_session_started', onLive)
      socket?.off('live:started', onLive)
      disconnectLiveSocket()
    }
  }, [loadData, token, user])

  async function refresh() {
    setRefreshing(true)
    try {
      await loadData()
    } finally {
      setRefreshing(false)
    }
  }

  async function intervene(caseId) {
    try {
      await takePoliceAction(caseId)
      Alert.alert('Intervention lancee', 'Le dossier est pris en charge.')
      await loadData()
    } catch (error) {
      Alert.alert('Action impossible', error.response?.data?.message || 'Reessayez dans un instant.')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Espace police</Text>
          <Text style={styles.subtitle}>{lives.length} live(s) en cours</Text>
        </View>
        <PrimaryButton title="Sortir" onPress={signOut} tone="police" style={styles.logout} />
      </View>

      <View style={styles.livePanel}>
        <View style={styles.liveHeader}>
          <Ionicons name="radio" size={22} color={COLORS.danger} />
          <Text style={styles.liveTitle}>Lives citoyens</Text>
        </View>
        {lives.length ? (
          lives.slice(0, 3).map((live) => (
            <View key={live.id || live.sessionId || live.signalement_id} style={styles.liveItem}>
              <View>
                <Text style={styles.liveName}>{live.title || live.type || 'Video en direct'}</Text>
                <Text style={styles.liveMeta}>{live.location || live.adresse || 'Position recue par GPS'}</Text>
              </View>
              <Pressable style={styles.liveButton}>
                <Ionicons name="play" size={18} color="#fff" />
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Aucun live affiche pour le moment.</Text>
        )}
      </View>

      <View style={styles.filters}>
        {['attente', 'cours', 'tous'].map((item) => (
          <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}>
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={activeCases}
        keyExtractor={(item, index) => String(item.id || item._id || index)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.caseCard}>
            <View style={styles.caseTop}>
              <Text style={styles.caseType}>{item.type || 'Signalement'}</Text>
              <Text style={styles.caseStatus}>{item.statut || item.status || 'attente'}</Text>
            </View>
            <Text numberOfLines={2} style={styles.caseText}>{item.description || 'Aucun detail fourni.'}</Text>
            <Text style={styles.caseMeta}>{item.adresse || item.location || 'Adresse GPS disponible dans le dossier'}</Text>
            <PrimaryButton title="Intervenir" tone="police" onPress={() => intervene(item.id || item._id)} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun signalement dans ce filtre.</Text>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8ff',
    paddingTop: 56
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  title: {
    color: '#0f1f44',
    fontSize: 28,
    fontWeight: '900'
  },
  subtitle: {
    color: COLORS.muted,
    marginTop: 5
  },
  logout: {
    minHeight: 42,
    paddingHorizontal: 14
  },
  livePanel: {
    margin: 20,
    borderRadius: 22,
    backgroundColor: '#0f1f44',
    padding: 18,
    gap: 12
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  liveTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900'
  },
  liveItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  liveName: {
    color: '#fff',
    fontWeight: '900'
  },
  liveMeta: {
    color: '#c9d7ff',
    marginTop: 4
  },
  liveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center'
  },
  filters: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 12
  },
  filter: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbe6ff'
  },
  filterActive: {
    backgroundColor: COLORS.police,
    borderColor: COLORS.police
  },
  filterText: {
    color: COLORS.muted,
    fontWeight: '800',
    textTransform: 'capitalize'
  },
  filterTextActive: {
    color: '#fff'
  },
  list: {
    padding: 20,
    paddingTop: 0,
    gap: 12
  },
  caseCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe6ff',
    gap: 10
  },
  caseTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  caseType: {
    color: '#0f1f44',
    fontSize: 17,
    fontWeight: '900',
    textTransform: 'capitalize'
  },
  caseStatus: {
    color: COLORS.police,
    fontWeight: '900'
  },
  caseText: {
    color: COLORS.ink,
    lineHeight: 21
  },
  caseMeta: {
    color: COLORS.muted
  },
  emptyText: {
    color: COLORS.muted,
    textAlign: 'center',
    padding: 16
  }
})
