// app/api/stripe/webhook/route.js
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    let event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature error:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const getPlanFromPriceId = (priceId) => {
        const proPrices = [process.env.STRIPE_PRO_MONTHLY_PRICE_ID, process.env.STRIPE_PRO_YEARLY_PRICE_ID];
        const teamPrices = [process.env.STRIPE_TEAM_MONTHLY_PRICE_ID, process.env.STRIPE_TEAM_YEARLY_PRICE_ID];
        if (proPrices.includes(priceId)) return 'pro';
        if (teamPrices.includes(priceId)) return 'team';
        return 'free';
    };

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const uid = session.metadata?.uid;
                const subscriptionId = session.subscription;

                if (uid && subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const priceId = subscription.items.data[0]?.price?.id;
                    const plan = getPlanFromPriceId(priceId);

                    await adminDb.collection('users').doc(uid).update({
                        plan,
                        stripeSubscriptionId: subscriptionId,
                        stripeCustomerId: session.customer,
                    });
                }
                break;
            }

            case 'customer.subscription.updated': {
                const sub = event.data.object;
                const priceId = sub.items.data[0]?.price?.id;
                const plan = getPlanFromPriceId(priceId);
                const uid = sub.metadata?.uid;

                if (uid) {
                    await adminDb.collection('users').doc(uid).update({
                        plan: sub.status === 'active' ? plan : 'free',
                        stripeSubscriptionId: sub.id,
                    });
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object;
                const uid = sub.metadata?.uid;
                if (uid) {
                    await adminDb.collection('users').doc(uid).update({
                        plan: 'free',
                        stripeSubscriptionId: null,
                    });
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

export const runtime = 'nodejs';
