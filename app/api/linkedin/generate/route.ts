import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()

    if (!topic) {
      return NextResponse.json({
        status: "error",
        message: "No topic provided"
      }, { status: 400 })
    }

    // Call the Flask API
    const response = await fetch('http://localhost:8002/api/linkedin/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    })

    const data = await response.json()
    console.log('Flask API Response:', data)  // Debug log

    // Check for error status in the response
    if (data.status === 'error') {
      console.error('Flask API Error:', data.message)  // Debug log
      return NextResponse.json({
        status: 'error',
        message: data.message || 'Failed to generate content'
      }, { status: 500 })
    }

    // Validate the response structure
    if (!data.data?.content) {
      console.error('Invalid content structure:', data.data)  // Debug log
      return NextResponse.json({
        status: 'error',
        message: 'Invalid content structure received from server'
      }, { status: 500 })
    }

    // Return the successful response with content
    return NextResponse.json({
      status: 'success',
      data: {
        content: data.data.content,
        filename: data.data.filename
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
} 