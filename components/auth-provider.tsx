"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Cookies from 'js-cookie'

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "engineer" | "accountant" | "hr" | "employee"
  avatar?: string
  permissions: string[]
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  userId: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const fetchUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = Cookies.get('token')
      if (token) {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // Token might be invalid or expired
          Cookies.remove('token')
          setUser(null)
        }
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
      Cookies.remove('token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        Cookies.set('token', data.token, { expires: 7, secure: process.env.NODE_ENV === 'production' })
        await fetchUser() // Fetch user details after successful login
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Invalid credentials")
      }
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    Cookies.remove('token')
    setUser(null)
    router.push("/")
  }

  const userId = user ? user.id : null

  return <AuthContext.Provider value={{ user, login, logout, isLoading, userId }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}