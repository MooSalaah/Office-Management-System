import { NextRequest, NextResponse } from 'next/server'
import { AttendanceCreateSchema } from '@/lib/schemas'

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
    const userId = searchParams.get('userId')
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    
            const { attendanceModel } = await import('@/lib/models')
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
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب سجلات الحضور' },
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
    const validatedData = AttendanceCreateSchema.parse(body)
    
            const { attendanceModel } = await import('@/lib/models')
        // Create attendance record
        const attendance = await attendanceModel.createAttendance(validatedData)
    
    return NextResponse.json({ success: true, data: attendance }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating attendance record:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء سجل الحضور' },
      { status: 500 }
    )
  }
} 