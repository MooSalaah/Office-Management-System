import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      mongodb: !!process.env.MONGODB_URI,
      jwt: !!process.env.JWT_SECRET,
      cors: !!process.env.CORS_ORIGIN,
      nodeEnv: process.env.NODE_ENV || 'development',
      apiUrl: !!process.env.NEXT_PUBLIC_API_URL
    }

    // Only test database connection in production
    let dbStatus = 'not-tested'
    if (process.env.NODE_ENV === 'production' && process.env.MONGODB_URI) {
      try {
        const { getDatabase } = await import('@/lib/database')
        const db = await getDatabase()
        await db.admin().ping()
        dbStatus = 'connected'
      } catch (dbError) {
        dbStatus = 'error'
        console.error('Database connection error:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      status: 'healthy',
      message: 'النظام يعمل بشكل طبيعي',
      environment: envCheck,
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        status: 'error',
        message: 'خطأ في فحص صحة النظام',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 