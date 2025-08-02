import { NextRequest, NextResponse } from 'next/server'
import { ProjectTypeDefinitionCreateSchema } from '@/lib/schemas'

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
    const active = searchParams.get('active')

    const { projectTypeDefinitionModel } = await import('@/lib/models') // Dynamic import
    let types
    if (query) {
      types = await projectTypeDefinitionModel.search(query)
    } else if (active === 'true') {
      types = await projectTypeDefinitionModel.findActive()
    } else {
      types = await projectTypeDefinitionModel.findAll()
    }

    return NextResponse.json({ success: true, data: types })
  } catch (error) {
    console.error('Error fetching project types:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب أنواع المشاريع' },
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
    const validatedData = ProjectTypeDefinitionCreateSchema.parse(body)

    const { projectTypeDefinitionModel } = await import('@/lib/models') // Dynamic import
    // Create project type
    const type = await projectTypeDefinitionModel.create(validatedData)

    // Emit real-time update
    try {
      // @ts-ignore - Next.js specific
      const io = request.socket?.server?.io
      if (io) {
        io.emit('data-changed', {
          type: 'create',
          entity: 'project-type',
          entityId: type._id,
          data: type,
          userId: 'system',
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Failed to emit real-time update:', error)
    }

    return NextResponse.json({ success: true, data: type }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating project type:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء نوع المشروع' },
      { status: 500 }
    )
  }
} 