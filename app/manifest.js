// app/manifest.js — PWA manifest for mobile SEO & installability
export default function manifest() {
    return {
        name: 'BucketURL — Free URL Shortener',
        short_name: 'BucketURL',
        description: 'Shorten URLs, track clicks, create custom links. Free forever.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0f',
        theme_color: '#0a0a0f',
        orientation: 'portrait',
        scope: '/',
        icons: [
            { src: '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
            { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
    };
}
