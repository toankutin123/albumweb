import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authService.getMe()
        .then(res => {
          setUser(res.data.user)
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const res = await authService.login(username, password)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    return res
  }

  const register = async (data) => {
    const res = await authService.register(data)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    return res
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const refreshBalance = async () => {
    try {
      const res = await authService.getBalance()
      setUser(prev => ({ ...prev, balance: res.data.balance }))
    } catch (error) {
      console.error('Error refreshing balance:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshBalance }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
