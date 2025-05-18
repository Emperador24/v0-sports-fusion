import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Check if we're in a development/preview environment without proper DB setup
  const isDevWithoutDb = process.env.NODE_ENV !== "production" && !process.env.SINGLESTORE_HOST

  // In development without DB, allow all requests
  if (isDevWithoutDb) {
    // For dashboard routes in dev without DB, set a mock token cookie
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const response = NextResponse.next()
      // Only set the cookie if it doesn't exist
      if (!request.cookies.get("next-auth.session-token")) {
        response.cookies.set("next-auth.mock-token", "mock-token-for-development", {
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: "/",
        })
      }
      return response
    }
    return NextResponse.next()
  }

  // Normal authentication flow for production or dev with DB
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Paths that require authentication
  const authRequiredPaths = ["/dashboard"]

  // Check if the current path requires authentication
  const isAuthRequired = authRequiredPaths.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`),
  )

  // Redirect to login if authentication is required but user is not authenticated
  if (isAuthRequired && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if user is authenticated and trying to access login/register
  if (isAuthenticated && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
