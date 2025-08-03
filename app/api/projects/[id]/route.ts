export const dynamic = "force-static"

import { NextRequest, NextResponse } from 'next/server'
import { ProjectUpdateSchema } from '@/lib/schemas'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Check if MongoDB is available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { success: false, error: 'قاعدة البيانات غير متاحة' },
        { status: 503 }
      )
    }

    const { projectModel } = await import('@/lib/models')
    const project = await projectModel.findById(id)

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'المشروع غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المشروع' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    const validatedData = ProjectUpdateSchema.parse(body)

    const { projectModel } = await import('@/lib/models')
    // Update project
    const project = await projectModel.update(id, validatedData)

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'المشروع غير موجود' },
        { status: 404 }
      )
    }

    // Emit real-time update and send notifications
    try {
      // @ts-ignore - Next.js specific
      const io = request.socket?.server?.io
      if (io) {
        io.emit('data-changed', {
          type: 'update',
          entity: 'project',
          entityId: project._id,
          data: project,
          userId: 'system',
          timestamp: new Date()
        })

        // Send notification to assigned engineers about project update
        if (project.assignedTo && project.assignedTo.length > 0) {
          project.assignedTo.forEach(userId => {
            io.emit('new-notification', {
              id: Math.random().toString(36).substr(2, 9),
              type: 'info',
              title: 'تم تحديث المشروع',
              message: `تم تحديث مشروع: ${project.title}`,
              timestamp: new Date(),
              targetUserId: userId
            })
          })
        }

        // Send notification to all users if project status changed
        if (validatedData.status) {
          io.emit('new-notification', {
            id: Math.random().toString(36).substr(2, 9),
            type: 'info',
            title: 'تحديث حالة المشروع',
            message: `تم تحديث حالة مشروع: ${project.title} إلى ${validatedData.status}`,
            timestamp: new Date(),
            targetUserId: 'all'
          })
        }
      }
    } catch (error) {
      console.error('Failed to emit real-time update:', error)
    }

    return NextResponse.json({ success: true, data: project })
  } catch (error: any) {
    console.error('Error updating project:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في تحديث المشروع' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Check if MongoDB is available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { success: false, error: 'قاعدة البيانات غير متاحة' },
        { status: 503 }
      )
    }

    const { projectModel } = await import('@/lib/models')
    const success = await projectModel.delete(id)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'المشروع غير موجود' },
        { status: 404 }
      )
    }

    // Emit real-time update
    try {
      // @ts-ignore - Next.js specific
      const io = request.socket?.server?.io
      if (io) {
        io.emit('data-changed', {
          type: 'delete',
          entity: 'project',
          entityId: id,
          data: null,
          userId: 'system',
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Failed to emit real-time update:', error)
    }

    return NextResponse.json({ success: true, message: 'تم حذف المشروع بنجاح' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في حذف المشروع' },
      { status: 500 }
    )
  }
} 