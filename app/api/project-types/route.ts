export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { ProjectTypeDefinitionCreateSchema } from '@/lib/schemas'
import { projectTypeDefinitionModel } from '@/lib/models'

import { checkMongoDb } from '@/lib/api-utils'

import { NextRequest, NextResponse } from 'next/server'
import { ProjectTypeDefinitionCreateSchema } from '@/lib/schemas'
import { projectTypeDefinitionModel } from '@/lib/models'
import { checkMongoDb, handleError } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const dbCheck = checkMongoDb()
  if (dbCheck) return dbCheck

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const active = searchParams.get('active')

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
    const validatedData = ProjectTypeDefinitionCreateSchema.parse(body)

    const dataWithUser = { ...validatedData, createdBy: userId }

    // Create project type
    const type = await projectTypeDefinitionModel.create(dataWithUser)

    // Emit real-time update
    try {
      const io = (request as any).socket?.server?.io
      if (io) {
        io.emit('data-changed', {
          type: 'create',
          entity: 'project-type',
          entityId: type._id,
          data: type,
          userId: userId,
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Failed to emit real-time update:', error)
    }

    return NextResponse.json({ success: true, data: type }, { status: 201 }) 