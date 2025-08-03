export const dynamic = "force-static"

import { NextRequest, NextResponse } from 'next/server'
import { CompanySettingsCreateSchema } from '@/lib/schemas'

export async function GET(request: NextRequest) {
  try {
    // Check if MongoDB is available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { success: false, error: 'قاعدة البيانات غير متاحة' },
        { status: 503 }
      )
    }

            const { companySettingsModel } = await import('@/lib/models')
        const settings = await companySettingsModel.getCurrentSettings()
    
    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'إعدادات الشركة غير موجودة' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error fetching company settings:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب إعدادات الشركة' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if MongoDB is available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { success: false, error: 'قاعدة البيانات غير متاحة' },
        { status: 503 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = CompanySettingsCreateSchema.parse(body)
    
            const { companySettingsModel } = await import('@/lib/models')
        // Create company settings
        const settings = await companySettingsModel.create(validatedData)
    
    return NextResponse.json({ success: true, data: settings }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating company settings:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء إعدادات الشركة' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if MongoDB is available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { success: false, error: 'قاعدة البيانات غير متاحة' },
        { status: 503 }
      )
    }

    const body = await request.json()
    
            const { companySettingsModel } = await import('@/lib/models')
        // Update current settings
        const settings = await companySettingsModel.updateCurrentSettings(body)
    
    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'إعدادات الشركة غير موجودة' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: settings })
  } catch (error: any) {
    console.error('Error updating company settings:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث إعدادات الشركة' },
      { status: 500 }
    )
  }
} 