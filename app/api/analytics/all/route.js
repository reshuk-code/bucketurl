// app/api/analytics/all/route.js
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

export async function GET(req) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '15');

        // Fetch clicks for this user in the last X days
        const startDate = subDays(startOfDay(new Date()), days - 1);

        let clicks = [];
        let indexRequired = false;
        try {
            const clicksSnapshot = await adminDb.collection('clicks')
                .where('userId', '==', userId)
                .where('timestamp', '>=', startDate.toISOString())
                .get();
            clicks = clicksSnapshot.docs.map(doc => doc.data());
        } catch (e) {
            console.error('UserId Query Failed (Likely missing index):', e.message);
            if (e.message.toLowerCase().includes('index')) indexRequired = true;
        }

        // Fallback: If no clicks found by userId (likely old records),
        // we'll try fetching via linkIds for the first few links.
        if (clicks.length === 0 && !indexRequired) {
            console.log('Falling back to linkIds query for user:', userId);
            const linksSnapshot = await adminDb.collection('links')
                .where('userId', '==', userId)
                .limit(30)
                .get();

            if (!linksSnapshot.empty) {
                try {
                    const linkIds = linksSnapshot.docs.map(doc => doc.id);
                    const legacySnapshot = await adminDb.collection('clicks')
                        .where('linkId', 'in', linkIds)
                        .where('timestamp', '>=', startDate.toISOString())
                        .get();
                    clicks = legacySnapshot.docs.map(doc => doc.data());
                } catch (e) {
                    console.error('Fallback LinkId Query Failed (Likely missing index):', e.message);
                    if (e.message.toLowerCase().includes('index')) indexRequired = true;
                }
            }
        }

        // Aggregate data
        const data = [];
        if (days === 1) {
            // "Live" view: Last 24 hours
            for (let i = 23; i >= 0; i--) {
                const date = new Date();
                date.setHours(date.getHours() - i, 0, 0, 0);
                const hourEnd = new Date(date);
                hourEnd.setHours(hourEnd.getHours() + 1);

                const count = clicks.filter(c => {
                    const cDate = new Date(c.timestamp);
                    return cDate >= date && cDate < hourEnd;
                }).length;

                data.push({
                    date: date.toLocaleTimeString('en-US', { hour: 'numeric' }),
                    clicks: count
                });
            }
        } else {
            // Daily view: Last X days
            for (let i = days - 1; i >= 0; i--) {
                const date = subDays(new Date(), i);
                const dateStr = format(date, 'MMM d');
                const dayStart = startOfDay(date);
                const dayEnd = endOfDay(date);

                const count = clicks.filter(c => {
                    const cDate = new Date(c.timestamp);
                    return cDate >= dayStart && cDate <= dayEnd;
                }).length;

                data.push({ date: dateStr, clicks: count });
            }
        }

        return NextResponse.json({ chartData: data, indexRequired });

    } catch (error) {
        console.error('Analytics Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
