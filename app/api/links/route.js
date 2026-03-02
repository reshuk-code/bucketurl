// app/api/links/route.js - List and Create links
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { generateSlug } from '@/lib/utils';

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

export async function GET(request) {
    try {
        const uid = await getUidFromRequest(request);
        if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        let query = adminDb.collection('links')
            .where('userId', '==', uid);

        const snapshot = await query.get();
        let links = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filter and sort in memory
        links = links.filter(l => l.deleted === false);
        links.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        links = links.slice(0, 100);

        if (search) {
            const s = search.toLowerCase();
            links = links.filter(l =>
                l.title?.toLowerCase().includes(s) ||
                l.originalUrl?.toLowerCase().includes(s) ||
                l.shortCode?.toLowerCase().includes(s)
            );
        }

        return NextResponse.json({ links });
    } catch (error) {
        console.error('GET /api/links error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const uid = await getUidFromRequest(request);
        if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Check plan limits
        const userDoc = await adminDb.collection('users').doc(uid).get();
        const userData = userDoc.data();
        const plan = userData?.plan || 'free';

        if (plan === 'free') {
            const linkCount = await adminDb.collection('links')
                .where('userId', '==', uid)
                .where('deleted', '==', false)
                .count()
                .get();
            if (linkCount.data().count >= 25) {
                return NextResponse.json({ error: 'Free plan limit reached. Upgrade to Pro for unlimited links.' }, { status: 403 });
            }
        }

        const body = await request.json();
        const { originalUrl, customSlug, title, ogTitle, ogDescription, ogImage, password, expiresAt, utmSource, utmMedium, utmCampaign, teamId } = body;

        if (!originalUrl) return NextResponse.json({ error: 'originalUrl is required' }, { status: 400 });

        // Generate or validate slug
        let shortCode = customSlug?.trim().toLowerCase();
        if (shortCode) {
            if (plan === 'free') return NextResponse.json({ error: 'Custom slugs require Pro plan.' }, { status: 403 });
            // Check uniqueness
            const existing = await adminDb.collection('links').where('shortCode', '==', shortCode).get();
            if (!existing.empty) return NextResponse.json({ error: 'That slug is already taken.' }, { status: 409 });
        } else {
            // Auto-generate unique slug
            let attempts = 0;
            do {
                shortCode = generateSlug(6);
                const check = await adminDb.collection('links').where('shortCode', '==', shortCode).get();
                if (check.empty) break;
                attempts++;
            } while (attempts < 10);
        }

        const linkData = {
            shortCode,
            originalUrl,
            userId: uid,
            teamId: teamId || null,
            title: title || new URL(originalUrl).hostname,
            ogTitle: ogTitle || null,
            ogDescription: ogDescription || null,
            ogImage: ogImage || null,
            password: password || null,
            expiresAt: expiresAt || null,
            utmSource: utmSource || null,
            utmMedium: utmMedium || null,
            utmCampaign: utmCampaign || null,
            totalClicks: 0,
            deleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const ref = await adminDb.collection('links').add(linkData);
        return NextResponse.json({ link: { id: ref.id, ...linkData } }, { status: 201 });
    } catch (error) {
        console.error('POST /api/links error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
