export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { CompanySettingsCreateSchema } from '@/lib/schemas'
import { companySettingsModel } from '@/lib/models'

import { checkMongoDb, handleError } from '@/lib/api-utils'



export async function GET(request: NextRequest) {
  const dbCheck = checkMongoDb()
  if (dbCheck) return dbCheck

  try {
    const settings = await companySettingsModel.getCurrentSettings()
    
    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'إعدادات الشركة غير موجودة' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  const dbCheck = checkMongoDb()
  if (dbCheck) return dbCheck

  try {
    const userId = request.headers.get('X-User-Id')
    if (!userId) {
      throw new Error('User ID not found in token')
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = CompanySettingsCreateSchema.parse(body)

    const dataWithUser = { ...validatedData, createdBy: userId }
    
        // Create company settings
        const settings = await companySettingsModel.create(dataWithUser)
    
    return NextResponse.json({ success: true, data: settings }, { status: 201 })
  } catch (error: any) {
    return handleError(error)
  }
}

export async function PUT(request: NextRequest) {
  const dbCheck = checkMongoDb()
  if (dbCheck) return dbCheck

  try {
    const userId = request.headers.get('X-User-Id')
    if (!userId) {
      throw new Error('User ID not found in token')
    }

    const body = await request.json()

    const dataWithUser = { ...body, updatedBy: userId }
    
        // Update current settings
        const settings = await companySettingsModel.updateCurrentSettings(dataWithUser)
    
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