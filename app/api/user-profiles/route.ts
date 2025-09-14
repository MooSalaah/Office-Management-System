export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { UserProfileCreateSchema } from '@/lib/schemas'
import { userProfileModel } from '@/lib/models'

import { checkMongoDb } from '@/lib/api-utils'

import { NextRequest, NextResponse } from 'next/server'
import { UserProfileCreateSchema } from '@/lib/schemas'
import { userProfileModel } from '@/lib/models'
import { checkMongoDb, handleError } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const dbCheck = checkMongoDb()
  if (dbCheck) return dbCheck

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const role = searchParams.get('role')
    const department = searchParams.get('department')
    
        let profiles
        if (query) {
          profiles = await userProfileModel.searchUsers(query)
        } else if (role) {
          profiles = await userProfileModel.getUsersByRole(role)
        } else if (department) {
          profiles = await userProfileModel.getUsersByDepartment(department)
        } else {
          profiles = await userProfileModel.findAll()
        }
    
    return NextResponse.json({ success: true, data: profiles })
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
    const validatedData = UserProfileCreateSchema.parse(body)

    const dataWithUser = { ...validatedData, createdBy: userId }
    
        // Create user profile
        const profile = await userProfileModel.create(dataWithUser)
    
    return NextResponse.json({ success: true, data: profile }, { status: 201 })
  } catch (error: any) {
    return handleError(error)
  }
} 