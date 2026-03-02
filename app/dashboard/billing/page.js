'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Check, X as XIcon, Loader2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = [
    {
        name: 'Free',
        price: { monthly: 0, yearly: 0 },
        desc: 'Personal & hobby use',
        features: [
            { name: '25 short links', included: true },
            { name: '7-day analytics', included: true },
            { name: 'Basic click tracking', included: true },
            { name: 'QR codes', included: true },
            { name: 'Unlimited links', included: false },
            { name: '365-day analytics', included: false },
            { name: 'Custom slugs', included: false },
            { name: 'Custom OpenGraph', included: false },
            { name: 'Password protection', included: false },
            { name: 'Team collaboration', included: false },
            { name: 'API access', included: false },
        ],
        cta: 'Current Plan',
        plan: 'free',
    },
    {
        name: 'Pro',
        price: { monthly: 12, yearly: 9 },
        monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY || 'price_1T3Lu9B4M3AbgFMQ0WsheKAm',
        yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY || 'price_1T3LwZB4M3AbgFMQguefyanv',
        desc: 'For power users & teams',
        features: [
            { name: 'Unlimited short links', included: true },
            { name: '365-day analytics', included: true },
            { name: 'Advanced click tracking', included: true },
            { name: 'QR codes', included: true },
            { name: 'Custom slugs', included: true },
            { name: 'Custom OpenGraph', included: true },
            { name: 'Password protection & Expiry', included: true },
            { name: 'Team collaboration (up to 10)', included: true },
            { name: 'API access', included: true },
            { name: 'Priority support', included: true },
        ],
        cta: 'Upgrade to Pro',
        plan: 'pro',
        popular: true,
    }
];

export default function BillingPage() {
    const { user } = useAuth();
    const [userPlan, setUserPlan] = useState('free');
    const [billing, setBilling] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const res = await fetch('/api/users', { headers: { 'x-user-id': user.uid, Authorization: `Bearer ${token}` } });
                const data = await res.json();
                setUserPlan(data.user?.plan === 'team' ? 'pro' : (data.user?.plan || 'free'));
            } catch { } finally { setLoading(false); }
        };
        fetchUser();
    }, [user]);

    const handleCheckout = async (plan) => {
        if (!user) return;
        const priceId = billing === 'monthly' ? plan.monthlyPriceId : plan.yearlyPriceId;
        setCheckoutLoading(plan.plan);
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ priceId, plan: plan.plan }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
            else toast.error(data.error || 'Checkout failed');
        } catch { toast.error('Something went wrong'); }
        finally { setCheckoutLoading(null); }
    };

    return (
        <div className="p-6 animate-fade-in max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Billing & Plan</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Manage your subscription and feature access</p>
            </div>

            {/* Current Plan */}
            <div className="card mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <CreditCard size={18} className="text-white" />
                    <h2 className="text-sm font-semibold text-white">Current Plan</h2>
                </div>
                <div className="flex items-center justify-between mt-3">
                    <div>
                        <p className="text-2xl font-bold text-white capitalize">{userPlan}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            {userPlan === 'free' ? '25 links, 7-day analytics, basic features' : 'Unlimited links, teams, priority features'}
                        </p>
                    </div>
                    {userPlan !== 'free' && (
                        <button onClick={() => toast('Redirecting to customer portal...')} className="btn-secondary text-xs">
                            Manage Subscription
                        </button>
                    )}
                </div>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-white">Choose a Plan</h2>
                <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                    {['monthly', 'yearly'].map(b => (
                        <button key={b} onClick={() => setBilling(b)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${billing === b ? 'bg-white text-black' : 'text-[var(--text-secondary)] hover:text-white'}`}>
                            {b} {b === 'yearly' && <span className="text-[#a3a3a3] ml-1">-25%</span>}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {PLANS.map(plan => {
                    const isCurrent = plan.plan === userPlan;
                    return (
                        <div key={plan.name} className={`relative rounded-xl p-6 border transition-all ${isCurrent ? 'border-white bg-[var(--bg-card)] ring-1 ring-white/10' : 'border-[var(--border)] bg-[var(--bg-secondary)]'}`}>
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-white rounded-full text-[10px] font-bold text-black uppercase tracking-widest">
                                    Popular
                                </div>
                            )}
                            {isCurrent && (
                                <div className="absolute -top-3 right-6 px-3 py-0.5 bg-[#2e2e2e] border border-[var(--border-light)] rounded-full text-xs font-semibold text-white">
                                    Current Plan
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                            <p className="text-sm text-[var(--text-muted)] mb-5">{plan.desc}</p>
                            <div className="mb-6 flex items-baseline">
                                <span className="text-4xl font-extrabold text-white">${plan.price[billing]}</span>
                                {plan.price[billing] > 0 && <span className="text-[var(--text-muted)] text-sm ml-1">/ mo</span>}
                            </div>

                            <div className="mb-8 overflow-hidden">
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 border-b border-[var(--border-light)] pb-2">Features</p>
                                <ul className="space-y-3">
                                    {plan.features.map(f => (
                                        <li key={f.name} className={`flex items-start gap-3 text-sm ${f.included ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                                            {f.included ? (
                                                <Check size={16} className="text-white flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <XIcon size={16} className="text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
                                            )}
                                            <span className={f.included ? 'font-medium' : 'line-through opacity-50'}>{f.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {isCurrent ? (
                                <button className="btn-secondary w-full justify-center text-sm py-2.5 opacity-50 cursor-default" disabled>
                                    Active Plan
                                </button>
                            ) : (
                                <button onClick={() => plan.plan !== 'free' && handleCheckout(plan)} disabled={checkoutLoading === plan.plan || plan.plan === 'free'}
                                    className={`w-full justify-center text-sm py-2.5 transition-colors ${plan.popular ? 'bg-white text-black hover:bg-[#e5e5e5]' : 'bg-transparent border border-[var(--border)] text-white hover:bg-white/5'} rounded-lg font-medium flex items-center gap-2`}>
                                    {checkoutLoading === plan.plan && <Loader2 size={16} className="animate-spin" />}
                                    {checkoutLoading === plan.plan ? 'Redirecting...' : plan.cta}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
