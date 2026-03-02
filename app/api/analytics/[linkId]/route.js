// app/api/analytics/[linkId]/route.js
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

async function getUidFromRequest(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    try {
        const token = authHeader.split('Bearer ')[1];
        const decoded = await adminAuth.verifyIdToken(token);
        return decoded.uid;
    } catch {
        return null;
    }
}

export async function GET(request, { params }) {
    const { linkId } = await params;
    try {
        const uid = await getUidFromRequest(request);
        if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify link ownership
        const linkDoc = await adminDb.collection('links').doc(linkId).get();
        if (!linkDoc.exists || linkDoc.data().userId !== uid) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const clicksSnapshot = await adminDb.collection('clicks')
            .where('linkId', '==', linkId)
            .get();

        let clicks = clicksSnapshot.docs.map(d => d.data());

        // Filter and sort in memory
        clicks = clicks.filter(c => c.timestamp && new Date(c.timestamp) >= startDate);
        clicks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        clicks = clicks.slice(0, 10000);

        // Aggregate by day
        const byDay = {};
        const byCountry = {};
        const byDevice = {};
        const byBrowser = {};
        const byReferrer = {};

        for (const click of clicks) {
            const day = click.timestamp?.substring(0, 10);
            if (day) byDay[day] = (byDay[day] || 0) + 1;

            const country = click.country || 'Unknown';
            byCountry[country] = (byCountry[country] || 0) + 1;

            const device = click.device || 'Unknown';
            byDevice[device] = (byDevice[device] || 0) + 1;

            const browser = click.browser || 'Unknown';
            byBrowser[browser] = (byBrowser[browser] || 0) + 1;

            const referrer = click.referrer || 'Direct';
            byReferrer[referrer] = (byReferrer[referrer] || 0) + 1;
        }

        // Build day-by-day array for the full range
        const dailyData = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().substring(0, 10);
            dailyData.push({ date: key, clicks: byDay[key] || 0 });
        }

        const topCountries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([country, count]) => ({ country, count }));
        const deviceBreakdown = Object.entries(byDevice).map(([name, value]) => ({ name, value }));
        const browserBreakdown = Object.entries(byBrowser).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
        const topReferrers = Object.entries(byReferrer).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([referrer, count]) => ({ referrer, count }));

        return NextResponse.json({
            totalClicks: clicks.length,
            dailyData,
            topCountries,
            deviceBreakdown,
            browserBreakdown,
            topReferrers,
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
