import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

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
        const db = await getDatabase()
        await db.admin().ping()
        dbStatus = 'connected'
      } catch (error) {
        dbStatus = 'error'
        dbError = error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test config information',
      timestamp: new Date().toISOString(),
      environment: envVars,
      database: {
        status: dbStatus,
        error: dbError
      },
    })
  } catch (error) {
    console.error('Test config API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}