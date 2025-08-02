import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Check if MongoDB is available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { 
          success: false, 
          status: 'error',
          message: 'قاعدة البيانات غير متاحة',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    // Test database connection
    try {
      const db = await getDatabase()
      await db.admin().ping()
    } catch (dbError) {
      return NextResponse.json(
        { 
          success: false, 
          status: 'error',
          message: 'فشل في الاتصال بقاعدة البيانات',
          error: dbError instanceof Error ? dbError.message : 'Unknown error',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    // Check environment variables
    const envCheck = {
      mongodb: !!process.env.MONGODB_URI,
      jwt: !!process.env.JWT_SECRET,
      cors: !!process.env.CORS_ORIGIN,
      nodeEnv: process.env.NODE_ENV || 'development'
    }

    return NextResponse.json({
      success: true,
      status: 'healthy',
      message: 'النظام يعمل بشكل طبيعي',
      environment: envCheck,
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