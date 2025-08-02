"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default users for testing
const defaultUsers: User[] = [
  {
    id: "1",
    name: "محمد قطب",
    email: "mohamed.qutb@office.com",
    role: "admin",
    permissions: ["all"],
  },
  {
    id: "2",
    name: "مصطفى صلاح",
    email: "mostafa.salah@office.com",
    role: "admin",
    permissions: ["all"],
  },
  {
    id: "3",
    name: "عمرو رمضان",
    email: "amr.ramadan@office.com",
    role: "engineer",
    permissions: ["projects", "tasks"],
  },
  {
    id: "4",
    name: "محمد مجدي",
    email: "mohamed.magdy@office.com",
    role: "engineer",
    permissions: ["projects", "tasks"],
  },
  {
    id: "5",
    name: "كرم عبد الرحمن",
    email: "karam.abdelrahman@office.com",
    role: "engineer",
    permissions: ["projects", "tasks"],
  },
  {
    id: "6",
    name: "علي أحمد",
    email: "ali.ahmed@office.com",
    role: "accountant",
    permissions: ["finance", "clients"],
  },
  {
    id: "7",
    name: "مروان جمال",
    email: "marwan.gamal@office.com",
    role: "hr",
    permissions: ["attendance", "users"],
  },
  {
    id: "8",
    name: "وليد عزام",
    email: "walid.azzam@office.com",
    role: "employee",
    permissions: ["tasks", "attendance"],
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate API call
    const foundUser = defaultUsers.find((u) => u.email === email)

    if (foundUser && password === "123456") {
      setUser(foundUser)
      localStorage.setItem("user", JSON.stringify(foundUser))
    } else {
      throw new Error("Invalid credentials")
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
