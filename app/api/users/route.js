// app/api/users/route.js
import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { uid, email, displayName, photoURL } = await request.json();
        if (!uid || !email) return NextResponse.json({ error: 'Missing uid or email' }, { status: 400 });

        const userRef = adminDb.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            await userRef.set({
                uid,
                email,
                displayName: displayName || email.split('@')[0],
                photoURL: photoURL || null,
                plan: 'free',
                stripeCustomerId: null,
                stripeSubscriptionId: null,
                createdAt: new Date().toISOString(),
            });
        } else if (photoURL || displayName) {
            // Update profile info if changed
            await userRef.update({
                ...(displayName && { displayName }),
                ...(photoURL && { photoURL }),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const uid = request.headers.get('x-user-id');
        if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userDoc = await adminDb.collection('users').doc(uid).get();
        if (!userDoc.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({ user: userDoc.data() });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
