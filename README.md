# BucketURL — Free URL Shortener with Real-Time Analytics

> **Shorten. Share. Track.** — A professional link management platform built for marketers, developers, and modern teams.

🔗 **Live App**: [bucketurl.onrender.com](https://bucketurl.onrender.com)

---

## ✨ Features

| Feature | Free | Pro |
|---|---|---|
| Short links | 25 | Unlimited |
| Analytics | 7-day | 365-day |
| Live analytics | ❌ | ✅ |
| QR Code generation | ❌ | ✅ |
| Custom slugs | ❌ | ✅ |
| Custom OpenGraph (OG) | ✅ | ✅ |
| Password-protected links | ❌ | ✅ |
| Link expiration dates | ❌ | ✅ |
| Team collaboration | ❌ | ✅ |
| API access | ❌ | ✅ |

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Auth**: [Firebase Auth](https://firebase.google.com) — Google + Email/Password
- **Database**: [Firestore](https://firebase.google.com/docs/firestore)
- **Payments**: [Stripe](https://stripe.com) — Monthly & Yearly subscriptions
- **Styling**: Tailwind CSS + custom design system
- **Fonts**: [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
- **Charts**: [Recharts](https://recharts.org)
- **QR Codes**: [qrcode.react](https://www.npmjs.com/package/qrcode.react)
- **Deployment**: [Render](https://render.com)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/bucketurl.git
cd bucketurl
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase (Admin SDK)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRO_MONTHLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRO_YEARLY=price_xxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
app/
├── page.js                   # Landing page (marketing)
├── layout.js                 # Root layout + SEO metadata + JSON-LD
├── sitemap.js                # Auto-generated sitemap
├── robots.js                 # Robots.txt
├── [slug]/route.js           # Short link redirect handler
├── login/                    # Auth pages
├── signup/
├── dashboard/
│   ├── page.js               # Dashboard home + real-time analytics
│   ├── links/page.js         # Link management
│   ├── links/[id]/page.js    # Per-link analytics
│   ├── billing/page.js       # Stripe subscription management
│   ├── settings/page.js      # Account settings + API key
│   └── teams/                # Team collaboration
├── api/
│   ├── links/                # CRUD for links
│   ├── analytics/            # Click analytics
│   ├── users/                # User plan management
│   └── stripe/               # Stripe checkout + webhooks
lib/
├── firebase.js               # Firebase client init
├── firebase-admin.js         # Firebase Admin SDK
├── utils.js                  # Shared utilities
components/
└── auth/AuthProvider.js      # Auth context
```

---

## 🔐 Plan Gating (Security)

All Pro feature restrictions are **enforced server-side**, not just in the UI:

- **API routes** strip Pro-only fields (custom slugs, passwords, expiry) for Free users
- **Analytics API** applies a hard 7-day data cap for Free users
- **Live analytics** mode is blocked server-side for Free users

---

## 🧠 SEO

- Full OpenGraph + Twitter Card metadata
- JSON-LD structured data (WebApplication + Organization + WebSite schemas)
- Auto-generated `sitemap.xml` and `robots.txt`
- Page-level canonical URLs and Google Search Console verification

---

## 📦 Deployment

The app is deployed on [Render](https://render.com). Set all environment variables via the Render dashboard before deploying.

Make sure `NEXT_PUBLIC_APP_URL` is set to your production URL (e.g., `https://bucketurl.onrender.com`) so Stripe redirects and short URL generation work correctly.

---

## 📄 License

MIT
