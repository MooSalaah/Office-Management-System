import { NextRequest, NextResponse } from 'next/server'
import { UserCreateSchema } from '@/lib/schemas'

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
    const status = searchParams.get('status')

    const { userModel } = await import('@/lib/models') // Dynamic import
    let users
    if (query) {
      users = await userModel.search(query)
    } else if (role) {
      users = await userModel.findByRole(role)
    } else {
      users = await userModel.findAll()
    }

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المستخدمين' },
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
    const validatedData = UserCreateSchema.parse(body)

    const { userModel } = await import('@/lib/models') // Dynamic import
    // Create user
    const user = await userModel.create(validatedData)

    // Emit real-time update
    try {
      // @ts-ignore - Next.js specific
      const io = req.socket?.server?.io
      if (io) {
        io.emit('data-changed', {
          type: 'create',
          entity: 'user',
          entityId: user._id,
          data: user,
          userId: 'system',
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Failed to emit real-time update:', error)
    }

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء المستخدم' },
      { status: 500 }
    )
  }
} 