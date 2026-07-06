import { createContext, useContext, useState } from 'react'
import { getToken, getUser, setToken, setUser, removeToken, removeUser } from '../utils/tokenUtils'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken())
  const [user, setUserState] = useState(getUser())

  const login = (tokenValue, userValue) => {
    setToken(tokenValue)
    setUser(userValue)
    setTokenState(tokenValue)
    setUserState(userValue)
  }

  const logout = () => {
    removeToken()
    removeUser()
    setTokenState(null)
    setUserState(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)