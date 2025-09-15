export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { DefaultTaskCreateSchema } from '@/lib/schemas'
import { defaultTaskModel } from '@/lib/models'

import { checkMongoDb, handleError } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const dbCheck = checkMongoDb()
  if (dbCheck) return dbCheck

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const active = searchParams.get('active')

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
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  const dbCheck = checkMongoDb()
  if (dbCheck) return dbCheck

  try {
    const userId = request.headers.get('X-User-Id')
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found in token' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validatedData = DefaultTaskCreateSchema.parse(body)

    const dataWithUser = { ...validatedData, createdBy: userId }

    // Create default task
    const task = await defaultTaskModel.create(dataWithUser)

    // Emit real-time update
    try {
      const io = (request as any).socket?.server?.io
      if (io) {
        io.emit('data-changed', {
          type: 'create',
          entity: 'default-task',
          entityId: task._id,
          data: task,
          userId: userId,
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Failed to emit real-time update:', error)
    }

    return NextResponse.json({ success: true, data: task }, { status: 201 })
  } catch (error: any) {
    return handleError(error)
  }
} 