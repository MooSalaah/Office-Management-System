export const dynamic = "force-static"

import { NextRequest, NextResponse } from 'next/server'
import { UserProfileCreateSchema } from '@/lib/schemas'

export async function GET(request: NextRequest) {
  try {
    // Check if MongoDB is available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { success: false, error: 'قاعدة البيانات غير متاحة' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const role = searchParams.get('role')
    const department = searchParams.get('department')
    
            const { userProfileModel } = await import('@/lib/models')
        let profiles
        if (query) {
          profiles = await userProfileModel.searchUsers(query)
        } else if (role) {
          profiles = await userProfileModel.getUsersByRole(role)
        } else if (department) {
          profiles = await userProfileModel.getUsersByDepartment(department)
        } else {
          profiles = await userProfileModel.findAll()
        }
    
    return NextResponse.json({ success: true, data: profiles })
  } catch (error) {
    console.error('Error fetching user profiles:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الملفات الشخصية' },
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
    const validatedData = UserProfileCreateSchema.parse(body)
    
            const { userProfileModel } = await import('@/lib/models')
        // Create user profile
        const profile = await userProfileModel.create(validatedData)
    
    return NextResponse.json({ success: true, data: profile }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user profile:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء الملف الشخصي' },
      { status: 500 }
    )
  }
} 