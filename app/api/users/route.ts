export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { UserCreateSchema } from '@/lib/schemas'
import { userModel } from '@/lib/models'

import { checkMongoDb, handleError } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const dbCheck = checkMongoDb()
  if (dbCheck) return dbCheck

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    let users
    if (query) {
      users = await userModel.search(query)
    } else if (role) {
      users = await userModel.findByRole(role)
    } else if (status) {
      users = await userModel.findAll({ isActive: status === 'active' ? true : false })
    } else {
      users = await userModel.findAll()
    }

    return NextResponse.json({ success: true, data: users })
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
    const validatedData = UserCreateSchema.parse(body)

    const dataWithUser = { ...validatedData, createdBy: userId }

    // Create user
    const user = await userModel.create(dataWithUser)

    // Emit real-time update
    try {
      const io = (request as any).socket?.server?.io
      if (io) {
        io.emit('data-changed', {
          type: 'create',
          entity: 'user',
          entityId: user._id,
          data: user,
          userId: userId,
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Failed to emit real-time update:', error)
    }

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error: any) {
    return handleError(error)
  }
}