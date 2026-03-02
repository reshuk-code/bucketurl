// app/[slug]/page.js - Short link redirect handler
import { adminDb } from '@/lib/firebase-admin';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const snapshot = await adminDb.collection('links').where('shortCode', '==', slug).where('deleted', '==', false).limit(1).get();

    if (snapshot.empty) {
        return { title: 'Link Not Found — BucketURL' };
    }

    const link = snapshot.docs[0].data();
    return {
        title: link.ogTitle || link.title || 'BucketURL Short Link',
        description: link.ogDescription || 'Shared via BucketURL — Professional URL Shortener',
        openGraph: {
            title: link.ogTitle || link.title || 'BucketURL Short Link',
            description: link.ogDescription || 'Shared via BucketURL',
            images: link.ogImage ? [{ url: link.ogImage, width: 1200, height: 630 }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: link.ogTitle || link.title || 'BucketURL Short Link',
            description: link.ogDescription || 'Shared via BucketURL',
            images: link.ogImage ? [link.ogImage] : [],
        },
    };
}

export default async function SlugPage({ params, searchParams }) {
    const { slug } = await params;

    const snapshot = await adminDb.collection('links')
        .where('shortCode', '==', slug)
        .where('deleted', '==', false)
        .limit(1)
        .get();

    if (snapshot.empty) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Link Not Found</h1>
                    <p className="text-[var(--text-secondary)] mb-4">This short link doesn&apos;t exist or has been deleted.</p>
                    <a href="/" className="text-white hover:text-[var(--text-secondary)]">Go to BucketURL</a>
                </div>
            </div>
        );
    }

    const doc = snapshot.docs[0];
    const link = doc.data();
    const linkId = doc.id;

    // Check expiry
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Link Expired</h1>
                    <p className="text-[var(--text-secondary)] mb-4">This link has expired and is no longer active.</p>
                    <a href="/" className="text-white hover:text-[var(--text-secondary)]">Go to BucketURL</a>
                </div>
            </div>
        );
    }

    // Password protection
    if (link.password) {
        // Client-side password check handled below
        return <PasswordProtectedPage link={link} linkId={linkId} slug={slug} />;
    }

    // Track click asynchronously (fire and forget)
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const referer = headersList.get('referer') || 'Direct';

    // Fire-and-forget click recording
    try {
        let device = 'Desktop';
        let browser = 'Other';
        if (/mobile/i.test(userAgent)) device = 'Mobile';
        else if (/tablet|ipad/i.test(userAgent)) device = 'Tablet';
        if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) browser = 'Chrome';
        else if (/firefox/i.test(userAgent)) browser = 'Firefox';
        else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
        else if (/edge|edg/i.test(userAgent)) browser = 'Edge';

        await Promise.all([
            adminDb.collection('clicks').add({
                linkId, shortCode: slug, timestamp: new Date().toISOString(),
                ip, country: 'Unknown', device, browser, os: 'Other', referrer: referer,
            }),
            adminDb.collection('links').doc(linkId).update({
                totalClicks: (link.totalClicks || 0) + 1
            })
        ]);
    } catch (e) {
        // Don't fail redirect on click tracking error
    }

    redirect(link.originalUrl);
}

// Client component for password protection
function PasswordProtectedPage({ link, linkId, slug }) {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm text-center">
                <div className="w-12 h-12 rounded-full border border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-center mx-auto mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
                <h1 className="text-xl font-bold text-white mb-2">Password Protected</h1>
                <p className="text-sm text-[var(--text-secondary)] mb-6">{link.title || 'This link'} is password protected.</p>
                <PasswordForm linkId={linkId} originalUrl={link.originalUrl} correctPassword={link.password} />
            </div>
        </div>
    );
}

function PasswordForm({ originalUrl, correctPassword }) {
    // This is a server component, so we need a client-side form
    // We'll use a simple HTML form with a POST action
    return (
        <div className="card p-6">
            <p className="text-xs text-[var(--text-muted)] mb-4">Enter the password to access this link</p>
            <form action={async (formData) => {
                'use server';
                const pwd = formData.get('password');
                if (pwd === correctPassword) redirect(originalUrl);
            }}>
                <input type="password" name="password" placeholder="Enter password" className="input-field mb-3" required autoFocus />
                <button type="submit" className="btn-primary w-full justify-center">Access Link</button>
            </form>
        </div>
    );
}
