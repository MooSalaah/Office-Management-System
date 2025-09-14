import { NextRequest, NextResponse } from 'next/server'
import { ClientCreateSchema } from '@/lib/schemas'
import { clientModel } from '@/lib/models'
import { checkMongoDb, handleError } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const dbCheck = checkMongoDb()
  if (dbCheck) return dbCheck

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
        let clients
        if (query) {
          clients = await clientModel.search(query)
        } else {
          clients = await clientModel.findAll()
        }
    
    return NextResponse.json({ success: true, data: clients })
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
    const validatedData = ClientCreateSchema.parse(body)

    const dataWithUser = { ...validatedData, createdBy: userId }
    
        // Create client
        const client = await clientModel.create(dataWithUser)
    
    return NextResponse.json({ success: true, data: client }, { status: 201 })
  } catch (error: any) {
    return handleError(error)
  }
} 