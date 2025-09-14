export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { AttendanceCreateSchema } from '@/lib/schemas'
import { attendanceModel } from '@/lib/models'

import { checkMongoDb } from '@/lib/api-utils'

import { NextRequest, NextResponse } from 'next/server'
import { AttendanceCreateSchema } from '@/lib/schemas'
import { attendanceModel } from '@/lib/models'
import { checkMongoDb, handleError } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const dbCheck = checkMongoDb()
  if (dbCheck) return dbCheck

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    
        let attendance
        if (userId && date) {
          const dateObj = new Date(date)
          attendance = await attendanceModel.findAttendanceByUserAndDate(userId, dateObj)
          return NextResponse.json({ success: true, data: attendance ? [attendance] : [] })
        } else if (userId) {
          attendance = await attendanceModel.findAttendanceByUser(userId)
        } else if (date) {
          const dateObj = new Date(date)
          attendance = await attendanceModel.findAttendanceByDate(dateObj)
        } else if (status) {
          attendance = await attendanceModel.findAllAttendance({ status: status as any })
        } else {
          attendance = await attendanceModel.findAllAttendance()
        }
    
    return NextResponse.json({ success: true, data: attendance })
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
    const validatedData = AttendanceCreateSchema.parse(body)

    const dataWithUser = { ...validatedData, userId }
    
        // Create attendance record
        const attendance = await attendanceModel.createAttendance(dataWithUser)
    
    return NextResponse.json({ success: true, data: attendance }, { status: 201 })
  } catch (error: any) {
    return handleError(error)
  }
} 