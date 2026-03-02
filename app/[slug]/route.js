// app/[slug]/route.js - Short link redirect handler (Route Handler version)
import { adminDb, adminFirestore } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';

export async function GET(request, { params }) {
    const { slug } = await params;

    const snapshot = await adminDb.collection('links')
        .where('shortCode', '==', slug)
        .where('deleted', '==', false)
        .limit(1)
        .get();

    if (snapshot.empty) {
        return new Response(notFoundHtml(), { headers: { 'Content-Type': 'text/html' } });
    }

    const doc = snapshot.docs[0];
    const link = doc.data();
    const linkId = doc.id;

    // Check expiry
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        return new Response(expiredHtml(), { headers: { 'Content-Type': 'text/html' } });
    }

    // Password protection
    if (link.password) {
        // Simple HTML form for password
        return new Response(passwordHtml(link), { headers: { 'Content-Type': 'text/html' } });
    }

    // Track click asynchronously
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const referer = headersList.get('referer') || 'Direct';

    try {
        const parser = new UAParser(userAgent);
        const device = parser.getDevice().type || 'Desktop';
        const browser = parser.getBrowser().name || 'Other';
        const os = parser.getOS().name || 'Other';
        const country = headersList.get('x-vercel-ip-country') || headersList.get('cf-ipcountry') || 'Unknown';

        // Fire-and-forget (Next.js will wait for this if we don't await, but better to use waitUntil if available)
        // For standard Route Handlers, we await to be safe since it's a redirect
        await Promise.all([
            adminDb.collection('clicks').add({
                linkId, userId: link.userId, shortCode: slug, timestamp: new Date().toISOString(),
                ip, country, device, browser, os, referrer: referer,
            }),
            adminDb.collection('links').doc(linkId).update({
                totalClicks: adminFirestore.FieldValue.increment(1)
            })
        ]);
    } catch (e) {
        console.error('Click tracking error:', e);
    }

    // Return the redirect HTML
    return new Response(redirectHtml(link), {
        headers: { 'Content-Type': 'text/html' }
    });
}

function redirectHtml(link) {
    const title = link.ogTitle || link.title || 'BucketURL';
    const description = link.ogDescription || 'Shared via BucketURL';
    const image = link.ogImage;
    const url = link.originalUrl;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="website">
    ${image ? `<meta property="og:image" content="${image}">` : ''}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    ${image ? `<meta name="twitter:image" content="${image}">` : ''}
    <meta http-equiv="refresh" content="0;url=${url}">
    <link rel="canonical" href="${url}">
    <style>
        body { background: #121212; color: #fff; font-family: -apple-system, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
        .container { padding: 2rem; }
        a { color: #fff; text-decoration: underline; }
        .loader { width: 24px; height: 24px; border: 2px solid rgba(255,255,255,0.1); border-top-color: #fff; border-radius: 50%; display: inline-block; animation: spin 0.8s linear infinite; margin-bottom: 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="loader"></div>
        <p>Redirecting to destination...</p>
        <p style="font-size: 0.8rem; color: #a3a3a3;">If you are not redirected automatically, <a href="${url}">click here</a>.</p>
    </div>
    <script>window.location.replace("${url}");</script>
</body>
</html>`;
}

function passwordHtml(link) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Password Protected — BucketURL</title>
    <style>
        body { background: #121212; color: #fff; font-family: -apple-system, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #171717; border: 1px solid #262626; padding: 2rem; border-radius: 12px; width: 100%; max-width: 320px; text-align: center; }
        input { background: #000; border: 1px solid #262626; color: #fff; padding: 0.75rem; border-radius: 6px; width: 100%; margin: 1rem 0; box-sizing: border-box; }
        button { background: #fff; color: #000; border: none; padding: 0.75rem; border-radius: 6px; width: 100%; font-weight: bold; cursor: pointer; }
        .icon { width: 48px; height: 48px; border-radius: 50%; border: 1px solid #262626; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
        <h2 style="font-size: 1.1rem; margin: 0 0 0.5rem;">Password Protected</h2>
        <p style="font-size: 0.8rem; color: #a3a3a3;">${link.title || 'This link'} requires a password.</p>
        <form onsubmit="event.preventDefault(); const p = document.getElementById('pw').value; if(p === '${link.password}') window.location.reload(); else alert('Incorrect password');">
            <input type="password" id="pw" placeholder="Enter password" autofocus required>
            <button type="submit">Access Link</button>
        </form>
    </div>
    <script>
        // Check if already unlocked in this session? (Optional enhancement)
    </script>
</body>
</html>`;
}

function notFoundHtml() {
    return `<!DOCTYPE html><html><head><title>Link Not Found</title><style>body{background:#121212;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;}</style></head><body><div><h1>404</h1><p>Link not found or deleted.</p><a href="/" style="color:#fff;">Go to BucketURL</a></div></body></html>`;
}

function expiredHtml() {
    return `<!DOCTYPE html><html><head><title>Link Expired</title><style>body{background:#121212;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;}</style></head><body><div><h1>Link Expired</h1><p>This link is no longer active.</p><a href="/" style="color:#fff;">Go to BucketURL</a></div></body></html>`;
}
