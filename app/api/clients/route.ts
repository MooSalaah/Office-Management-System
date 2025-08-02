import { NextRequest, NextResponse } from 'next/server'
import { ClientCreateSchema } from '@/lib/schemas'

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
    
            const { clientModel } = await import('@/lib/models')
        let clients
        if (query) {
          clients = await clientModel.search(query)
        } else {
          clients = await clientModel.findAll()
        }
    
    return NextResponse.json({ success: true, data: clients })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب العملاء' },
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
    const validatedData = ClientCreateSchema.parse(body)
    
            const { clientModel } = await import('@/lib/models')
        // Create client
        const client = await clientModel.create(validatedData)
    
    return NextResponse.json({ success: true, data: client }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating client:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء العميل' },
      { status: 500 }
    )
  }
} 