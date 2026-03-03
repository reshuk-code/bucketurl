// app/sitemap.js
export default function sitemap() {
    const APP_URL = 'https://bucketurl.onrender.com';

    return [
        {
            url: APP_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${APP_URL}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${APP_URL}/signup`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ];
}
