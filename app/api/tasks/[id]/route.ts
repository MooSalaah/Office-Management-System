import { NextRequest, NextResponse } from 'next/server'
import { TaskUpdateSchema } from '@/lib/schemas'

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

    const { taskModel } = await import('@/lib/models')
    const task = await taskModel.findById(id)

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'المهمة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المهمة' },
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
    const validatedData = TaskUpdateSchema.parse(body)

    const { taskModel } = await import('@/lib/models')
    // Update task
    const task = await taskModel.update(id, validatedData)

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'المهمة غير موجودة' },
        { status: 404 }
      )
    }

    // Emit real-time update
    try {
      // @ts-ignore - Next.js specific
      const io = request.socket?.server?.io
      if (io) {
        io.emit('data-changed', {
          type: 'update',
          entity: 'task',
          entityId: task._id,
          data: task,
          userId: 'system',
          timestamp: new Date()
        })

        // Send notification if task status changed
        if (validatedData.status) {
          const statusText = validatedData.status === 'completed' ? 'مكتملة' : 
                           validatedData.status === 'in-progress' ? 'قيد التنفيذ' : 
                           validatedData.status === 'new' ? 'جديدة' : 
                           validatedData.status === 'on-hold' ? 'معلقة' : 'ملغية'
          
          io.emit('new-notification', {
            id: Math.random().toString(36).substr(2, 9),
            type: validatedData.status === 'completed' ? 'success' : 'info',
            title: 'تحديث حالة المهمة',
            message: `تم تحديث حالة المهمة: ${task.title} إلى ${statusText}`,
            timestamp: new Date(),
            targetUserId: task.assignedTo?.[0] || 'all'
          })

          // Send notification to project manager if task was completed
          if (validatedData.status === 'completed' && task.projectId) {
            io.emit('new-notification', {
              id: Math.random().toString(36).substr(2, 9),
              type: 'success',
              title: 'مهمة مكتملة',
              message: `تم إكمال مهمة في المشروع: ${task.title}`,
              timestamp: new Date(),
              targetUserId: 'all'
            })
          }
        }
      }
    } catch (error) {
      console.error('Failed to emit real-time update:', error)
    }

    return NextResponse.json({ success: true, data: task })
  } catch (error: any) {
    console.error('Error updating task:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'فشل في تحديث المهمة' },
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

    const { taskModel } = await import('@/lib/models')
    const success = await taskModel.delete(id)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'المهمة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'تم حذف المهمة بنجاح' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في حذف المهمة' },
      { status: 500 }
    )
  }
} 