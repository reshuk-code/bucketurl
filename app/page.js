// app/page.js — SERVER COMPONENT (crawlable by Google)
// Interactive bits are in LandingClient below

import Link from 'next/link';
import LandingClient from '@/components/landing/LandingClient';
import {
  BarChart3, Shield, Users, Globe, ArrowRight,
  Check, X as XIcon, Link2
} from 'lucide-react';

export const metadata = {
  title: 'BucketURL — Free URL Shortener with Click Analytics & Custom Links',
  description:
    'Shorten URLs in seconds. Get real-time click analytics, custom slugs, QR codes, UTM tracking, and password-protected links — 100% free. The best Bitly alternative.',
  keywords: [
    'url shortener', 'free link shortener', 'short url', 'custom short link',
    'link analytics', 'click tracking', 'bitly alternative', 'tinyurl alternative',
    'url shortener free', 'branded short links', 'qr code generator',
  ],
  alternates: { canonical: 'https://bucketurl.onrender.com' },
  openGraph: {
    title: 'BucketURL — Free URL Shortener with Analytics',
    description: 'Shorten URLs, track clicks, create custom links. Free forever.',
    url: 'https://bucketurl.onrender.com',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
};

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Deep Click Analytics',
    desc: 'Track referring sites, UTM parameters, device types, browsers, operating systems, and country-level geography — without any bloat.',
    wide: true,
  },
  {
    icon: Globe,
    title: 'OpenGraph Control',
    desc: 'Control exactly how your links appear on Facebook, Twitter, LinkedIn, and WhatsApp. Total brand consistency.',
    wide: false,
  },
  {
    icon: Shield,
    title: 'Custom Branded Slugs',
    desc: 'Memorable, professional short links. bucketurl.onrender.com/launch builds instant trust.',
    wide: false,
  },
  {
    icon: Users,
    title: 'Team Workspaces',
    desc: 'Invite members, assign roles, and manage shared links from a single unified dashboard.',
    wide: true,
  },
];

const PLANS = [
  {
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    desc: 'Perfect for personal use',
    features: [
      { name: '25 short links', ok: true },
      { name: '7-day analytics', ok: true },
      { name: 'Basic click tracking', ok: true },
      { name: 'Unlimited links', ok: false },
      { name: 'QR codes', ok: false },
      { name: 'Custom slugs', ok: false },
    ],
    cta: 'Get Started Free',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    priceMonthly: 12,
    priceYearly: 9,
    desc: 'For power users & creators',
    features: [
      { name: 'Unlimited short links', ok: true },
      { name: '365-day analytics', ok: true },
      { name: 'Advanced analytics', ok: true },
      { name: 'QR codes & Live data', ok: true },
      { name: 'Custom slugs & OG editor', ok: true },
      { name: 'Team collaboration', ok: true },
    ],
    cta: 'Start Pro Trial',
    href: '/signup?plan=pro',
    popular: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black relative font-sans text-white/90 selection:bg-white/20">

      {/* Auth redirect + billing toggle — tiny client component */}
      <LandingClient />

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="BucketURL logo" className="w-8 h-8 object-contain" />
            <span className="text-base font-bold tracking-tight text-white">BucketURL</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-white/50 hover:text-white transition-colors">How it Works</Link>
            <Link href="#pricing" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden sm:block">Log in</Link>
            <Link href="/signup" className="text-sm font-bold h-9 px-4 bg-white text-black hover:bg-white/90 rounded-md flex items-center transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-40 pb-24">

        {/* ── Hero ── */}
        <section className="max-w-6xl mx-auto px-6 mb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 mb-8">
            <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            BucketURL 2.0 — early access
            <ArrowRight size={12} className="text-white/40" />
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight mb-8 text-white">
            Short links.<br />Big impact.
          </h1>

          <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            The minimalist URL shortener with real-time analytics. Create branded short links, track every click, and optimise your marketing — free forever.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto h-12 px-8 flex items-center justify-center rounded-md bg-white text-black text-base font-bold hover:bg-white/90 transition-colors">
              Start for free
            </Link>
            <Link href="#features" className="w-full sm:w-auto h-12 px-8 flex items-center justify-center rounded-md bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors">
              Explore features
            </Link>
          </div>
          <p className="mt-6 text-xs text-white/30 font-medium tracking-widest uppercase">No credit card required</p>
        </section>

        {/* ── Dashboard Mockup ── */}
        <section aria-hidden="true" className="max-w-5xl mx-auto px-6 mb-40">
          <div className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] p-2">
            <div className="rounded-lg border border-white/5 bg-black overflow-hidden flex flex-col md:flex-row">
              <div className="hidden md:flex flex-col w-64 border-r border-white/5 p-4 gap-2">
                <div className="h-4 w-20 bg-white/10 rounded mb-4" />
                <div className="h-8 w-full bg-white/5 rounded" />
                <div className="h-8 w-full bg-transparent rounded" />
                <div className="h-8 w-full bg-transparent rounded" />
              </div>
              <div className="flex-1 p-6 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="h-6 w-40 bg-white/10 rounded mb-2" />
                    <div className="h-3 w-24 bg-white/5 rounded" />
                  </div>
                  <div className="h-8 w-24 bg-white rounded-md" />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[0.2, 0.1, 0.1].map((op, i) => (
                    <div key={i} className="h-24 rounded-lg bg-[#0a0a0a] border border-white/5 p-4 flex flex-col justify-end">
                      <div className="h-6 w-12 rounded" style={{ background: `rgba(255,255,255,${op})` }} />
                    </div>
                  ))}
                </div>
                <div className="h-48 rounded-lg bg-[#0a0a0a] border border-white/5 w-full relative overflow-hidden">
                  <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute bottom-0 w-full h-2/3 text-white/20">
                    <path d="M0 40 L0 30 Q10 28,20 25 T40 20 T60 15 T80 5 L100 0 L100 40 Z" fill="currentColor" opacity="0.1" />
                    <path d="M0 30 Q10 28,20 25 T40 20 T60 15 T80 5 L100 0" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="max-w-6xl mx-auto px-6 mb-40">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">Powerful features.</h2>
            <p className="text-white/50 text-lg max-w-2xl font-light">Everything you need to shorten, brand, and analyse your links — refined to the essentials.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
            {FEATURES.map((f) => (
              <div key={f.title} className={`${f.wide ? 'md:col-span-2' : ''} group bg-[#0a0a0a] rounded-xl border border-white/10 p-10 hover:border-white/20 transition-colors`}>
                <f.icon className="text-white mb-6" size={24} strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-white/50 text-base font-light leading-relaxed max-w-md">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 mb-40">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">Built for speed.</h2>
              <p className="text-white/50 text-lg font-light leading-relaxed mb-8">
                Three steps from a messy URL to actionable click data. No friction, no bloat.
              </p>
              <ol className="space-y-8">
                {[
                  { n: '01', t: 'Paste', d: 'Drop your long URL into the BucketURL dashboard.' },
                  { n: '02', t: 'Configure', d: 'Add a custom slug, password, UTM tags, or OG image.' },
                  { n: '03', t: 'Analyse', d: 'Monitor real-time click analytics from every device and country.' },
                ].map(({ n, t, d }) => (
                  <li key={n} className="flex gap-4">
                    <div className="text-white font-mono text-sm mt-1">{n}</div>
                    <div>
                      <h4 className="text-white font-bold mb-1">{t}</h4>
                      <p className="text-white/40 text-sm font-light">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8 aspect-square flex flex-col justify-center relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] rounded-xl pointer-events-none" />
              <div className="relative z-10 w-full bg-black border border-white/10 rounded-lg p-4 mb-4 shadow-2xl">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-mono">Original URL</p>
                <p className="text-sm font-mono text-white/50 truncate">https://your-domain.com/campaigns/spring-2026?utm_source=twitter&utm_medium=social</p>
              </div>
              <div className="relative z-10 flex justify-center py-4">
                <ArrowRight className="text-white/20 rotate-90 md:rotate-0" />
              </div>
              <div className="relative z-10 w-full bg-white text-black rounded-lg p-4 shadow-2xl">
                <p className="text-[10px] text-black/50 uppercase tracking-widest mb-2 font-mono font-bold">Short Link</p>
                <p className="text-lg font-mono font-bold">bucketurl.onrender.com/spring</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">Simple pricing.</h2>
            {/* Billing toggle is client-side */}
            <div id="billing-toggle" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {PLANS.map((plan) => (
              <article key={plan.name} className={`rounded-xl p-8 lg:p-10 ${plan.popular ? 'border border-white bg-[#0a0a0a]' : 'border border-white/10 bg-black hover:border-white/20 transition-colors'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                    <p className="text-white/50 text-sm mt-1">{plan.desc}</p>
                  </div>
                  {plan.popular && <span className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Popular</span>}
                </div>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tighter text-white">${plan.priceMonthly}</span>
                  <span className="text-white/50 text-sm">/mo</span>
                </div>
                <Link href={plan.href} className={`flex justify-center items-center h-12 rounded-md text-sm font-bold transition-colors mb-8 ${plan.popular ? 'bg-white text-black hover:bg-white/90' : 'bg-[#111] border border-white/10 text-white hover:bg-[#222]'}`}>
                  {plan.cta}
                </Link>
                <ul className="space-y-4">
                  {plan.features.map((feat) => (
                    <li key={feat.name} className="flex items-start gap-3">
                      {feat.ok
                        ? <Check size={16} className="text-white mt-0.5" strokeWidth={2.5} />
                        : <XIcon size={16} className="text-white/20 mt-0.5" />}
                      <span className={`text-sm ${feat.ok ? 'text-white/80' : 'text-white/40'}`}>{feat.name}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 bg-black py-16 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-70 hover:opacity-100 transition-opacity">
          <img src="/logo.png" alt="BucketURL" className="w-6 h-6 object-contain" />
          <span className="font-bold tracking-tight text-white">BucketURL</span>
        </div>
        <nav aria-label="Footer links" className="flex justify-center gap-6 mb-4">
          <Link href="/signup" className="text-xs text-white/30 hover:text-white/60 transition-colors">Sign up free</Link>
          <Link href="/login" className="text-xs text-white/30 hover:text-white/60 transition-colors">Log in</Link>
          <Link href="#features" className="text-xs text-white/30 hover:text-white/60 transition-colors">Features</Link>
          <Link href="#pricing" className="text-xs text-white/30 hover:text-white/60 transition-colors">Pricing</Link>
        </nav>
        <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} BucketURL. All rights reserved.</p>
      </footer>
    </div>
  );
}
