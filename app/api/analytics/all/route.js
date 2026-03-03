// app/api/analytics/all/route.js
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { subDays, format, startOfDay } from 'date-fns';

export async function GET(req) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '15', 10);
        const tzOffset = parseInt(searchParams.get('tzOffset') || '0', 10); // minutes from getTimezoneOffset

        // Compute range in local time, then convert to UTC for querying Firestore
        const nowLocal = new Date(Date.now() - tzOffset * 60_000);
        const localStart = subDays(startOfDay(nowLocal), days - 1);
        const rangeStartUtc = new Date(localStart.getTime() + tzOffset * 60_000);

        let clicks = [];
        let indexRequired = false;

        // Primary query: by userId (preferred, matches real click data)
        try {
            const clicksSnapshot = await adminDb
                .collection('clicks')
                .where('userId', '==', userId)
                .where('timestamp', '>=', rangeStartUtc.toISOString())
                .get();
            clicks = clicksSnapshot.docs.map((doc) => doc.data());
        } catch (e) {
            console.error('UserId query failed (likely missing index):', e.message);
            if (String(e.message || '').toLowerCase().includes('index')) {
                indexRequired = true;
            }
        }

        // Fallback path for older records without userId on clicks
        if (clicks.length === 0 && !indexRequired) {
            const linksSnapshot = await adminDb
                .collection('links')
                .where('userId', '==', userId)
                .limit(30)
                .get();

            if (!linksSnapshot.empty) {
                try {
                    const linkIds = linksSnapshot.docs.map((doc) => doc.id);
                    const legacySnapshot = await adminDb
                        .collection('clicks')
                        .where('linkId', 'in', linkIds)
                        .where('timestamp', '>=', rangeStartUtc.toISOString())
                        .get();
                    clicks = legacySnapshot.docs.map((doc) => doc.data());
                } catch (e) {
                    console.error('Fallback linkId query failed (likely missing index):', e.message);
                    if (String(e.message || '').toLowerCase().includes('index')) {
                        indexRequired = true;
                    }
                }
            }
        }

        // Aggregate into per-day map for multi-day views
        const byDay = {};

        for (const click of clicks) {
            if (!click.timestamp) continue;
            const tsUtc = new Date(click.timestamp);
            if (Number.isNaN(tsUtc.getTime())) continue;

            // Convert to user's local time for bucketing
            const tsLocal = new Date(tsUtc.getTime() - tzOffset * 60_000);

            // Day key in local ISO (YYYY-MM-DD) for stable bucket
            const dayKey = tsLocal.toISOString().substring(0, 10);
            byDay[dayKey] = (byDay[dayKey] || 0) + 1;
        }

        const chartData = [];

        if (days === 1) {
            // Live: rolling 24-hour window in user local time
            const endBaseLocal = new Date(nowLocal);
            endBaseLocal.setMinutes(0, 0, 0);

            for (let i = 23; i >= 0; i--) {
                const bucketEndLocal = new Date(endBaseLocal.getTime() - i * 60 * 60 * 1000);
                const bucketStartLocal = new Date(bucketEndLocal.getTime() - 60 * 60 * 1000);
                const bucketStartUtc = new Date(bucketStartLocal.getTime() + tzOffset * 60_000);
                const bucketEndUtc = new Date(bucketEndLocal.getTime() + tzOffset * 60_000);

                const count = clicks.filter((c) => {
                    if (!c.timestamp) return false;
                    const ts = new Date(c.timestamp);
                    return ts >= bucketStartUtc && ts < bucketEndUtc;
                }).length;

                chartData.push({
                    date: bucketEndLocal.toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                    }),
                    clicks: count,
                });
            }
        } else {
            // Multi-day view: strictly one point per day, never cumulative
            for (let i = days - 1; i >= 0; i--) {
                const dLocal = subDays(nowLocal, i);
                const dayKey = dLocal.toISOString().substring(0, 10);
                chartData.push({
                    date: format(dLocal, 'MMM d'),
                    clicks: byDay[dayKey] || 0,
                });
            }
        }

        return NextResponse.json({ chartData, indexRequired });
    } catch (error) {
        console.error('Analytics Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
