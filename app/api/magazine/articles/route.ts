import { NextResponse } from 'next/server'

const FLASK_API = process.env.FLASK_API_URL || 'http://localhost:8000'

export async function GET() {
  try {
    const response = await fetch(`${FLASK_API}/api/magazine/articles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ 
      status: 'error',
      message: error.message || 'An unexpected error occurred' 
    }, { status: 500 })
  }
} 