// app/api/stripe/portal/route.js
import Stripe from 'stripe';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.split('Bearer ')[1];
        const decoded = await adminAuth.verifyIdToken(token);
        const uid = decoded.uid;

        const userDoc = await adminDb.collection('users').doc(uid).get();
        const customerId = userDoc.data()?.stripeCustomerId;
        if (!customerId) return NextResponse.json({ error: 'No subscription found' }, { status: 404 });

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
