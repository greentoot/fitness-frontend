import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CREDENTIAL = {
  username: process.env.BASIC_AUTH_USER || 'admin',
  password: process.env.BASIC_AUTH_PASSWORD || 'fitnesschallenge2024'
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return new NextResponse(null, { status: 401 })
  }

  try {
    const authValue = authHeader.split(' ')[1]
    const [username, password] = atob(authValue).split(':')

    if (username === CREDENTIAL.username && password === CREDENTIAL.password) {
      return new NextResponse(null, { 
        status: 200,
        headers: {
          'Set-Cookie': `auth=${authValue}; Path=/; HttpOnly; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
        }
      })
    }
  } catch (error) {
    console.error('Auth verification error:', error)
  }

  return new NextResponse(null, { status: 401 })
} 