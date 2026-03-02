// app/api/auth/session/route.js
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { token } = await request.json();
    const cookieStore = await cookies();
    cookieStore.set('__session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
    return NextResponse.json({ success: true });
}

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete('__session');
    return NextResponse.json({ success: true });
}
