// app/robots.js
export default function robots() {
    const APP_URL = 'https://bucketurl.onrender.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/signup', '/login'],
                disallow: ['/dashboard/', '/api/', '/_next/'],
            },
            {
                // Block AI training crawlers
                userAgent: ['GPTBot', 'Google-Extended', 'CCBot', 'anthropic-ai'],
                disallow: ['/'],
            },
        ],
        sitemap: `${APP_URL}/sitemap.xml`,
        host: APP_URL,
    };
}
