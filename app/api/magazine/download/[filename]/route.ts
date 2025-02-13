import { NextResponse } from 'next/server'

const FLASK_API = process.env.FLASK_API_URL || 'http://localhost:8000'

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const response = await fetch(`${FLASK_API}/api/magazine/download/${params.filename}`, {
      method: 'GET'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const blob = await response.blob()
    return new Response(blob, {
      headers: {
        'Content-Type': 'application/rtf',
        'Content-Disposition': `attachment; filename="${params.filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Error downloading file:', error)
    return NextResponse.json({ 
      status: 'error',
      message: error.message || 'An unexpected error occurred' 
    }, { status: 500 })
  }
} 