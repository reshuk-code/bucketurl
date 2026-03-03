// app/api/links/route.js - List & create links
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

export async function GET(request) {
    try {
        const uid = await getUidFromRequest(request);
        if (!uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = (searchParams.get('search') || '').toLowerCase().trim();

        // Use a simple query that avoids requiring a composite Firestore index.
        const snapshot = await adminDb
            .collection('links')
            .where('userId', '==', uid)
            .get();

        let links = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
            }))
            // Filter out soft-deleted links and sort newest-first in memory
            .filter(link => !link.deleted)
            .sort((a, b) => {
                const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return bTime - aTime;
            });

        if (search) {
            links = links.filter(link => {
                const haystack = [
                    link.title,
                    link.originalUrl,
                    link.shortCode,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return haystack.includes(search);
            });
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
        if (!uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            originalUrl,
            title = '',
            ogTitle = '',
            ogDescription = '',
            ogImage = '',
            utmSource = '',
            utmMedium = '',
            utmCampaign = '',
        } = body || {};

        let {
            customSlug = null,
            password = null,
            expiresAt = null,
        } = body || {};

        if (!originalUrl) {
            return NextResponse.json({ error: 'originalUrl is required' }, { status: 400 });
        }

        try {
            // Basic URL validation
            new URL(originalUrl);
        } catch {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }

        let shortCode = customSlug;

        // Fetch user plan and enforce rules
        const userDoc = await adminDb.collection('users').doc(uid).get();
        const userData = userDoc.exists ? userDoc.data() : { plan: 'free' };
        const isPro = userData.plan === 'pro' || userData.plan === 'team';

        if (!isPro) {
            // Silently strip Pro features if free user tries to use them
            shortCode = null;
            password = null;
            expiresAt = null;
        }

        if (shortCode) {
            const existing = await adminDb
                .collection('links')
                .where('shortCode', '==', shortCode)
                .where('deleted', '==', false)
                .limit(1)
                .get();

            if (!existing.empty) {
                return NextResponse.json({ error: 'This custom slug is already in use' }, { status: 400 });
            }
        } else {
            // Generate a random short code
            const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const generateCode = (length = 7) =>
                Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');

            // Try a few times to avoid collisions
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const candidate = generateCode();
                const existing = await adminDb
                    .collection('links')
                    .where('shortCode', '==', candidate)
                    .limit(1)
                    .get();

                if (existing.empty) {
                    shortCode = candidate;
                    break;
                }
            }
        }

        const now = new Date().toISOString();

        const docData = {
            userId: uid,
            shortCode,
            title,
            originalUrl,
            ogTitle,
            ogDescription,
            ogImage,
            password,
            expiresAt,
            utmSource,
            utmMedium,
            utmCampaign,
            totalClicks: 0,
            deleted: false,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await adminDb.collection('links').add(docData);

        return NextResponse.json(
            { link: { id: docRef.id, ...docData } },
            { status: 201 },
        );
    } catch (error) {
        console.error('POST /api/links error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
