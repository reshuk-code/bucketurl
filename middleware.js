// middleware.js - Protect dashboard routes + security headers
import { NextResponse } from 'next/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bucketurl.onrender.com';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check for Firebase auth session cookie
    const session = request.cookies.get('__session')?.value;

    // Protected routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/links') || pathname.startsWith('/teams') || pathname.startsWith('/settings') || pathname.startsWith('/billing')) {
        if (!session) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Redirect logged-in users away from auth pages
    if ((pathname === '/login' || pathname === '/signup') && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const response = NextResponse.next();

    // ── Security headers ──────────────────────────────────────────────────
    // Prevent "open in app" prompts and ensure OG images load correctly
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // For slug pages: allow images from our domain + cloudinary + flagcdn
    // This prevents browsers from blocking OG image loads
    if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/api')) {
        response.headers.set(
            'Content-Security-Policy',
            [
                `default-src 'self' ${APP_URL}`,
                `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
                `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
                `font-src 'self' https://fonts.gstatic.com`,
                `img-src 'self' data: blob: https: ${APP_URL}`,
                `connect-src 'self' https: wss:`,
                `frame-ancestors 'none'`,
            ].join('; ')
        );
    }

    return response;
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/links/:path*',
        '/teams/:path*',
        '/settings/:path*',
        '/billing/:path*',
        '/login',
        '/signup',
        // Match short link slug pages (single path segment, not a known route)
        '/((?!_next/static|_next/image|favicon.ico|logo.png|og-default.png|robots.txt|sitemap.xml|api/).*)',
    ],
};
