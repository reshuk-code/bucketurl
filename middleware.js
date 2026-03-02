// middleware.js - Protect dashboard routes
import { NextResponse } from 'next/server';

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

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/links/:path*', '/teams/:path*', '/settings/:path*', '/billing/:path*', '/login', '/signup'],
};
