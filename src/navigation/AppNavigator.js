import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { COLORS } from '../config/env'
import { useAuth } from '../context/AuthContext'
import LoginScreen from '../screens/Auth/LoginScreen'
import CitizenHomeScreen from '../screens/Citizen/CitizenHomeScreen'
import CreateSignalementScreen from '../screens/Citizen/CreateSignalementScreen'
import PoliceDashboardScreen from '../screens/Police/PoliceDashboardScreen'
import LoadingScreen from '../screens/Shared/LoadingScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function CitizenTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 8
        },
        tabBarIcon: ({ color, size }) => {
          const icon = route.name === 'Signaler' ? 'megaphone' : 'home'
          return <Ionicons name={icon} size={size} color={color} />
        }
      })}
    >
      <Tab.Screen name="Accueil" component={CitizenHomeScreen} />
      <Tab.Screen name="Signaler" component={CreateSignalementScreen} />
    </Tab.Navigator>
  )
}

function PoliceTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.police,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 8
        }
      }}
    >
      <Tab.Screen
        name="Interventions"
        component={PoliceDashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  )
}

function RoleHome() {
  const { user } = useAuth()
  const role = String(user?.role || '').toLowerCase()

  if (role.includes('police') || role.includes('gendarmerie') || role.includes('force')) {
    return <PoliceTabs />
  }

  return <CitizenTabs />
}

export default function AppNavigator() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="RoleHome" component={RoleHome} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  )
}
