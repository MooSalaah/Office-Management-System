export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { TaskCreateSchema } from '@/lib/schemas'
import { taskModel } from '@/lib/models'

import { checkMongoDb } from '@/lib/api-utils'

import { NextRequest, NextResponse } from 'next/server'
import { TaskCreateSchema } from '@/lib/schemas'
import { taskModel } from '@/lib/models'
import { checkMongoDb, handleError } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const dbCheck = checkMongoDb()
  if (dbCheck) return dbCheck

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const projectId = searchParams.get('projectId')
    const assignedTo = searchParams.get('assignedTo')
    
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
    const validatedData = TaskCreateSchema.parse(body)

    const dataWithUser = { ...validatedData, createdBy: userId }
    
    // Create task
    const task = await taskModel.create(dataWithUser)

    // Emit real-time update
    try {
      const io = (request as any).socket?.server?.io
      if (io) {
        io.emit('data-changed', {
          type: 'create',
          entity: 'task',
          entityId: task._id,
          data: task,
          userId: userId,
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
    return handleError(error)
  }
} 