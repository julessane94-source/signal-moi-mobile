import Constants from 'expo-constants'

const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {}

export const API_URL = extra.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'https://signal-moi.sn/api'
export const SOCKET_URL = extra.socketUrl || process.env.EXPO_PUBLIC_SOCKET_URL || 'https://signal-moi.sn'

export const COLORS = {
  primary: '#0f766e',
  primaryDark: '#134e4a',
  accent: '#f59e0b',
  danger: '#dc2626',
  ink: '#10201d',
  muted: '#667085',
  surface: '#ffffff',
  soft: '#edf7f5',
  border: '#d9e7e3',
  police: '#1d4ed8'
}
