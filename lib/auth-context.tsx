"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

// Utility function to extract sheetId and gid from Google Sheets URL
export function extractSheetInfo(url: string): { sheetId: string; gid: string } {
  try {
    const urlObj = new URL(url)
    
    // Extract sheetId from URL path (after /d/)
    const pathMatch = urlObj.pathname.match(/\/d\/([a-zA-Z0-9-_]+)/)
    const sheetId = pathMatch ? pathMatch[1] : ''
    
    // Extract gid from URL hash fragment (#gid=123) or search parameters (?gid=123)
    let gid = '0'
    
    // First try to get gid from hash fragment (most common in Google Sheets URLs)
    if (urlObj.hash) {
      const hashMatch = urlObj.hash.match(/[#&]gid=(\d+)/)
      if (hashMatch) {
        gid = hashMatch[1]
      }
    }
    
    // If not found in hash, try search parameters
    if (gid === '0') {
      gid = urlObj.searchParams.get('gid') || '0'
    }
    
    console.log('Extracted sheet info:', { url, sheetId, gid })
    
    return { sheetId, gid }
  } catch (error) {
    console.error('Error parsing Google Sheets URL:', error)
    return { sheetId: '', gid: '0' }
  }
}

export interface User {
  id: string
  username: string
  password: string
  role: 'admin' | 'user'
  name: string
}

export interface Dashboard {
  id: string
  name: string
  googleSheetsUrl: string
  owner: string
  createdAt: string
  additionalColumns?: {
    leadSource: boolean
    leadCategories: boolean
  }
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  dashboards: Dashboard[]
  addDashboard: (dashboard: Omit<Dashboard, 'id' | 'createdAt'>) => void
  deleteDashboard: (id: string) => void
  editDashboard: (id: string, updates: Partial<Omit<Dashboard, 'id' | 'createdAt'>>) => void
  users: User[]
  createUser: (userData: Omit<User, 'id'>) => void
  editUser: (id: string, updates: Partial<Omit<User, 'id'>>) => void
  deleteUser: (id: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin',
    role: 'admin',
    name: 'Administrator'
  },
  {
    id: '2',
    username: 'user1',
    password: 'password',
    role: 'user',
    name: 'John Doe'
  },
  {
    id: '3',
    username: 'user2',
    password: 'password',
    role: 'user',
    name: 'Jane Smith'
  }
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [users, setUsers] = useState<User[]>(mockUsers)

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedDashboards = localStorage.getItem('dashboards')
    const savedUsers = localStorage.getItem('users')
    
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    
    if (savedDashboards) {
      setDashboards(JSON.parse(savedDashboards))
    }
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // First try PostgreSQL login for Kia users
    if (username === 'kia' || username === 'kia_admin' || username === 'admin') {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        })

        if (response.ok) {
          const data = await response.json()
          const dbUser: User = {
            id: data.user.id.toString(),
            username: data.user.username,
            password: '', // Don't store password
            role: 'user',
            name: data.user.name
          }
          setUser(dbUser)
          localStorage.setItem('user', JSON.stringify(dbUser))
          return true
        }
      } catch (error) {
        console.error('Database login failed, trying local auth:', error)
      }
    }

    // Fallback to local users for old system
    const foundUser = users.find(u => u.username === username)
    
    if (foundUser && foundUser.password === password) {
      setUser(foundUser)
      localStorage.setItem('user', JSON.stringify(foundUser))
      return true
    }
    
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const addDashboard = (dashboard: Omit<Dashboard, 'id' | 'createdAt'>) => {
    const newDashboard: Dashboard = {
      ...dashboard,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    
    const updatedDashboards = [...dashboards, newDashboard]
    setDashboards(updatedDashboards)
    localStorage.setItem('dashboards', JSON.stringify(updatedDashboards))
  }

  const deleteDashboard = (id: string) => {
    const updatedDashboards = dashboards.filter(dashboard => dashboard.id !== id)
    setDashboards(updatedDashboards)
    localStorage.setItem('dashboards', JSON.stringify(updatedDashboards))
  }

  const editDashboard = (id: string, updates: Partial<Omit<Dashboard, 'id' | 'createdAt'>>) => {
    const updatedDashboards = dashboards.map(dashboard =>
      dashboard.id === id
        ? { ...dashboard, ...updates }
        : dashboard
    )
    setDashboards(updatedDashboards)
    localStorage.setItem('dashboards', JSON.stringify(updatedDashboards))
  }

  const createUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString()
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem('users', JSON.stringify(updatedUsers))
  }

  const editUser = (id: string, updates: Partial<Omit<User, 'id'>>) => {
    const updatedUsers = users.map(user =>
      user.id === id
        ? { ...user, ...updates }
        : user
    )
    setUsers(updatedUsers)
    localStorage.setItem('users', JSON.stringify(updatedUsers))
  }

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter(user => user.id !== id)
    setUsers(updatedUsers)
    localStorage.setItem('users', JSON.stringify(updatedUsers))
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    dashboards,
    addDashboard,
    deleteDashboard,
    editDashboard,
    users,
    createUser,
    editUser,
    deleteUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
