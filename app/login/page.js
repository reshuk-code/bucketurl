'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import toast from 'react-hot-toast';
import { Link2, Mail, Lock, Eye, EyeOff, Chrome, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { signIn, signInWithGoogle } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return;
        setLoading(true);
        try {
            await signIn(email, password);
            router.push('/dashboard');
        } catch (err) {
            toast.error(err.message?.replace('Firebase: ', '') || 'Sign in failed');
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
        <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, var(--bg) 60%)' }}>
            {/* Background grid */}
            <div className="absolute inset-0 grid-bg opacity-50" />

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
                            <Link2 size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">BucketURL</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
                    <p className="text-sm text-[var(--text-secondary)]">Sign in to your account to continue</p>
                </div>

                <div className="card p-8">
                    {/* Google */}
                    <button onClick={handleGoogle} disabled={googleLoading} className="btn-secondary w-full justify-center mb-5 py-2.5">
                        {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <Chrome size={16} />}
                        Continue with Google
                    </button>

                    <div className="relative mb-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--border)]" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-3 text-xs text-[var(--text-muted)] bg-[var(--bg-card)]">or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email address</label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="you@company.com"
                                    className="input-field pl-9"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-medium text-[var(--text-secondary)]">Password</label>
                                <Link href="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="input-field pl-9 pr-9"
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors">
                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[var(--text-muted)] mt-6">
                        No account?{' '}
                        <Link href="/signup" className="text-violet-400 hover:text-violet-300 font-medium">
                            Create one free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
