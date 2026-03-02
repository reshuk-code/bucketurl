'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useState } from 'react';
import {
    LayoutDashboard, Link2, BarChart3, Users, Settings, CreditCard,
    ChevronDown, LogOut, Plus, Menu, X, Zap
} from 'lucide-react';

const NAV = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/links', label: 'My Links', icon: Link2 },
    { href: '/dashboard/teams', label: 'Teams', icon: Users },
];

const PLAN_BADGE = {
    free: <span className="badge-gray">Free</span>,
    pro: <span className="badge-violet">Pro</span>,
    team: <span className="badge-green">Team</span>,
};

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    const avatarUrl = user?.photoURL || null;
    const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
    const email = user?.email || '';

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 py-6 border-b border-[var(--border)]">
                <div className="w-7 h-7 rounded border border-[var(--border-light)] bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Link2 size={14} className="text-white" />
                </div>
                <span className="text-sm font-bold text-white tracking-tight">BucketURL</span>
            </div>

            {/* New Link CTA */}
            <div className="px-3 py-4">
                <Link href="/dashboard/links?new=true" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center text-sm py-2 bg-white text-black hover:bg-[#e5e5e5]">
                    <Plus size={16} className="mr-1" /> New Link
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 pb-4 space-y-0.5">
                {NAV.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                    return (
                        <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                            className={active ? 'sidebar-link-active' : 'sidebar-link'}>
                            <Icon size={16} className={active ? 'text-white' : ''} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="px-3 pb-4 border-t border-[var(--border)] pt-4">
                <div className="relative">
                    <button onClick={() => setProfileOpen(!profileOpen)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-left">
                        <div className="w-8 h-8 rounded bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden">
                            {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : displayName[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{displayName}</p>
                            <p className="text-xs text-[var(--text-muted)] truncate">{email}</p>
                        </div>
                        <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profileOpen && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-2xl z-50 overflow-hidden py-1">
                            <div className="px-4 py-2 border-b border-[var(--border)] mb-1">
                                <p className="text-xs font-medium text-[var(--text-muted)]">Signed in as</p>
                                <p className="text-sm font-bold text-white truncate">{email}</p>
                            </div>
                            <Link href="/dashboard/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-white transition-colors">
                                <Settings size={14} /> Settings
                            </Link>
                            <Link href="/dashboard/billing" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-white transition-colors">
                                <CreditCard size={14} /> Billing
                            </Link>
                            <div className="h-px bg-[var(--border)] my-1" />
                            <button onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                                <LogOut size={14} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[var(--bg)] overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-56 flex-shrink-0 border-r border-[var(--border)] bg-[var(--bg-secondary)]">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
                    <aside className="relative w-56 h-full bg-[var(--bg-secondary)] border-r border-[var(--border)]">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main */}
            <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
                {/* Mobile Top Bar */}
                <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[var(--text-secondary)] hover:text-white">
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-violet-600" />
                        <span className="font-semibold text-white text-sm">BucketURL</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
