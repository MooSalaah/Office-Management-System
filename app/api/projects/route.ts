export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { ProjectCreateSchema } from '@/lib/schemas'
import { projectModel } from '@/lib/models'

import { checkMongoDb } from '@/lib/api-utils'

import { NextRequest, NextResponse } from 'next/server'
import { ProjectCreateSchema } from '@/lib/schemas'
import { projectModel } from '@/lib/models'
import { checkMongoDb, handleError } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const dbCheck = checkMongoDb()
  if (dbCheck) return dbCheck

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const status = searchParams.get('status')
    
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
    const validatedData = ProjectCreateSchema.parse(body)

    const dataWithUser = { ...validatedData, createdBy: userId }
    
            // Create project
    const project = await projectModel.create(dataWithUser)

    // Emit real-time update and send notifications
    try {
      const io = (request as any).socket?.server?.io
      if (io) {
        io.emit('data-changed', {
          type: 'create',
          entity: 'project',
          entityId: project._id,
          data: project,
          userId: userId,
          timestamp: new Date()
        })

        // Send notification to all users about new project
        io.emit('new-notification', {
          id: Math.random().toString(36).substr(2, 9),
          type: 'info',
          title: 'مشروع جديد',
          message: `تم إنشاء مشروع جديد: ${project.title}`,
          timestamp: new Date(),
          targetUserId: 'all'
        })

        // Send specific notification to assigned engineers
        if (project.assignedTo && project.assignedTo.length > 0) {
          project.assignedTo.forEach(userId => {
            io.emit('new-notification', {
              id: Math.random().toString(36).substr(2, 9),
              type: 'info',
              title: 'تم تعيينك في مشروع',
              message: `تم تعيينك في مشروع جديد: ${project.title}`,
              timestamp: new Date(),
              targetUserId: userId
            })
          })
        }
      }
    } catch (error) {
      console.error('Failed to emit real-time update:', error)
    }

    return NextResponse.json({ success: true, data: project }, { status: 201 })
  } catch (error: any) {
    return handleError(error)
  }
} 