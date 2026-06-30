import axios from 'axios'
import { API_URL } from '../config/env'
import { getSession } from './storage'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    Accept: 'application/json'
  }
})

api.interceptors.request.use(async (config) => {
  const { token } = await getSession()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function loginWithGoogle(idToken) {
  const { data } = await api.post('/auth/google', { token: idToken, credential: idToken, idToken })
  return data
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export async function forgotPassword(email) {
  const { data } = await api.post('/auth/forgot-password', { email })
  return data
}

export async function verifyResetCode(email, code) {
  const { data } = await api.post('/auth/verify-reset-code', { email, code })
  return data
}

export async function resetPassword(email, code, password) {
  const { data } = await api.post('/auth/reset-password', { email, code, password })
  return data
}

export async function getMe() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function getHomeContent() {
  const { data } = await api.get('/pages/home')
  return data
}

export async function checkBackendConnection() {
  const { data } = await api.get('/auth/site-config')
  return data
}

export async function getSiteConfig() {
  const { data } = await api.get('/auth/site-config')
  return data
}

export async function getLogoFromDatabase() {
  const { data } = await api.get('/pages/logo')
  return data
}

export async function getCampagnes() {
  const { data } = await api.get('/campagnes')
  return data
}

export async function joinCampagne(id) {
  const { data } = await api.post(`/campagnes/${id}/inscrire`)
  return data
}

export async function getCitizenDashboard() {
  const { data } = await api.get('/citizen/dashboard')
  return data
}

export async function getCitizenSignalements() {
  const { data } = await api.get('/citizen/signalements')
  return data
}

export async function getPoliceDashboard() {
  const { data } = await api.get('/law-enforcement/dashboard')
  return data
}

export async function getCollaboratorDashboard() {
  const { data } = await api.get('/collaborator/dashboard')
  return data
}

export async function getCollaboratorStatistics() {
  const { data } = await api.get('/collaborator/statistics')
  return data
}

export async function getAdminDashboard() {
  const { data } = await api.get('/admin/statistics')
  return data
}

export async function getCompleteStatistics() {
  const [overview, byType, byGender, byAge] = await Promise.all([
    api.get('/statistics/overview'),
    api.get('/statistics/by-type'),
    api.get('/statistics/by-gender'),
    api.get('/statistics/by-age')
  ])
  return {
    overview: overview.data,
    byType: byType.data,
    byGender: byGender.data,
    byAge: byAge.data
  }
}

export async function getLiveSessions() {
  const { data } = await api.get('/signalements/live-sessions')
  return data
}

export async function sendLiveSession(payload) {
  const { data } = await api.post('/signalements/live-session', payload)
  return data
}

export async function createSignalement(payload) {
  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (key === 'files') {
      value.forEach((file, index) => {
        form.append('fichiers', {
          uri: file.uri,
          name: file.fileName || `preuve-${index + 1}.jpg`,
          type: file.mimeType || 'image/jpeg'
        })
      })
      return
    }
    form.append(key, String(value))
  })

  const { data } = await api.post('/signalements', form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return data
}

export async function takePoliceAction(caseId, action = 'intervenir') {
  const { data } = await api.post(`/law-enforcement/case/${caseId}/take-action`, { action })
  return data
}

export async function updatePoliceCaseStatus(caseId, status) {
  const { data } = await api.put(`/law-enforcement/case/${caseId}/status`, { status })
  return data
}

export async function followCase(caseId) {
  const { data } = await api.post('/collaborator/follow', { caseId })
  return data
}

export async function sendContactMessage(payload) {
  const { data } = await api.post('/contact/send', payload)
  return data
}
