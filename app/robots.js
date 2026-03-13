// app/robots.js
export default function robots() {
    const APP_URL = 'https://bucketurl.antqr.xyz';

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/signup', '/login', '/forgot-password'],
                disallow: ['/dashboard/', '/api/', '/_next/'],
            },
            {
                // Block AI training crawlers
                userAgent: ['GPTBot', 'Google-Extended', 'CCBot', 'anthropic-ai', 'ClaudeBot', 'PerplexityBot'],
                disallow: ['/'],
            },
        ],
        sitemap: `${APP_URL}/sitemap.xml`,
    };
}
