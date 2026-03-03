// app/api/links/export/route.js — Export all user links as CSV
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

        const snapshot = await adminDb
            .collection('links')
            .where('userId', '==', uid)
            .get();

        const links = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(l => !l.deleted)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Build UTM URL helper
        const buildFinalUrl = (link) => {
            try {
                const url = new URL(link.originalUrl);
                if (link.utmSource) url.searchParams.set('utm_source', link.utmSource);
                if (link.utmMedium) url.searchParams.set('utm_medium', link.utmMedium);
                if (link.utmCampaign) url.searchParams.set('utm_campaign', link.utmCampaign);
                return url.toString();
            } catch {
                return link.originalUrl;
            }
        };

        // CSV headers
        const headers = [
            'Title',
            'Short URL',
            'Destination URL',
            'UTM Source',
            'UTM Medium',
            'UTM Campaign',
            'Total Clicks',
            'Password Protected',
            'Expires At',
            'Created At',
        ];

        const escape = (val) => {
            if (val == null) return '';
            const str = String(val);
            // Wrap in quotes if contains comma, quote, or newline
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const rows = links.map(link => [
            escape(link.title || 'Untitled'),
            escape(`${APP_URL}/${link.shortCode}`),
            escape(buildFinalUrl(link)),
            escape(link.utmSource || ''),
            escape(link.utmMedium || ''),
            escape(link.utmCampaign || ''),
            escape(link.totalClicks || 0),
            escape(link.password ? 'Yes' : 'No'),
            escape(link.expiresAt || ''),
            escape(link.createdAt || ''),
        ].join(','));

        const csv = [headers.join(','), ...rows].join('\n');

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="bucketurl-links-${new Date().toISOString().slice(0, 10)}.csv"`,
            },
        });
    } catch (error) {
        console.error('GET /api/links/export error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
