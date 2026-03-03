// app/robots.js
export default function robots() {
    const APP_URL = 'https://bucketurl.onrender.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/', '/api/'],
            },
        ],
        sitemap: `${APP_URL}/sitemap.xml`,
        host: APP_URL,
    };
}
