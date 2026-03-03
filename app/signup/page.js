'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import toast from 'react-hot-toast';
import { Link2, Mail, Lock, User, Eye, EyeOff, Chrome, ArrowRight, Loader2, Check } from 'lucide-react';

const PLAN_LABELS = { pro: 'Pro', team: 'Team' };

export default function SignUpPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-violet-500 animate-spin" />
            </div>
        }>
            <SignUpForm />
        </Suspense>
    );
}

function SignUpForm() {
    const { signUp, signInWithGoogle } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const planParam = searchParams.get('plan');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        setLoading(true);
        try {
            await signUp(email, password, name);
            toast.success('Account created! Welcome to BucketURL.');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err.message?.replace('Firebase: ', '') || 'Sign up failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            router.push('/dashboard');
        } catch (err) {
            toast.error('Google sign in failed');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative py-12" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, var(--bg) 60%)' }}>
            <div className="absolute inset-0 grid-bg opacity-50" />

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <img src="/logo.png" alt="BucketURL" className="w-10 h-10 object-contain" />
                        <span className="text-xl font-bold text-white">BucketURL</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {planParam ? `Start your ${PLAN_LABELS[planParam] || 'Pro'} trial` : 'Create your account'}
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)]">
                        {planParam ? 'Free for 14 days, then billed monthly.' : 'Free forever — no credit card required'}
                    </p>
                </div>

                {planParam && (
                    <div className="card border-violet-500/30 bg-violet-600/5 p-4 mb-4 flex items-center gap-3">
                        <Check size={16} className="text-violet-400 flex-shrink-0" />
                        <p className="text-sm text-[var(--text-secondary)]">
                            You&apos;ll be on the <span className="text-white font-medium">{PLAN_LABELS[planParam]}</span> plan. Upgrade anytime after signup.
                        </p>
                    </div>
                )}

                <div className="card p-8">
                    <button onClick={handleGoogle} disabled={googleLoading} className="btn-secondary w-full justify-center mb-5 py-2.5">
                        {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <Chrome size={16} />}
                        Continue with Google
                    </button>

                    <div className="relative mb-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--border)]" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-3 text-xs text-[var(--text-muted)] bg-[var(--bg-card)]">or with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Full name</label>
                            <div className="relative">
                                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" className="input-field pl-9" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email address</label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com" className="input-field pl-9" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min 8 characters" className="input-field pl-9 pr-9" />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors">
                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-[var(--text-muted)] mt-5">
                        By creating an account you agree to our{' '}
                        <span className="text-violet-400">Terms of Service</span> and{' '}
                        <span className="text-violet-400">Privacy Policy</span>.
                    </p>

                    <p className="text-center text-sm text-[var(--text-muted)] mt-4">
                        Already have an account?{' '}
                        <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
