import { NextResponse } from 'next/server'

const FLASK_API = process.env.FLASK_API_URL || 'http://localhost:8000'

export async function GET() {
  try {
    console.log('Fetching articles from:', `${FLASK_API}/api/magazine/articles`)
    const response = await fetch(`${FLASK_API}/api/magazine/articles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Server error:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Articles data received:', data)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in list articles handler:', error)
    return NextResponse.json({ 
      status: 'error',
      message: error.message || 'An unexpected error occurred' 
    }, { status: 500 })
  }
} 