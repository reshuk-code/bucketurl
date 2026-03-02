// app/api/clicks/route.js - Track click events
import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { linkId, shortCode, referrer } = body;

        if (!linkId) return NextResponse.json({ error: 'Missing linkId' }, { status: 400 });

        // Parse user agent
        const ua = request.headers.get('user-agent') || '';
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Simple UA parsing without external dep (server-side)
        let device = 'Desktop';
        let browser = 'Other';
        let os = 'Other';

        if (/mobile/i.test(ua)) device = 'Mobile';
        else if (/tablet|ipad/i.test(ua)) device = 'Tablet';

        if (/chrome/i.test(ua) && !/edge|edg/i.test(ua)) browser = 'Chrome';
        else if (/firefox/i.test(ua)) browser = 'Firefox';
        else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
        else if (/edge|edg/i.test(ua)) browser = 'Edge';
        else if (/opera|opr/i.test(ua)) browser = 'Opera';

        if (/windows/i.test(ua)) os = 'Windows';
        else if (/mac/i.test(ua)) os = 'macOS';
        else if (/android/i.test(ua)) os = 'Android';
        else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS';
        else if (/linux/i.test(ua)) os = 'Linux';

        const clickData = {
            linkId,
            shortCode,
            timestamp: new Date().toISOString(),
            ip,
            country: 'Unknown', // Would use MaxMind or IP-API in production
            city: 'Unknown',
            device,
            browser,
            os,
            referrer: referrer || 'Direct',
        };

        // Save click
        await adminDb.collection('clicks').add(clickData);

        // Increment counter on link document
        const linkRef = adminDb.collection('links').doc(linkId);
        await adminDb.runTransaction(async (tx) => {
            const doc = await tx.get(linkRef);
            if (doc.exists) {
                tx.update(linkRef, { totalClicks: (doc.data().totalClicks || 0) + 1 });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Click tracking error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
