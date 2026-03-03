'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { User, Mail, Bell, Key, Trash2, Save, Loader2, Copy, RefreshCw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateSlug } from '@/lib/utils';
import Link from 'next/link';

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [saving, setSaving] = useState(false);
    const [userPlan, setUserPlan] = useState('free');

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            const stored = localStorage.getItem(`bkt_api_key_${user.uid}`);
            setApiKey(stored || '');

            // Try fetching user plan
            user.getIdToken().then(token => {
                fetch('/api/users', { headers: { 'x-user-id': user.uid, Authorization: `Bearer ${token}` } })
                    .then(res => res.json())
                    .then(data => {
                        if (data.user) setUserPlan(data.user.plan || 'free');
                    }).catch(() => { });
            }).catch(() => { });
        }
    }, [user]);

    const generateApiKey = () => {
        const key = `bkt_${generateSlug(12)}_${generateSlug(12)}`;
        setApiKey(key);
        if (user) localStorage.setItem(`bkt_api_key_${user.uid}`, key);
        toast.success('New API key generated!');
    };

    const copyApiKey = async () => {
        await navigator.clipboard.writeText(apiKey);
        toast.success('API key copied!');
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 800)); // Simulate save
        setSaving(false);
        toast.success('Settings saved!');
    };

    const isPro = userPlan === 'pro' || userPlan === 'team';

    return (
        <div className="p-6 md:p-8 animate-fade-in max-w-3xl space-y-8 mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">Manage your account preferences</p>
            </div>

            {/* Profile */}
            <div className="card space-y-6">
                <div className="flex items-center gap-2 mb-4 border-b border-[var(--border)] pb-4">
                    <User size={16} className="text-white" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Profile</h2>
                </div>

                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center text-xl font-bold text-white flex-shrink-0 overflow-hidden">
                        {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : displayName[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="text-base font-bold text-white">{displayName || 'User'}</p>
                        <p className="text-sm font-medium text-[var(--text-muted)]">{user?.email}</p>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <div>
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Display Name</label>
                        <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                            placeholder="Your name" className="input-field" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Email Address</label>
                        <div className="relative">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input type="email" value={user?.email || ''} disabled className="input-field pl-9 opacity-50 cursor-not-allowed bg-[var(--bg-secondary)]" />
                        </div>
                        <p className="text-xs font-medium text-[var(--text-muted)] mt-2">Email cannot be changed here.</p>
                    </div>
                </div>

                <div className="pt-2">
                    <button onClick={handleSave} disabled={saving} className="btn-primary h-10 px-6">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* API Key */}
            <div className={`card space-y-6 ${!isPro ? 'opacity-80' : ''}`}>
                <div className="flex items-center gap-2 mb-4 border-b border-[var(--border)] pb-4">
                    <Key size={16} className="text-white" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">API Access</h2>
                    {!isPro && <span className="badge-gray ml-2">Pro</span>}
                </div>

                <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">Use your API key to access BucketURL programmatically. Keep it secret.</p>

                {!isPro ? (
                    <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-center">
                        <Key size={20} className="mx-auto text-[var(--text-muted)] mb-3" />
                        <p className="text-sm font-bold text-white mb-1">Developer API is only available on Pro. Get it now →</p>
                        <p className="text-xs font-medium text-[var(--text-secondary)] mb-4">Unlimited API access to automate your link generation workflow.</p>
                        <Link href="/dashboard/billing" className="btn-primary inline-flex h-9 px-4 text-xs">Upgrade Plan</Link>
                    </div>
                ) : apiKey ? (
                    <div>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <input type="password" value={apiKey} readOnly className="input-field font-mono text-sm pr-10 bg-[var(--bg-secondary)]" />
                            </div>
                            <button onClick={copyApiKey} className="btn-secondary h-10 px-4 hover:border-white transition-colors"><Copy size={16} /></button>
                            <button onClick={generateApiKey} className="btn-secondary h-10 px-4 hover:border-white transition-colors"><RefreshCw size={16} /></button>
                        </div>
                        <p className="text-xs font-bold text-red-400 mt-3 flex items-center gap-1.5 whitespace-nowrap"><AlertTriangle size={12} /> Never share your API key. Regenerating will invalidate the current key.</p>
                    </div>
                ) : (
                    <button onClick={generateApiKey} className="btn-secondary h-10 px-6">
                        <Key size={14} className="mr-1" /> Generate API Key
                    </button>
                )}
            </div>

            {/* Notifications */}
            <div className="card space-y-6">
                <div className="flex items-center gap-2 mb-4 border-b border-[var(--border)] pb-4">
                    <Bell size={16} className="text-white" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Notifications</h2>
                </div>

                <div className="space-y-4">
                    {[
                        ['Weekly analytics digest', true],
                        ['Link click milestones', true],
                        ['Team invitations', true],
                        ['Product updates', false],
                    ].map(([label, defaultOn]) => (
                        <div key={label} className="flex items-center justify-between p-3 rounded-md border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-card)] transition-colors">
                            <span className="text-sm font-bold text-[var(--text-secondary)]">{label}</span>
                            <div className="relative inline-block w-8 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id={label} defaultChecked={defaultOn} className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer border-[var(--border)] transition-all checked:right-0 checked:border-white checked:bg-black" style={{ right: defaultOn ? '0' : '1rem' }} onChange={(e) => {
                                    e.target.style.right = e.target.checked ? '0' : '1rem';
                                    e.target.style.borderColor = e.target.checked ? 'white' : 'var(--border)';
                                    e.target.style.backgroundColor = e.target.checked ? 'black' : 'white';
                                }} />
                                <label htmlFor={label} className="toggle-label block overflow-hidden h-4 rounded-full bg-[var(--bg)] cursor-pointer" style={{ backgroundColor: defaultOn ? 'white' : 'var(--bg)' }} onClick={(e) => {
                                    const input = e.target.previousElementSibling;
                                    e.target.style.backgroundColor = !input.checked ? 'white' : 'var(--bg)';
                                }}></label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="card border-red-500/20 space-y-5 bg-red-500/5">
                <div className="flex items-center gap-2 mb-2 border-b border-red-500/20 pb-4">
                    <Trash2 size={16} className="text-red-400" />
                    <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider">Danger Zone</h2>
                </div>
                <p className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">These actions are permanent and cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={() => { if (confirm('Sign out of all sessions?')) signOut(); }} className="px-5 py-2.5 rounded bg-transparent text-xs font-bold border border-red-500/30 text-red-400 hover:bg-red-500 text-white hover:text-white transition-all hover:border-red-500">
                        Sign Out All Sessions
                    </button>
                    <button onClick={() => toast.error('Please contact support to delete your account.')} className="px-5 py-2.5 rounded bg-transparent text-xs font-bold border border-red-500/30 text-red-400 hover:bg-red-500 text-white hover:text-white transition-all hover:border-red-500">
                        Delete Account
                    </button>
                </div>
            </div>

            <style jsx>{`
                .toggle-checkbox:checked { right: 0; border-color: #fff; background-color: #000; }
                .toggle-checkbox:checked + .toggle-label { background-color: #fff; }
            `}</style>
        </div>
    );
}
