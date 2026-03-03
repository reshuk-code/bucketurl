// app/api/analytics/campaign/route.js
// Returns aggregated performance for all links sharing the same utmCampaign value
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

async function getUidFromRequest(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    try {
        const token = authHeader.split('Bearer ')[1];
        const decoded = await adminAuth.verifyIdToken(token);
        return decoded.uid;
    } catch { return null; }
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bucketurl.onrender.com';

export async function GET(request) {
    try {
        const uid = await getUidFromRequest(request);
        if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const campaign = searchParams.get('campaign');
        if (!campaign) return NextResponse.json({ error: 'campaign param required' }, { status: 400 });

        // Get all user links with this campaign tag
        const snapshot = await adminDb
            .collection('links')
            .where('userId', '==', uid)
            .where('utmCampaign', '==', campaign)
            .get();

        const links = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(l => !l.deleted);

        if (links.length === 0) return NextResponse.json({ links: [], total: 0 });

        // Return each link with its click count so the UI can render a comparison table
        const result = links
            .map(l => ({
                id: l.id,
                title: l.title || 'Untitled',
                shortCode: l.shortCode,
                shortUrl: `${APP_URL}/${l.shortCode}`,
                utmSource: l.utmSource || '',
                utmMedium: l.utmMedium || '',
                utmCampaign: l.utmCampaign || '',
                totalClicks: l.totalClicks || 0,
                createdAt: l.createdAt,
            }))
            .sort((a, b) => b.totalClicks - a.totalClicks);

        const total = result.reduce((s, l) => s + l.totalClicks, 0);

        return NextResponse.json({ links: result, total });
    } catch (error) {
        console.error('GET /api/analytics/campaign error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
