// lib/scraper.js - Lightweight OpenGraph scraper
export async function scrapeOgData(url) {
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'BucketURL-Bot/1.0 (+https://bucketurl.app)' },
            next: { revalidate: 3600 } // Cache results for 1 hour
        });

        if (!response.ok) return null;

        const html = await response.text();

        const getMetaContent = (name) => {
            const regex = new RegExp(`<meta[^>]+(?:property|name)=["'](?:og:)?${name}["'][^>]+content=["']([^"']+)["']`, 'i');
            const match = html.match(regex);
            if (match) return match[1];

            // Try reverse order of attributes
            const regexReverse = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:)?${name}["']`, 'i');
            const matchReverse = html.match(regexReverse);
            return matchReverse ? matchReverse[1] : null;
        };

        const title = getMetaContent('title') || html.match(/<title>([^<]+)<\/title>/i)?.[1];
        const description = getMetaContent('description');
        const image = getMetaContent('image');

        if (!title && !description && !image) return null;

        return {
            ogTitle: title?.trim() || null,
            ogDescription: description?.trim() || null,
            ogImage: image?.trim() || null,
        };
    } catch (error) {
        console.error('Scraping error:', error);
        return null;
    }
}
