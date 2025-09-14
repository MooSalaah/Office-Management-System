import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_ROUTES = ['/api/health', '/api/debug', '/api/auth/login', '/api/test-config']

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    return null
  }
}

export async function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', 
      process.env.NODE_ENV === 'production' 
        ? process.env.CORS_ORIGIN || 'https://newcornersa.netlify.app'
        : 'http://localhost:3000'
    )
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Max-Age', '86400')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 200,
        headers: response.headers
      })
    }

    // Check if the route is public
    if (PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
      return response
    }

    // Verify JWT token
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Authorization token not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const payload = await verifyToken(token)

    if (!payload) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Add user ID to the request headers
    response.headers.set('X-User-Id', payload.userId as string)
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
} 