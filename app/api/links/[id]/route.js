// app/api/links/[id]/route.js - Get, Update, Delete a link
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
    const { id } = await params;
    try {
        const uid = await getUidFromRequest(request);
        if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const doc = await adminDb.collection('links').doc(id).get();
        if (!doc.exists || doc.data().userId !== uid) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ link: { id: doc.id, ...doc.data() } });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const uid = await getUidFromRequest(request);
        if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const doc = await adminDb.collection('links').doc(id).get();
        if (!doc.exists || doc.data().userId !== uid) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const body = await request.json();
        const allowedFields = ['title', 'originalUrl', 'ogTitle', 'ogDescription', 'ogImage', 'password', 'expiresAt', 'utmSource', 'utmMedium', 'utmCampaign'];
        const update = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) update[field] = body[field];
        }
        update.updatedAt = new Date().toISOString();

        await adminDb.collection('links').doc(id).update(update);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        const uid = await getUidFromRequest(request);
        if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const doc = await adminDb.collection('links').doc(id).get();
        if (!doc.exists || doc.data().userId !== uid) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        await adminDb.collection('links').doc(id).update({ deleted: true, updatedAt: new Date().toISOString() });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
