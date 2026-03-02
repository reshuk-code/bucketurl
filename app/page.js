'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BarChart3, Shield, Zap, Users, Globe, Lock, ArrowRight, Check, X as XIcon, Link2, ChevronRight, TrendingUp, Eye } from 'lucide-react';

const FEATURES = [
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Track every click with device, geo, browser, referrer, and time data. Make data-driven decisions.' },
  { icon: Globe, title: 'Custom OpenGraph', desc: 'Control how your links look when shared on social media with custom titles, descriptions, and images.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Invite members, assign roles, and manage shared workspaces. Built for modern teams.' },
  { icon: Zap, title: 'Instant Redirects', desc: 'Sub-millisecond redirects with edge caching. Zero latency for your users worldwide.' },
  { icon: Lock, title: 'Password Protection', desc: 'Secure sensitive links with passwords. Set expiration dates for time-limited campaigns.' },
  { icon: Shield, title: 'Custom Slugs', desc: 'Create branded, memorable short links with your own custom slugs. Professionalism matters.' },
];

const STATS = [
  { value: '10M+', label: 'Links Created' },
  { value: '2.4B', label: 'Clicks Tracked' },
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '180+', label: 'Countries Reached' },
];

const PLANS = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    desc: 'Perfect for personal use',
    features: [
      { name: '25 short links', included: true },
      { name: '7-day analytics', included: true },
      { name: 'Basic click tracking', included: true },
      { name: 'QR codes', included: true },
      { name: 'Unlimited links', included: false },
      { name: 'Team collaboration', included: false },
      { name: 'Custom OpenGraph', included: false },
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
      { name: 'QR codes', included: true },
      { name: 'Custom slugs & OpenGraph', included: true },
      { name: 'Team collaboration (up to 10)', included: true },
      { name: 'Password protection & API', included: true },
    ],
    cta: 'Start Pro Trial',
    href: '/signup?plan=pro',
    popular: true,
  }
];

export default function LandingPage() {
  const [billing, setBilling] = useState('monthly');
  const [demoUrl, setDemoUrl] = useState('');

  return (
    <div className="min-h-screen bg-[var(--bg)] relative overflow-hidden font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-white border border-white/20 flex items-center justify-center">
              <Link2 size={16} className="text-black" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">BucketURL</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="btn-primary text-sm font-semibold h-9 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center relative mt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Real-time analytics & teams
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in tracking-tight">
            The URL shortener
            <br />
            <span className="text-[#a3a3a3]">built for professionals</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in font-medium">
            Stop using throwaway short links. BucketURL gives you powerful analytics, custom OpenGraph,
            team collaboration, and branded slugs — all in one elegantly simple platform.
          </p>

          {/* Demo shortener */}
          <div className="max-w-xl mx-auto mb-16 animate-fade-in">
            <div className="flex gap-2 p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] shadow-xl">
              <input
                type="url"
                value={demoUrl}
                onChange={e => setDemoUrl(e.target.value)}
                placeholder="Paste your long URL here..."
                className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none"
              />
              <Link href="/signup" className="btn-primary px-5 h-10 shadow-sm">
                Shorten
              </Link>
            </div>
            <p className="text-xs font-medium text-[var(--text-muted)] mt-3">Free to start — no credit card required</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden max-w-2xl mx-auto animate-fade-in">
            {STATS.map(({ value, label }) => (
              <div key={label} className="bg-[var(--bg-card)] px-6 py-6 text-center">
                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                <div className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)] shadow-2xl">
            {/* Mock browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#171717] border-b border-[var(--border)]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#404040]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#404040]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#404040]" />
              </div>
              <div className="flex-1 mx-4 px-4 py-1.5 rounded bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text-muted)] text-center font-medium">
                bucketurl.app/dashboard
              </div>
            </div>
            {/* Mock Dashboard */}
            <div className="flex h-[420px]">
              {/* Sidebar */}
              <div className="w-56 border-r border-[var(--border)] p-4 hidden md:block bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2.5 mb-8 px-2">
                  <div className="w-6 h-6 rounded border border-[var(--border)] bg-black flex items-center justify-center">
                    <Link2 size={12} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-white">BucketURL</span>
                </div>
                {['Dashboard', 'My Links', 'Analytics', 'Teams', 'Settings'].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium mb-1 ${i === 0 ? 'bg-white/10 text-white' : 'text-[var(--text-secondary)]'}`}>
                    <div className="w-4 h-4 rounded-sm border border-[var(--border)] bg-[var(--bg)]" />
                    {item}
                  </div>
                ))}
              </div>
              {/* Main area */}
              <div className="flex-1 p-8 overflow-hidden bg-[var(--bg)]">
                <div className="grid grid-cols-3 gap-5 mb-8">
                  {[['12,840', 'Total Clicks', '+24%'], ['342', 'Active Links', '+8%'], ['91%', 'CTR', '+3%']].map(([val, label, delta]) => (
                    <div key={label} className="bg-[var(--bg-card)] rounded-lg p-5 border border-[var(--border)]">
                      <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">{label}</div>
                      <div className="text-2xl font-bold text-white">{val}</div>
                      <div className="text-xs font-medium text-[#a3a3a3] mt-2">{delta} this week</div>
                    </div>
                  ))}
                </div>
                {/* Fake chart */}
                <div className="bg-[var(--bg-card)] rounded-lg p-5 border border-[var(--border)] h-48 flex items-end gap-1.5 overflow-hidden">
                  {[30, 50, 40, 70, 60, 80, 55, 75, 90, 65, 85, 100, 70, 95].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm border-t border-[var(--border-light)]" style={{ height: `${h}%`, background: `rgba(255, 255, 255, ${0.05 + Math.random() * 0.1})` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-[var(--bg-secondary)] border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Everything you need</h2>
            <p className="text-[var(--text-secondary)] font-medium max-w-xl mx-auto">
              BucketURL goes far beyond just shortening URLs. It&apos;s a complete link management platform for modern teams.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--border-light)] transition-all">
                <div className="w-10 h-10 rounded border border-[var(--border-light)] bg-white/5 flex items-center justify-center mb-5">
                  <Icon size={18} className="text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Showcase */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">Know your audience <br /><span className="text-[#a3a3a3]">inside and out</span></h2>
            <p className="text-[var(--text-secondary)] font-medium mb-8 leading-relaxed">
              Every click tells a story. Track geography, devices, browsers, referrers, and time-based patterns
              to understand exactly how your links perform.
            </p>
            {[
              { icon: TrendingUp, text: 'Real-time click tracking with daily trends' },
              { icon: Globe, text: 'Geographic breakdown by country and city' },
              { icon: Eye, text: 'Device, browser, and OS analytics' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4 mb-5">
                <div className="w-8 h-8 rounded border border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-white" />
                </div>
                <span className="text-sm font-medium text-white">{text}</span>
              </div>
            ))}
            <Link href="/signup" className="btn-secondary h-10 px-5 inline-flex mt-4 items-center gap-2">
              Start Tracking Clicks <ArrowRight size={14} />
            </Link>
          </div>
          {/* Mock analytics card */}
          <div className="space-y-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 shadow-lg">
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 border-b border-[var(--border)] pb-2">Click Trend — Last 30 Days</div>
              <div className="flex items-end gap-1.5 h-28">
                {[45, 60, 38, 72, 55, 80, 65, 90, 70, 85, 95, 78, 88, 100, 82, 92, 75, 88, 95, 83, 90, 78, 85, 92, 88, 95, 82, 90, 96, 100].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm border-t border-white/20" style={{ height: `${h}%`, background: `rgba(255,255,255,${0.05 + (h / 100) * 0.15})` }} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 shadow-lg">
                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 border-b border-[var(--border)] pb-2">Devices</div>
                {[['Desktop', '62%'], ['Mobile', '31%'], ['Tablet', '7%']].map(([d, p]) => (
                  <div key={d} className="flex justify-between items-center mb-2 last:mb-0">
                    <span className="text-sm text-[var(--text-secondary)]">{d}</span>
                    <span className="text-sm font-semibold text-white">{p}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 shadow-lg">
                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 border-b border-[var(--border)] pb-2">Top Countries</div>
                {[['United States', '4.2K'], ['United Kingdom', '1.8K'], ['Germany', '980']].map(([c, n]) => (
                  <div key={c} className="flex justify-between items-center mb-2 last:mb-0">
                    <span className="text-sm text-[var(--text-secondary)] truncate">{c}</span>
                    <span className="text-sm font-semibold text-white">{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-[var(--bg-secondary)] border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Simple, transparent pricing</h2>
            <p className="text-[var(--text-secondary)] font-medium max-w-lg mx-auto mb-10">
              Start free, scale as you grow. No hidden fees.
            </p>
            {/* Billing toggle */}
            <div className="inline-flex items-center p-1 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
              <button onClick={() => setBilling('monthly')} className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all ${billing === 'monthly' ? 'bg-white text-black' : 'text-[var(--text-secondary)] hover:text-white'}`}>
                Monthly
              </button>
              <button onClick={() => setBilling('yearly')} className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all ${billing === 'yearly' ? 'bg-white text-black' : 'text-[var(--text-secondary)] hover:text-white'}`}>
                Yearly <span className="text-[#a3a3a3] font-normal ml-1">-25%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`relative rounded-xl p-8 border transition-all duration-300 ${plan.popular ? 'border-white bg-[var(--bg-card)] shadow-2xl ring-1 ring-white/10' : 'border-[var(--border)] bg-[var(--bg)]'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-white text-[10px] font-bold text-black uppercase tracking-widest rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-[var(--text-muted)] font-medium">{plan.desc}</p>
                </div>
                <div className="mb-8 flex items-baseline">
                  <span className="text-5xl font-extrabold text-white tracking-tight">${plan.price[billing]}</span>
                  {plan.price[billing] > 0 && <span className="text-[var(--text-secondary)] font-medium ml-2">/ month</span>}
                </div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 border-b border-[var(--border)] pb-2">Features</p>
                  <ul className="space-y-4">
                    {plan.features.map(f => (
                      <li key={f.name} className={`flex items-start gap-3 text-sm font-medium ${f.included ? 'text-white' : 'text-[var(--text-muted)]'}`}>
                        {f.included ? (
                          <Check size={16} className="text-white flex-shrink-0 mt-0.5" />
                        ) : (
                          <XIcon size={16} className="text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
                        )}
                        <span className={f.included ? '' : 'line-through opacity-50'}>{f.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={plan.href} className={`w-full h-11 flex items-center justify-center font-semibold rounded-lg text-sm transition-colors ${plan.popular ? 'bg-white text-black hover:bg-[#e5e5e5]' : 'bg-transparent border border-[var(--border)] text-white hover:bg-white/5'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="border border-[var(--border)] bg-[var(--bg-card)] rounded-2xl p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">Ready to level up your links?</h2>
            <p className="text-lg text-[var(--text-secondary)] font-medium mb-10">Join thousands of professionals using BucketURL to manage their links with real data.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/signup" className="btn-primary h-12 px-8 text-base">
                Start Free Today
              </Link>
              <Link href="/login" className="btn-secondary h-12 px-8 text-base bg-[var(--bg)]">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)] py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded border border-[var(--border)] bg-black flex items-center justify-center">
              <Link2 size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">BucketURL</span>
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Built for professionals who take their links seriously.</p>
          <div className="flex gap-6">
            <Link href="#features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
