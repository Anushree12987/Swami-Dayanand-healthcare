import React, { createContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { toast } from 'react-toastify'

// Export AuthContext
export const AuthContext = createContext({})

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userData = await authService.getCurrentUser()
          let resolvedUser = null

          if (userData && userData.user) {
            resolvedUser = userData.user
          } else if (userData) {
            resolvedUser = userData
          }

          // Validate that this user is actually a doctor
          if (resolvedUser && resolvedUser.role === 'doctor') {
            setUser(resolvedUser)
          } else {
            // Not a doctor — clear token so PrivateRoute redirects to login
            console.warn('Non-doctor token detected in Doctor Dashboard. Clearing session.')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    setUser(data.user)
    return data
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}