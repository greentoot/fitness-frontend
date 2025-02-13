import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  // Clear the auth cookie
  const response = new NextResponse(null, {
    status: 200,
    headers: {
      'Set-Cookie': `auth=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
    }
  })

  return response
} 