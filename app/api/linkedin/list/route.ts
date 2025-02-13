import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Call the Flask API to get the list of posts
    const response = await fetch('http://localhost:8002/api/linkedin/list')
    const data = await response.json()

    if (data.status === 'error') {
      return NextResponse.json({ error: data.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 