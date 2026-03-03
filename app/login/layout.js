// app/login/layout.js
export const metadata = {
    title: 'Log In',
    description: 'Log in to BucketURL to manage your short links, view real-time click analytics, and track your link performance.',
    alternates: {
        canonical: 'https://bucketurl.onrender.com/login',
    },
    openGraph: {
        title: 'Log In to BucketURL',
        description: 'Access your BucketURL dashboard — short links, analytics, and more.',
        url: 'https://bucketurl.onrender.com/login',
    },
    twitter: {
        title: 'Log In to BucketURL',
        description: 'Access your BucketURL dashboard — short links, analytics, and more.',
    },
};

export default function LoginLayout({ children }) {
    return children;
}
