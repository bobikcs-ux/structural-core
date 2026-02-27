/**
 * BOBIKCS SRI PROTOCOL v3.0 - Hybrid Enforcement Middleware
 * 
 * PUBLIC ROUTES (no auth): /pulse, /scanner, /integrity, /api/v1/pulse, /api/v1/keys
 * PRIVATE ROUTES (auth required): /scenario, /analytics, /reports, /api/v1/private/*
 * 
 * KILL-SWITCH: If cookie 'bobikcs_system_state' === 'UNTRUSTED' -> block all private routes
 */

import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

// ============================================================================
// Route Definitions
// ============================================================================

const PUBLIC_ROUTES = [
  "/",
  "/pulse",
  "/scanner", 
  "/integrity",
  "/intelligence",
  "/simulations",
  "/reports",        // Public reports access
  "/console",        // Admin console (for manual triggers)
  "/access",
  "/api/v1/pulse",
  "/api/v1/keys",
  "/api/v1/snapshot",
  "/api/v1/snapshots",
]

const PRIVATE_ROUTES = [
  "/scenario",
  "/analytics",
  "/api/v1/private",
]

// Static assets and Next.js internals
const IGNORED_PATHS = [
  "/_next",
  "/favicon.ico",
  "/static",
  "/images",
]

// ============================================================================
// Helpers
// ============================================================================

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

function isIgnoredPath(pathname: string): boolean {
  return IGNORED_PATHS.some(path => pathname.startsWith(path))
}

// ============================================================================
// Middleware
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip static assets and Next.js internals
  if (isIgnoredPath(pathname)) {
    return NextResponse.next()
  }
  
  // Allow public routes without any checks
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // KILL-SWITCH: Check for UNTRUSTED state
  // ══════════════════════════════════════════════════════════════════════════
  
  const systemState = request.cookies.get("bobikcs_system_state")?.value
  
  if (systemState === "UNTRUSTED") {
    // API routes get JSON response
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { 
          error: "PRIVATE ACCESS SUSPENDED — CORE UNTRUSTED",
          code: "SYSTEM_UNTRUSTED"
        },
        { status: 403 }
      )
    }
    
    // Page routes get redirected to integrity page
    const integrityUrl = new URL("/integrity", request.url)
    integrityUrl.searchParams.set("reason", "untrusted")
    return NextResponse.redirect(integrityUrl)
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // AUTH CHECK: Validate Supabase session for private routes
  // ══════════════════════════════════════════════════════════════════════════
  
  if (isPrivateRoute(pathname)) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    
    // Refresh session
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      // API routes get JSON 401
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { 
            error: "UNAUTHORIZED",
            code: "AUTH_REQUIRED"
          },
          { status: 401 }
        )
      }
      
      // Page routes get redirected to login
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    return response
  }
  
  // Default: allow request
  return NextResponse.next()
}

// ============================================================================
// Matcher Config
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
