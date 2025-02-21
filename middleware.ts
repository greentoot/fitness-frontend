import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Configuration
const CREDENTIAL = {
  username: process.env.BASIC_AUTH_USER || 'admin',
  password: process.env.BASIC_AUTH_PASSWORD || 'fitnesschallenge2024'
}

export function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const PUBLIC_PATHS = ['/login']
  const isPublicPath = PUBLIC_PATHS.includes(request.nextUrl.pathname)

  // Get stored credentials
  const authCookie = request.cookies.get('auth')
  let isAuthenticated = false

  if (authCookie?.value) {
    try {
      const [username, password] = atob(authCookie.value).split(':')
      isAuthenticated = username === CREDENTIAL.username && password === CREDENTIAL.password
    } catch {
      isAuthenticated = false
    }
  }

  // If not authenticated and trying to access any path (including root '/'), redirect to login
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated and trying to access login page, redirect to home
  if (isAuthenticated && isPublicPath) {
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

// Configure middleware to run on all routes except static files and API
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. /favicon.ico, /images (other static files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
} 