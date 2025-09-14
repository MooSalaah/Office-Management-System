"use client"

import { useAuth } from './auth-provider'
import { RealtimeProvider } from './realtime-provider'
import React from 'react'

export function RealtimeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth()

  return (
    <RealtimeProvider userId={userId}>
      {children}
    </RealtimeProvider>
  )
}
