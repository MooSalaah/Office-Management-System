import { NextRequest, NextResponse } from 'next/server'
import { DefaultTaskCreateSchema } from '@/lib/schemas'

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
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    const { defaultTaskModel } = await import('@/lib/models') // Dynamic import
    let tasks
    if (query) {
      tasks = await defaultTaskModel.search(query)
    } else if (category) {
      tasks = await defaultTaskModel.findByCategory(category)
    } else if (active === 'true') {
      tasks = await defaultTaskModel.findActive()
    } else {
      tasks = await defaultTaskModel.findAll()
    }

    return NextResponse.json({ success: true, data: tasks })
  } catch (error) {
    console.error('Error fetching default tasks:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المهام الافتراضية' },
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
    const validatedData = DefaultTaskCreateSchema.parse(body)

    const { defaultTaskModel } = await import('@/lib/models') // Dynamic import
    // Create default task
    const task = await defaultTaskModel.create(validatedData)

    // Emit real-time update
    try {
      // @ts-ignore - Next.js specific
      const io = request.socket?.server?.io
      if (io) {
        io.emit('data-changed', {
          type: 'create',
          entity: 'default-task',
          entityId: task._id,
          data: task,
          userId: 'system',
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Failed to emit real-time update:', error)
    }

    return NextResponse.json({ success: true, data: task }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating default task:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء المهمة الافتراضية' },
      { status: 500 }
    )
  }
} 