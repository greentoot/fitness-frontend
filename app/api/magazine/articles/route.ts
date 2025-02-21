import { NextResponse } from 'next/server'

const FLASK_API = 'http://localhost:8000'  // Flask backend URL

export async function GET() {
  try {
    console.log('Fetching articles from Flask backend...')
    const response = await fetch(`${FLASK_API}/api/magazine/articles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'  // Disable caching to get fresh results
    })

    if (!response.ok) {
      console.error('Flask API error:', response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Received articles data:', data)  // Debug log
    
    if (data.status === 'success' && data.data && data.data.articles) {
      return NextResponse.json(data)
    } else {
      console.error('Unexpected data format:', data)
      throw new Error('Invalid data format received from server')
    }
  } catch (error: any) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ 
      status: 'error',
      message: error.message || 'An unexpected error occurred',
      data: {
        articles: {},
        total: 0
      }
    })
  }
} 