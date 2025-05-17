import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Cache public paths for faster matching
const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/api/auth"
])

// Cache static file extensions
const STATIC_FILE_EXTENSIONS = new Set([
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot'
])

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Skip middleware for static files
  if (STATIC_FILE_EXTENSIONS.has(path.slice(path.lastIndexOf('.')))) {
    return NextResponse.next()
  }
  
  // Check if path is public using Set for O(1) lookup
  // Allow API paths that don't need auth
  const isApiPath = path.startsWith("/api/")
  const isPublicApi = isApiPath && (
    path.startsWith("/api/auth") || 
    path.startsWith("/api/users/")
  )
  
  // Consider username donation pages as public (paths that are just /username)
  const isUsernamePage = /^\/[a-zA-Z0-9_-]+$/.test(path)
  
  const isPublicPath = PUBLIC_PATHS.has(path) || isPublicApi || isUsernamePage
  
  // Get the session token with caching
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  // Redirect to login if accessing protected route without authentication
  if (!isPublicPath && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(url)
  }
  
  // Redirect to login success page if accessing login while already authenticated
  if (path === "/login" && token) {
    return NextResponse.redirect(new URL("/setup/start", request.url))
  }
  
  // Add security headers
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.coinbase.com https://*.onchainkit.com ${process.env.NEXTAUTH_URL || ''};`
  )
  
  // Add caching headers for static assets
  if (STATIC_FILE_EXTENSIONS.has(path.slice(path.lastIndexOf('.')))) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    )
  }
  
  return response
}

// Specify paths that middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}