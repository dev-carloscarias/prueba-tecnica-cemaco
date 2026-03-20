import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, setAuthToken } from '../services/api'
import { AuthContext } from './authContext'

const STORAGE_KEY = 'cemaco_auth'

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => loadStored())

  useEffect(() => {
    const stored = loadStored()
    if (stored?.token) setAuthToken(stored.token)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    const next = { token: data.token, role: data.role }
    setState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setAuthToken(data.token)
    return data
  }, [])

  const logout = useCallback(() => {
    setState(null)
    localStorage.removeItem(STORAGE_KEY)
    setAuthToken(null)
  }, [])

  const value = useMemo(() => {
    const role = state?.role ?? null
    const isAdmin = role === 'Admin'
    const isColaborador = role === 'Colaborador'
    const isStaff = isAdmin || isColaborador
    return {
      token: state?.token ?? null,
      role,
      isAuthenticated: Boolean(state?.token),
      isAdmin,
      isColaborador,
      isStaff,
      login,
      logout,
    }
  }, [state, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
