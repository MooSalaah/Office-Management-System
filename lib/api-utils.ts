import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function checkMongoDb() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      { success: false, error: 'قاعدة البيانات غير متاحة' },
      { status: 503 }
    )
  }
  return null
}

export function handleError(error: any): NextResponse {
  console.error('API Error:', error)

  if (error instanceof ZodError) {
    return NextResponse.json(
      { success: false, error: 'بيانات غير صحيحة', details: error.errors },
      { status: 400 }
    )
  }

  if (error.message === 'User ID not found in token') {
    return NextResponse.json(
      { success: false, error: 'User ID not found in token' },
      { status: 401 }
    )
  }

  return NextResponse.json(
    { success: false, error: 'فشل في معالجة الطلب' },
    { status: 500 }
  )
}
