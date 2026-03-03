// app/sitemap.js
export default function sitemap() {
    const APP_URL = 'https://bucketurl.onrender.com';
    const now = new Date();

    return [
        {
            url: APP_URL,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${APP_URL}/signup`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${APP_URL}/login`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];
}

