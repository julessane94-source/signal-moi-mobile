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

export async function getMe() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function getHomeContent() {
  const { data } = await api.get('/pages/home')
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

export async function getPoliceDashboard() {
  const { data } = await api.get('/law-enforcement/dashboard')
  return data
}

export async function getLiveSessions() {
  const { data } = await api.get('/signalements/live-sessions')
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
