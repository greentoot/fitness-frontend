import { NextResponse } from 'next/server'

const FLASK_API = process.env.FLASK_API_URL || 'http://localhost:8000'

export async function POST(request: Request) {
  try {
    const response = await fetch(`${FLASK_API}/api/magazine/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Server error response: ${errorText}`)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    const data = await response.json()
    
    if (data.status === 'error') {
      return NextResponse.json(data, { status: 400 })
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in generate handler:', error)
    return NextResponse.json({ 
      status: 'error',
      message: error.message || 'An unexpected error occurred' 
    }, { status: 500 })
  }
} 