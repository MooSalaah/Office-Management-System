import { NextRequest, NextResponse } from 'next/server'
import { ProjectCreateSchema } from '@/lib/schemas'

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
    const status = searchParams.get('status')
    
            const { projectModel } = await import('@/lib/models')
        let projects
        if (query) {
          projects = await projectModel.search(query)
        } else if (status) {
          projects = await projectModel.findActive()
        } else {
          projects = await projectModel.findAll()
        }
    
    return NextResponse.json({ success: true, data: projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المشاريع' },
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
    const validatedData = ProjectCreateSchema.parse(body)
    
            const { projectModel } = await import('@/lib/models')
        // Create project
        const project = await projectModel.create(validatedData)
    
    return NextResponse.json({ success: true, data: project }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating project:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء المشروع' },
      { status: 500 }
    )
  }
} 