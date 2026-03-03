'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  BarChart3, Shield, Users, Globe, Lock, ArrowRight,
  Check, X as XIcon, Link2, Code2, LineChart
} from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    desc: 'Perfect for personal use',
    features: [
      { name: '25 short links', included: true },
      { name: '7-day analytics', included: true },
      { name: 'Basic click tracking', included: true },
      { name: 'Unlimited links', included: false },
      { name: 'QR codes', included: false },
      { name: 'Live analytics', included: false },
      { name: 'Custom slugs', included: false },
    ],
    cta: 'Get Started Free',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: { monthly: 12, yearly: 9 },
    desc: 'For power users & teams',
    features: [
      { name: 'Unlimited short links', included: true },
      { name: '365-day analytics', included: true },
      { name: 'Advanced click tracking', included: true },
      { name: 'QR codes & Live analytics', included: true },
      { name: 'Custom slugs & OG', included: true },
      { name: 'Team collaboration', included: true },
      { name: 'Password protection & API', included: true },
    ],
    cta: 'Start Pro Trial',
    href: '/signup?plan=pro',
    popular: true,
  }
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [billing, setBilling] = useState('monthly');

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  // Color Palette:
  // 80% Base: Black (#000000)
  // 15% Secondary: Dark Greys (#111111, #222222, text-white/60)
  // 5% Accent: Clean White (text-white, bg-white) for high contrast CTAs and key icons.

  return (
    <div className="min-h-screen bg-black relative font-sans text-white/90 selection:bg-white/20">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="BucketURL" className="w-8 h-8 object-contain" />
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
        {/* ── Hero Section ── */}
        <section className="max-w-6xl mx-auto px-6 mb-32 text-center">
          <a href="#" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 mb-8 hover:bg-white/10 transition-colors">
            <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
            BucketURL 2.0 early access
            <ArrowRight size={12} className="text-white/40" />
          </a>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight mb-8 text-white">
            Short links.<br />
            Big impact.
          </h1>

          <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            The minimalist link management platform. Create branded links, track deep analytics, and optimize your marketing without the clutter.
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

        {/* ── Abstract UI Mockup (Clean) ── */}
        <section className="max-w-5xl mx-auto px-6 mb-40">
          <div className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] p-2">
            <div className="rounded-lg border border-white/5 bg-black overflow-hidden flex flex-col md:flex-row">
              {/* Sidebar Mock */}
              <div className="hidden md:flex flex-col w-64 border-r border-white/5 p-4 gap-2">
                <div className="h-4 w-20 bg-white/10 rounded mb-4" />
                <div className="h-8 w-full bg-white/5 rounded" />
                <div className="h-8 w-full bg-transparent rounded" />
                <div className="h-8 w-full bg-transparent rounded" />
              </div>
              {/* Main Area Mock */}
              <div className="flex-1 p-6 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="h-6 w-40 bg-white/10 rounded mb-2" />
                    <div className="h-3 w-24 bg-white/5 rounded" />
                  </div>
                  <div className="h-8 w-24 bg-white rounded-md" />
                </div>
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="h-24 rounded-lg bg-[#0a0a0a] border border-white/5 p-4 flex flex-col justify-end">
                    <div className="h-6 w-12 bg-white/20 rounded" />
                  </div>
                  <div className="h-24 rounded-lg bg-[#0a0a0a] border border-white/5 p-4 flex flex-col justify-end">
                    <div className="h-6 w-16 bg-white/10 rounded" />
                  </div>
                  <div className="h-24 rounded-lg bg-[#0a0a0a] border border-white/5 p-4 flex flex-col justify-end">
                    <div className="h-6 w-10 bg-white/10 rounded" />
                  </div>
                </div>
                {/* Chart Area */}
                <div className="h-48 rounded-lg bg-[#0a0a0a] border border-white/5 w-full relative overflow-hidden">
                  <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute bottom-0 w-full h-2/3 text-white/20">
                    <path d="M0 40 L0 30 Q10 28, 20 25 T40 20 T60 15 T80 5 L100 0 L100 40 Z" fill="currentColor" opacity="0.1" />
                    <path d="M0 30 Q10 28, 20 25 T40 20 T60 15 T80 5 L100 0" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Social Proof ── */}
        <section className="border-y border-white/5 bg-[#050505] py-16 mb-40">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-8">Trusted by precision engineering teams</p>
            <div className="flex flex-wrap gap-12 sm:gap-20 items-center justify-center opacity-40">
              <span className="text-xl font-bold tracking-tighter">AcmeCorp</span>
              <span className="text-xl font-bold tracking-tight">Nexus</span>
              <span className="text-xl font-bold tracking-widest uppercase">Apex</span>
              <span className="text-xl font-bold font-serif italic">Velocity</span>
              <span className="text-xl font-bold tracking-wider">Chronos</span>
            </div>
          </div>
        </section>

        {/* ── Bento Features (Monochrome) ── */}
        <section id="features" className="max-w-6xl mx-auto px-6 mb-40">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">Powerful primitives.</h2>
            <p className="text-white/50 text-lg max-w-2xl font-light">Everything you need to manage your links, carefully refined down to the absolute essentials.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">

            {/* Feature 1 */}
            <div className="md:col-span-2 group bg-[#0a0a0a] rounded-xl border border-white/10 p-10 hover:border-white/20 transition-colors">
              <BarChart3 className="text-white mb-6" size={24} strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Deep Analytics</h3>
              <p className="text-white/50 text-base max-w-md font-light leading-relaxed">
                Understand your audience with precision. Track referring sites, UTMs, device types, browsers, OS, and geographies without bloat.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-[#0a0a0a] rounded-xl border border-white/10 p-10 hover:border-white/20 transition-colors">
              <Globe className="text-white mb-6" size={24} strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">OpenGraph</h3>
              <p className="text-white/50 text-base font-light leading-relaxed">
                Control exactly how your links appear on social platforms. Total brand consistency.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-[#0a0a0a] rounded-xl border border-white/10 p-10 hover:border-white/20 transition-colors">
              <Shield className="text-white mb-6" size={24} strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Branded Slugs</h3>
              <p className="text-white/50 text-base font-light leading-relaxed">
                Memorable, professional links. brand.co/launch builds trust immediately.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-2 group bg-[#0a0a0a] rounded-xl border border-white/10 p-10 hover:border-white/20 transition-colors">
              <Users className="text-white mb-6" size={24} strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Team Workspaces</h3>
              <p className="text-white/50 text-base max-w-md font-light leading-relaxed">
                Build together. Invite members, assign discrete roles, and manage shared links from a single unified dashboard.
              </p>
            </div>

          </div>
        </section>

        {/* ── How It Works (Clean Text) ── */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 mb-40">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">Built for speed.</h2>
              <p className="text-white/50 text-lg font-light leading-relaxed mb-8">
                The shortest path from a messy URL to actionable insights. We stripped away the friction so you can focus on building your brand.
              </p>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="text-white font-mono text-sm mt-1">01</div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Paste</h4>
                    <p className="text-white/40 text-sm font-light">Drop your long URL into the dashboard.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-white font-mono text-sm mt-1">02</div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Configure</h4>
                    <p className="text-white/40 text-sm font-light">Apply custom metadata, passwords, or explicit slugs.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-white font-mono text-sm mt-1">03</div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Analyze</h4>
                    <p className="text-white/40 text-sm font-light">Monitor real-time traffic across the globe.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8 aspect-square flex flex-col justify-center relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] rounded-xl pointer-events-none" />
              <div className="relative z-10 w-full bg-black border border-white/10 rounded-lg p-4 mb-4 shadow-2xl">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-mono">Original</p>
                <p className="text-sm font-mono text-white/50 truncate">https://your-domain.com/marketing/campaigns/spring-2026?utm_source=twitter...</p>
              </div>
              <div className="relative z-10 flex justify-center py-4">
                <ArrowRight className="text-white/20 transform rotate-90 md:rotate-0 md:hidden" />
                <ArrowRight className="text-white/20 hidden md:block" />
              </div>
              <div className="relative z-10 w-full bg-white text-black rounded-lg p-4 shadow-2xl">
                <p className="text-[10px] text-black/50 uppercase tracking-widest mb-2 font-mono font-bold">Shortened</p>
                <p className="text-lg font-mono font-bold">bucketurl.onrender.com/spring</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing (Minimal) ── */}
        <section id="pricing" className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">Simple pricing.</h2>

            <div className="inline-flex bg-black p-1 rounded-md border border-white/10">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${billing === 'monthly' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${billing === 'yearly' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-8 lg:p-10 ${plan.popular
                  ? 'border border-white bg-[#0a0a0a]'
                  : 'border border-white/10 bg-black hover:border-white/20 transition-colors'
                  }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                    <p className="text-white/50 text-sm mt-1">{plan.desc}</p>
                  </div>
                  {plan.popular && (
                    <span className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Pro</span>
                  )}
                </div>

                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tighter text-white">
                    ${plan.price[billing]}
                  </span>
                  <span className="text-white/50 text-sm">/mo</span>
                </div>

                <Link
                  href={plan.href}
                  className={`flex justify-center items-center h-12 rounded-md justify-center text-sm font-bold transition-colors mb-8 ${plan.popular
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-[#111] border border-white/10 text-white hover:bg-[#222]'
                    }`}
                >
                  {plan.cta}
                </Link>

                <div className="space-y-4">
                  {plan.features.map((feat) => (
                    <div key={feat.name} className="flex items-start gap-3">
                      {feat.included ? (
                        <Check size={16} className="text-white mt-0.5" strokeWidth={2.5} />
                      ) : (
                        <XIcon size={16} className="text-white/20 mt-0.5" />
                      )}
                      <span className={`text-sm ${feat.included ? 'text-white/80' : 'text-white/40'}`}>
                        {feat.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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
        <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} BucketURL. All rights reserved.</p>
      </footer>
    </div>
  );
}
