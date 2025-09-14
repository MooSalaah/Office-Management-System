import { NextRequest, NextResponse } from 'next/server'

import { NextRequest, NextResponse } from 'next/server'
import { handleError } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    // Get environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT_SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT_SET',
      CORS_ORIGIN: process.env.CORS_ORIGIN,
      PORT: process.env.PORT
    }

    // Test database connection
    let dbStatus = 'not-tested'
    let dbError = null
    
    if (process.env.MONGODB_URI) {
      try {
        const { getDatabase } = await import('@/lib/database')
        const db = await getDatabase()
        await db.admin().ping()
        dbStatus = 'connected'
      } catch (error) {
        dbStatus = 'error'
        dbError = error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Get request info
    const requestInfo = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      origin: request.headers.get('origin'),
      host: request.headers.get('host')
    }

    return NextResponse.json({
      success: true,
      message: 'Debug information',
      timestamp: new Date().toISOString(),
      environment: envVars,
      database: {
        status: dbStatus,
        error: dbError
      },
      request: requestInfo,
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT_SET'
    })
  } catch (error) {
    return handleError(error)
  }
} 