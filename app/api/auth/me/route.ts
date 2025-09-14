import { NextRequest, NextResponse } from 'next/server'
import { userModel } from '@/lib/models'
import { jwtVerify } from 'jose'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authorization token not found' },
        { status: 401 }
      )
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    const userId = payload.userId as string

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found in token payload' },
        { status: 401 }
      )
    }

    const user = await userModel.findById(userId)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove password before sending to client
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({ success: true, user: userWithoutPassword }, { status: 200 })
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user details' },
      { status: 500 }
    )
  }
}
