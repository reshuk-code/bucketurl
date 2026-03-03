// app/api/analytics/[linkId]/route.js
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// Map raw referrer URLs to clean human-readable source names
function parseReferrerSource(referrer) {
    if (!referrer || referrer === 'Direct' || referrer === '') return 'Direct';
    try {
        const url = new URL(referrer);
        const host = url.hostname.replace(/^www\./, '').toLowerCase();
        const knownSources = {
            't.co': 'Twitter / X',
            'x.com': 'Twitter / X',
            'twitter.com': 'Twitter / X',
            'facebook.com': 'Facebook',
            'fb.com': 'Facebook',
            'm.facebook.com': 'Facebook',
            'l.facebook.com': 'Facebook',
            'instagram.com': 'Instagram',
            'l.instagram.com': 'Instagram',
            'linkedin.com': 'LinkedIn',
            'lnkd.in': 'LinkedIn',
            'youtube.com': 'YouTube',
            'youtu.be': 'YouTube',
            'reddit.com': 'Reddit',
            'old.reddit.com': 'Reddit',
            'pinterest.com': 'Pinterest',
            'pin.it': 'Pinterest',
            'snapchat.com': 'Snapchat',
            'tiktok.com': 'TikTok',
            'whatsapp.com': 'WhatsApp',
            'wa.me': 'WhatsApp',
            'telegram.org': 'Telegram',
            't.me': 'Telegram',
            'discord.com': 'Discord',
            'google.com': 'Google',
            'google.co': 'Google',
            'bing.com': 'Bing',
            'yahoo.com': 'Yahoo',
            'duckduckgo.com': 'DuckDuckGo',
            'github.com': 'GitHub',
            'notion.so': 'Notion',
            'substack.com': 'Substack',
            'medium.com': 'Medium',
        };
        // Check for known partial matches
        for (const [domain, name] of Object.entries(knownSources)) {
            if (host === domain || host.endsWith(`.${domain}`)) return name;
        }
        // Check if Google search from any country TLD (google.co.uk, google.fr etc.)
        if (/google\.[a-z.]+/.test(host)) return 'Google';
        return host; // fallback: show hostname
    } catch {
        return 'Direct';
    }
}



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
        const days = parseInt(searchParams.get('days') || '30', 10);
        const tzOffset = parseInt(searchParams.get('tzOffset') || '0', 10); // minutes from getTimezoneOffset

        // Range in local time, convert to UTC for Firestore query
        const nowLocal = new Date(Date.now() - tzOffset * 60_000);
        const localStart = new Date(nowLocal);
        localStart.setDate(localStart.getDate() - days);
        localStart.setHours(0, 0, 0, 0);
        const startDateUtc = new Date(localStart.getTime() + tzOffset * 60_000);

        const clicksSnapshot = await adminDb.collection('clicks')
            .where('linkId', '==', linkId)
            .get();

        let clicks = clicksSnapshot.docs.map(d => d.data());

        // Filter and sort in memory
        clicks = clicks.filter(c => c.timestamp && new Date(c.timestamp) >= startDateUtc);
        clicks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        clicks = clicks.slice(0, 10000);

        // Aggregate by day
        const byDay = {};
        const byCountry = {};
        const byDevice = {};
        const byOS = {};
        const byBrowser = {};
        const byReferrer = {};

        for (const click of clicks) {
            const tsUtc = click.timestamp ? new Date(click.timestamp) : null;
            if (!tsUtc || Number.isNaN(tsUtc.getTime())) continue;
            const tsLocal = new Date(tsUtc.getTime() - tzOffset * 60_000);

            const day = tsLocal.toISOString().substring(0, 10);
            if (day) byDay[day] = (byDay[day] || 0) + 1;

            const country = click.country || 'Unknown';
            byCountry[country] = (byCountry[country] || 0) + 1;

            const device = click.device || 'Unknown';
            byDevice[device] = (byDevice[device] || 0) + 1;

            const os = click.os || 'Unknown';
            byOS[os] = (byOS[os] || 0) + 1;

            const browser = click.browser || 'Unknown';
            byBrowser[browser] = (byBrowser[browser] || 0) + 1;

            const referrerRaw = click.referrer || 'Direct';
            const source = parseReferrerSource(referrerRaw);
            byReferrer[source] = (byReferrer[source] || 0) + 1;
        }

        // Build day-by-day array for the full range
        const dailyData = [];
        for (let i = days - 1; i >= 0; i--) {
            const dLocal = new Date(nowLocal);
            dLocal.setDate(dLocal.getDate() - i);
            const key = dLocal.toISOString().substring(0, 10);
            dailyData.push({ date: key, clicks: byDay[key] || 0 });
        }

        const topCountries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([country, count]) => ({ country, count }));
        const deviceBreakdown = Object.entries(byDevice).map(([name, value]) => ({ name, value }));
        const osBreakdown = Object.entries(byOS).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
        const browserBreakdown = Object.entries(byBrowser).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
        const topReferrers = Object.entries(byReferrer).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([source, count]) => ({ source, count }));
        // Build rolling 24h hourly series in local time
        const hourlyData = [];
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

            hourlyData.push({
                hour: bucketEndLocal.getHours(),
                label: bucketEndLocal.toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                }),
                count,
            });
        }

        return NextResponse.json({
            totalClicks: clicks.length,
            dailyData,
            topCountries,
            deviceBreakdown,
            osBreakdown,
            browserBreakdown,
            topReferrers,
            hourlyData,
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
