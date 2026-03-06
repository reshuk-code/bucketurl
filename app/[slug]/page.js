// app/[slug]/page.js - Short link redirect handler with bot detection
import { adminDb, adminFirestore } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UAParser } from 'ua-parser-js';
const OG_DEFAULT_IMAGE = 'https://bucketurl.onrender.com/og-default.png';

// Social media bot user-agent patterns
const BOT_PATTERNS = [
    'facebookexternalhit',
    'facebot',
    'twitterbot',
    'linkedinbot',
    'slackbot',
    'slack-imgproxy',
    'telegrambot',
    'whatsapp',
    'discordbot',
    'applebot',
    'googlebot',
    'bingbot',
    'pinterest',
    'vkshare',
    'line-poker',
    'iframely',
    'embedly',
    'outbrain',
    'quora link preview',
    'rogerbot',
    'showyoubot',
    'w3c_validator',
    'semrushbot',
    'ahrefsbot',
    'msnbot',
];

function isBot(userAgent) {
    if (!userAgent) return false;
    const ua = userAgent.toLowerCase();
    return BOT_PATTERNS.some((p) => ua.includes(p));
}

function getAppUrl() {
    return process.env.NEXT_PUBLIC_APP_URL || 'https://bucketurl.onrender.com';
}

// generateMetadata is still needed for crawlers that respect Next.js meta
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const appUrl = getAppUrl();

    const snapshot = await adminDb
        .collection('links')
        .where('shortCode', '==', slug)
        .where('deleted', '==', false)
        .limit(1)
        .get();

    if (snapshot.empty) {
        return {
            title: 'Link Not Found — BucketURL',
            metadataBase: new URL(appUrl),
        };
    }

    const link = snapshot.docs[0].data();

    // Always resolve to an absolute URL — relative paths cause "open in app" dialogs on mobile
    const resolvedOgImage = link.ogImage?.trim()
        ? (link.ogImage.startsWith('http') ? link.ogImage : `${appUrl}${link.ogImage}`)
        : OG_DEFAULT_IMAGE;

    // Build a meaningful title — never let a raw short slug be the title
    const rawTitle = link.ogTitle || link.title || '';
    const ogTitle = rawTitle.length >= 10
        ? rawTitle
        : `${rawTitle ? rawTitle + ' — ' : ''}Shared via BucketURL`;

    // Build a meaningful description — must be 110-160 chars for SEO
    const rawDesc = link.ogDescription || '';
    const destHost = (() => { try { return new URL(link.originalUrl).hostname.replace('www.', ''); } catch { return ''; } })();
    const ogDesc = rawDesc.length >= 50
        ? rawDesc
        : `This short link redirects to ${destHost || 'the destination'}. Created and tracked with BucketURL — the free URL shortener with real-time click analytics, custom slugs, and UTM tracking.`;

    const pageUrl = `${appUrl}/${slug}`;

    return {
        // metadataBase is REQUIRED — without it Next.js uses app:// scheme on mobile
        metadataBase: new URL(appUrl),
        title: ogTitle,
        description: ogDesc,
        openGraph: {
            title: ogTitle,
            description: ogDesc,
            images: [{
                url: resolvedOgImage,
                width: 1200,
                height: 630,
                type: 'image/png',
                alt: ogTitle,
            }],
            type: 'website',
            url: pageUrl,
            siteName: 'BucketURL',
        },
        twitter: {
            card: 'summary_large_image',
            title: ogTitle,
            description: ogDesc,
            images: [{ url: resolvedOgImage, alt: ogTitle }],
            site: '@bucketurl',
        },
    };
}

// Server action for password-protected links (must be module-scope)
async function unlockPasswordLink(formData) {
    'use server';

    const slug = formData.get('slug');
    const pwd = formData.get('password');

    if (!slug || !pwd) {
        redirect(`/${slug}?error=1`);
    }

    const snapshot = await adminDb
        .collection('links')
        .where('shortCode', '==', slug)
        .where('deleted', '==', false)
        .limit(1)
        .get();

    if (snapshot.empty) {
        redirect(`/${slug}?error=1`);
    }

    const doc = snapshot.docs[0];
    const link = doc.data();
    const linkId = doc.id;

    if (pwd !== link.password) {
        redirect(`/${slug}?error=1`);
    }

    // Track click then redirect
    try {
        const headersList = await headers();
        const userAgent = headersList.get('user-agent') || '';
        const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const referer = headersList.get('referer') || 'Direct';
        const parser = new UAParser(userAgent);

        const pwCountryCode = headersList.get('x-vercel-ip-country') || headersList.get('cf-ipcountry') || '';
        await Promise.all([
            adminDb.collection('clicks').add({
                linkId,
                userId: link.userId,
                shortCode: slug,
                timestamp: new Date().toISOString(),
                ip,
                country: pwCountryCode || 'Unknown',
                countryCode: pwCountryCode,
                device: parser.getDevice().type || 'Desktop',
                browser: parser.getBrowser().name || 'Other',
                os: parser.getOS().name || 'Other',
                referrer: referer,
                utmSource: formData.get('utm_source') || link.utmSource || null,
                utmMedium: formData.get('utm_medium') || link.utmMedium || null,
                utmCampaign: formData.get('utm_campaign') || link.utmCampaign || null,
                utmTerm: formData.get('utm_term') || null,
                utmContent: formData.get('utm_content') || null,
            }),
            adminDb.collection('links').doc(linkId).update({
                totalClicks: adminFirestore.FieldValue.increment(1),
            }),
        ]);
    } catch (e) {
        console.error('Click tracking error (password link):', e);
    }

    redirect(link.originalUrl);
}

export default async function SlugPage({ params, searchParams }) {
    const { slug } = await params;
    const sp = await searchParams;
    const passwordError = sp?.error === '1';

    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const botVisit = isBot(userAgent);

    const snapshot = await adminDb
        .collection('links')
        .where('shortCode', '==', slug)
        .where('deleted', '==', false)
        .limit(1)
        .get();

    if (snapshot.empty) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Link Not Found</h1>
                    <p className="text-[var(--text-secondary)] mb-4">
                        This short link doesn&apos;t exist or has been deleted.
                    </p>
                    <a href="/" className="text-white hover:text-[var(--text-secondary)]">
                        Go to BucketURL
                    </a>
                </div>
            </div>
        );
    }

    const doc = snapshot.docs[0];
    const link = doc.data();
    const linkId = doc.id;
    const appUrl = getAppUrl();
    const ogImage = link.ogImage?.trim() ? link.ogImage : OG_DEFAULT_IMAGE;

    // Check expiry
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Link Expired</h1>
                    <p className="text-[var(--text-secondary)] mb-4">
                        This link has expired and is no longer active.
                    </p>
                    <a href="/" className="text-white hover:text-[var(--text-secondary)]">
                        Go to BucketURL
                    </a>
                </div>
            </div>
        );
    }

    // Password protection
    if (link.password) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-sm text-center">
                    <div className="w-12 h-12 rounded-full border border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-center mx-auto mb-5">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-white"
                        >
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Password Protected</h1>
                    <p className="text-sm text-[var(--text-secondary)] mb-6">
                        {link.title || 'This link'} is password protected.
                    </p>
                    <div className="card p-6">
                        <p className="text-xs text-[var(--text-muted)] mb-4">
                            Enter the password to access this link
                        </p>
                        {passwordError && (
                            <p className="text-sm text-red-400 mb-3">
                                Incorrect password. Please try again.
                            </p>
                        )}
                        <form action={unlockPasswordLink}>
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="utm_source" value={sp?.utm_source || ''} />
                            <input type="hidden" name="utm_medium" value={sp?.utm_medium || ''} />
                            <input type="hidden" name="utm_campaign" value={sp?.utm_campaign || ''} />
                            <input type="hidden" name="utm_term" value={sp?.utm_term || ''} />
                            <input type="hidden" name="utm_content" value={sp?.utm_content || ''} />
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter password"
                                className="input-field mb-3"
                                required
                                autoFocus
                            />
                            <button type="submit" className="btn-primary w-full justify-center">
                                Access Link
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // ── Real users: track click then server-redirect immediately ───────────
    // We do NOT use JS redirect — JS runs after HTML is parsed, which means
    // social preview scrapers (WhatsApp, iMessage, Telegram) that aren't in
    // the bot list would execute it and get redirected before reading OG tags.
    if (!botVisit) {
        const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const referer = headersList.get('referer') || 'Direct';

        try {
            const parser = new UAParser(userAgent);
            const device = parser.getDevice().type || 'Desktop';
            const browser = parser.getBrowser().name || 'Other';
            const os = parser.getOS().name || 'Other';

            let countryCode = headersList.get('x-vercel-ip-country') || headersList.get('cf-ipcountry') || '';
            let country = 'Unknown';
            if (countryCode && countryCode.length === 2) {
                country = countryCode;
            } else {
                try {
                    if (ip && ip !== 'unknown' && !ip.startsWith('127.') && !ip.startsWith('192.168') && !ip.startsWith('10.')) {
                        const geo = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`, { signal: AbortSignal.timeout(2000) });
                        if (geo.ok) { const g = await geo.json(); if (g.status === 'success') { country = g.country || 'Unknown'; countryCode = g.countryCode || ''; } }
                    }
                } catch { /* silent */ }
            }

            // Fire-and-forget — don't await, so redirect is instant
            Promise.all([
                adminDb.collection('clicks').add({
                    linkId,
                    userId: link.userId,
                    shortCode: slug,
                    timestamp: new Date().toISOString(),
                    ip,
                    country,
                    countryCode,
                    device,
                    browser,
                    os,
                    referrer: referer,
                    utmSource: sp?.utm_source || link.utmSource || null,
                    utmMedium: sp?.utm_medium || link.utmMedium || null,
                    utmCampaign: sp?.utm_campaign || link.utmCampaign || null,
                    utmTerm: sp?.utm_term || null,
                    utmContent: sp?.utm_content || null,
                }),
                adminDb.collection('links').doc(linkId).update({
                    totalClicks: adminFirestore.FieldValue.increment(1),
                }),
            ]).catch(() => {});
        } catch { /* never block the redirect */ }

        // Server-side 302 redirect — instant, no JS, works in every client
        redirect(link.originalUrl);
    }

    // ── Bots only reach here — serve the OG preview page ─────────────────
    // generateMetadata above injects the og: tags into <head> automatically.
    // This page body is what social crawlers (FB, Twitter, Slack, WhatsApp)
    // render as a visual preview card.
    const resolvedOgImage = link.ogImage?.trim()
        ? (link.ogImage.startsWith('http') ? link.ogImage : `${appUrl}${link.ogImage}`)
        : OG_DEFAULT_IMAGE;

    const displayTitle = link.ogTitle || link.title || 'BucketURL Short Link';
    const displayDesc = link.ogDescription || 'Shared via BucketURL';

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6" style={{ fontFamily: '-apple-system, sans-serif' }}>
            <div className="w-full max-w-lg mb-8 rounded-xl overflow-hidden border border-[#262626] shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={resolvedOgImage}
                    alt={displayTitle}
                    className="w-full object-cover"
                    style={{ aspectRatio: '1200/630' }}
                />
                <div className="bg-[#111111] px-5 py-4 border-t border-[#262626]">
                    <p className="text-[10px] font-bold text-[#525252] uppercase tracking-widest mb-1">
                        {(() => { try { return new URL(link.originalUrl).hostname; } catch { return appUrl; } })()}
                    </p>
                    <p className="text-sm font-bold text-white truncate">{displayTitle}</p>
                    {displayDesc && (
                        <p className="text-xs text-[#a3a3a3] mt-1 line-clamp-2">{displayDesc}</p>
                    )}
                </div>
            </div>
            <div className="text-center">
                <p className="text-sm text-[#525252] mb-4">Preview via BucketURL</p>
                <a
                    href={link.originalUrl}
                    className="inline-flex items-center gap-2 bg-white text-black text-sm font-bold px-6 py-3 rounded-lg hover:bg-[#f0f0f0] transition-colors"
                >
                    Continue to destination →
                </a>
                <p className="text-[10px] text-[#404040] mt-6">
                    Shortened by{' '}
                    <a href={appUrl} className="text-[#737373] hover:text-white transition-colors">
                        BucketURL
                    </a>
                </p>
            </div>
        </div>
    );
}
