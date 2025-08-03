export const dynamic = "force-static"

import { NextRequest, NextResponse } from 'next/server'
import { UserProfileUpdateSchema } from '@/lib/schemas'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  try {
    // Check if MongoDB is available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { success: false, error: 'قاعدة البيانات غير متاحة' },
        { status: 503 }
      )
    }

    const { userProfileModel } = await import('@/lib/models')
    const profile = await userProfileModel.findByUserId(userId)
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'الملف الشخصي غير موجود' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الملف الشخصي' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
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
    const validatedData = UserProfileUpdateSchema.parse(body)
    
            const { userProfileModel } = await import('@/lib/models')
        // Update user profile
        const profile = await userProfileModel.update(userId, validatedData)
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'الملف الشخصي غير موجود' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: profile })
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث الملف الشخصي' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  try {
    // Check if MongoDB is available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { success: false, error: 'قاعدة البيانات غير متاحة' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { type, data } = body
    
            const { userProfileModel } = await import('@/lib/models')
        let success = false

        switch (type) {
          case 'preferences':
            success = await userProfileModel.updatePreferences(userId, data)
            break
          case 'basic-info':
            success = await userProfileModel.updateBasicInfo(userId, data)
            break
          case 'work-info':
            success = await userProfileModel.updateWorkInfo(userId, data)
            break
          case 'avatar':
            success = await userProfileModel.updateAvatar(userId, data.avatarUrl)
            break
          default:
            return NextResponse.json(
              { success: false, error: 'نوع التحديث غير معروف' },
              { status: 400 }
            )
        }
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'فشل في تحديث البيانات' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, message: 'تم التحديث بنجاح' })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث الملف الشخصي' },
      { status: 500 }
    )
  }
} 