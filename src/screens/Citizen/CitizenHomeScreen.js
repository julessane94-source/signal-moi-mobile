import React, { useCallback, useEffect, useState } from 'react'
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../config/env'
import { getCampagnes, getCitizenDashboard, joinCampagne } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useLocation } from '../../context/LocationContext'
import PrimaryButton from '../../components/PrimaryButton'

export default function CitizenHomeScreen() {
  const { user, signOut } = useAuth()
  const { position, address, requestCurrentLocation } = useLocation()
  const [dashboard, setDashboard] = useState(null)
  const [campagnes, setCampagnes] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    const [dashboardResult, campagnesResult] = await Promise.allSettled([
      getCitizenDashboard(),
      getCampagnes()
    ])
    if (dashboardResult.status === 'fulfilled') setDashboard(dashboardResult.value)
    if (campagnesResult.status === 'fulfilled') {
      setCampagnes(campagnesResult.value.campagnes || campagnesResult.value || [])
    }
  }, [])

  useEffect(() => {
    requestCurrentLocation()
    loadData()
  }, [loadData])

  async function refresh() {
    setRefreshing(true)
    try {
      await Promise.all([requestCurrentLocation(), loadData()])
    } finally {
      setRefreshing(false)
    }
  }

  async function handleJoin(campaignId) {
    try {
      await joinCampagne(campaignId)
      Alert.alert('Inscription envoyee', 'Vous etes inscrit a cette campagne.')
      await loadData()
    } catch (error) {
      Alert.alert('Inscription impossible', error.response?.data?.message || 'Reessayez dans un instant.')
    }
  }

  const locationLabel = address?.city || address?.subregion || address?.region || 'Position precise activee'

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Bonjour {user?.prenom || user?.name || ''}</Text>
          <Text style={styles.location}>
            <Ionicons name="location" size={14} color={COLORS.primary} /> {locationLabel}
          </Text>
        </View>
        <PrimaryButton title="Sortir" onPress={signOut} style={styles.logout} />
      </View>

      <View style={styles.alertCard}>
        <Text style={styles.alertTitle}>Besoin d'aide maintenant ?</Text>
        <Text style={styles.alertText}>
          Ouvrez l'onglet Signaler. Votre position GPS sera ajoutee automatiquement au dossier.
        </Text>
      </View>

      <View style={styles.grid}>
        <Stat label="Signalements" value={dashboard?.totalSignalements || dashboard?.stats?.total || 0} icon="document-text" />
        <Stat label="En cours" value={dashboard?.enCours || dashboard?.stats?.enCours || 0} icon="time" />
      </View>

      <Text style={styles.sectionTitle}>Campagnes disponibles</Text>
      {campagnes.slice(0, 4).map((campagne) => (
        <View key={campagne.id || campagne._id} style={styles.card}>
          <Text style={styles.cardTitle}>{campagne.titre || campagne.title}</Text>
          <Text numberOfLines={2} style={styles.cardText}>
            {campagne.description || 'Campagne Signal Moi'}
          </Text>
          <PrimaryButton title="Participer" onPress={() => handleJoin(campagne.id || campagne._id)} />
        </View>
      ))}

      {position ? (
        <Text style={styles.coords}>GPS: {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}</Text>
      ) : null}
    </ScrollView>
  )
}

function Stat({ label, value, icon }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={22} color={COLORS.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fbfa'
  },
  content: {
    padding: 20,
    paddingTop: 56,
    gap: 18
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14
  },
  hello: {
    color: COLORS.ink,
    fontSize: 25,
    fontWeight: '900'
  },
  location: {
    color: COLORS.muted,
    marginTop: 6
  },
  logout: {
    minHeight: 42,
    paddingHorizontal: 14
  },
  alertCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 22,
    padding: 22
  },
  alertTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900'
  },
  alertText: {
    color: '#d9fffa',
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22
  },
  grid: {
    flexDirection: 'row',
    gap: 12
  },
  stat: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  statValue: {
    color: COLORS.ink,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 8
  },
  statLabel: {
    color: COLORS.muted,
    marginTop: 4
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 19,
    fontWeight: '900'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 10
  },
  cardTitle: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '900'
  },
  cardText: {
    color: COLORS.muted,
    lineHeight: 21
  },
  coords: {
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 18
  }
})
