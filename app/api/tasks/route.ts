export const dynamic = "force-static"

import { NextRequest, NextResponse } from 'next/server'
import { TaskCreateSchema } from '@/lib/schemas'

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
    const priority = searchParams.get('priority')
    const projectId = searchParams.get('projectId')
    const assignedTo = searchParams.get('assignedTo')
    
    const { taskModel } = await import('@/lib/models')
    let tasks
    if (query) {
      tasks = await taskModel.search(query)
    } else if (status) {
      tasks = await taskModel.findByStatus(status)
    } else if (priority) {
      tasks = await taskModel.findByPriority(priority)
    } else if (projectId) {
      tasks = await taskModel.findByProject(projectId)
    } else if (assignedTo) {
      tasks = await taskModel.findByAssignedTo(assignedTo)
    } else {
      tasks = await taskModel.findAll()
    }
    
    return NextResponse.json({ success: true, data: tasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المهام' },
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
    const validatedData = TaskCreateSchema.parse(body)
    
    const { taskModel } = await import('@/lib/models')
    // Create task
    const task = await taskModel.create(validatedData)

    // Emit real-time update
    try {
      // @ts-ignore - Next.js specific
      const io = request.socket?.server?.io
      if (io) {
        io.emit('data-changed', {
          type: 'create',
          entity: 'task',
          entityId: task._id,
          data: task,
          userId: 'system',
          timestamp: new Date()
        })

        // Send notification to assigned user
        if (task.assignedTo) {
          io.emit('new-notification', {
            id: Math.random().toString(36).substr(2, 9),
            type: 'info',
            title: 'مهمة جديدة',
            message: `تم تعيين مهمة جديدة لك: ${task.title}`,
            timestamp: new Date(),
            targetUserId: task.assignedTo
          })
        }

        // Send notification to project manager if task is part of a project
        if (task.projectId) {
          io.emit('new-notification', {
            id: Math.random().toString(36).substr(2, 9),
            type: 'info',
            title: 'مهمة جديدة في المشروع',
            message: `تم إضافة مهمة جديدة للمشروع: ${task.title}`,
            timestamp: new Date(),
            targetUserId: 'all'
          })
        }
      }
    } catch (error) {
      console.error('Failed to emit real-time update:', error)
    }
    
    return NextResponse.json({ success: true, data: task }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating task:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء المهمة' },
      { status: 500 }
    )
  }
} 