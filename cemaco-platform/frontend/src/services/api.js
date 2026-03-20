import axios from 'axios'

const base = import.meta.env.VITE_API_BASE_URL || ''
const baseURL = base ? `${base.replace(/\/$/, '')}/api` : '/api'

export const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export function publicAssetUrl(pathOrUrl) {
  if (!pathOrUrl) return ''
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const base = import.meta.env.VITE_API_BASE_URL || ''
  if (base) {
    const normalized = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
    return `${base.replace(/\/$/, '')}${normalized}`
  }
  return pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
}
