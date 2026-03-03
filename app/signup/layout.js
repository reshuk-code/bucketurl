// app/signup/layout.js
export const metadata = {
    title: 'Sign Up Free',
    description: 'Create a free BucketURL account in seconds. Get 25 short links, 7-day analytics, and powerful link management tools — no credit card required.',
    alternates: {
        canonical: 'https://bucketurl.onrender.com/signup',
    },
    openGraph: {
        title: 'Create a Free BucketURL Account',
        description: 'Get started with BucketURL for free — short links, analytics, QR codes, and more.',
        url: 'https://bucketurl.onrender.com/signup',
    },
    twitter: {
        title: 'Create a Free BucketURL Account',
        description: 'Get started with BucketURL for free — short links, analytics, QR codes, and more.',
    },
};

export default function SignupLayout({ children }) {
    return children;
}
