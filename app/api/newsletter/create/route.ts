import { NextResponse } from 'next/server'

const FLASK_API = process.env.FLASK_API_URL || 'http://localhost:8001'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const response = await fetch(`${FLASK_API}/api/newsletter/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Server error:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in create handler:', error)
    return NextResponse.json({ 
      status: 'error',
      message: error.message || 'An unexpected error occurred' 
    }, { status: 500 })
  }
} 