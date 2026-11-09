import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('kaya_token')
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('kaya_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('kaya_token', res.data.token)
    setUser(res.data.user)
    return res.data
  }, [])

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data)
    localStorage.setItem('kaya_token', res.data.token)
    setUser(res.data.user)
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('kaya_token')
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (data) => {
    const res = await api.put('/auth/profile', data)
    if (res.data?.user) {
      setUser(res.data.user)
    }
    return res.data
  }, [])

  const getDetails = useCallback(async () => {
    const res = await api.get('/auth/details')
    if (res.data?.user) {
      setUser(res.data.user)
    }
    return res.data
  }, [])

  const changePassword = useCallback(async (data) => {
    const res = await api.put('/auth/change-password', data)
    return res.data
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      userDetails: user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      updateDetails: updateProfile,
      changePassword,
      getDetails,
      isAdmin: Boolean(user?.is_admin === true || user?.role === 'admin' || user?.role === 'administrator')
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

