// app/api/stripe/checkout/route.js
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

        const { priceId, plan } = await request.json();

        const userDoc = await adminDb.collection('users').doc(uid).get();
        const userData = userDoc.data();

        let customerId = userData?.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: userData.email,
                metadata: { uid },
            });
            customerId = customer.id;
            await adminDb.collection('users').doc(uid).update({ stripeCustomerId: customerId });
        }

        const origin = request.headers.get('origin') || `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`;

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${origin}/dashboard/billing?success=true`,
            cancel_url: `${origin}/dashboard/billing`,
            metadata: { uid, plan },
            subscription_data: { metadata: { uid, plan } },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
