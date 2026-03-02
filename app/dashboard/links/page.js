'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSearchParams } from 'next/navigation';
import {
    Link2, Plus, Search, Copy, ExternalLink, Trash2, QrCode,
    BarChart3, X, Loader2, Check, Lock, Clock, Tag, Globe, Settings, LockKeyhole
} from 'lucide-react';
import { formatNumber, buildShortUrl, formatDate, isValidUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

// CreateLinkModal Component
function CreateLinkModal({ onClose, onCreated, user, userPlan }) {
    const [step, setStep] = useState(1); // 1: URL, 2: Options, 3: OG
    const [saving, setSaving] = useState(false);
    const [expiryPreset, setExpiryPreset] = useState('always');
    const [form, setForm] = useState({
        originalUrl: '', title: '', customSlug: '',
        password: '', expiresAt: '',
        ogTitle: '', ogDescription: '', ogImage: '',
        utmSource: '', utmMedium: '', utmCampaign: '',
    });

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleCreate = async () => {
        if (!isValidUrl(form.originalUrl)) {
            toast.error('Please enter a valid URL');
            return;
        }
        setSaving(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    ...form,
                    expiresAt: form.expiresAt || null,
                    password: form.password || null,
                    customSlug: form.customSlug || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error || 'Failed to create link'); return; }
            toast.success('Link created!');
            onCreated(data.link);
            onClose();
        } catch {
            toast.error('Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const isPro = userPlan === 'pro' || userPlan === 'team';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-xl w-full max-w-lg shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-tight">Create Short Link</h2>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-1">Step {step} of 3</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] transition-colors"><X size={16} className="text-white" /></button>
                </div>

                {/* Step Indicator */}
                <div className="flex gap-1.5 px-5 pt-5 pb-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s === step ? 'bg-white' : s < step ? 'bg-[#525252]' : 'bg-[#262626]'}`} />
                    ))}
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto px-5 py-2 min-h-[300px]">
                    {/* Step 1: URL + Title */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Destination URL *</label>
                                <div className="relative">
                                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        type="url" value={form.originalUrl} onChange={e => set('originalUrl', e.target.value)}
                                        placeholder="https://example.com/your-long-url-here"
                                        className="input-field pl-9 h-11"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Internal Title</label>
                                <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                                    placeholder="e.g. Marketing Campaign 2024" className="input-field h-11" />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Options */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {!isPro && (
                                <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-start gap-3">
                                    <LockKeyhole size={16} className="text-[var(--text-muted)] mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-white mb-1">Unlock Advanced Options</p>
                                        <p className="text-xs font-medium text-[var(--text-secondary)] mb-3">Custom slugs, passwords, expiration dates, and UTMs require a Pro plan.</p>
                                        <Link href="/dashboard/billing" className="btn-secondary h-8 px-3 text-xs inline-flex hover:border-white">Upgrade Plan</Link>
                                    </div>
                                </div>
                            )}

                            <div className={!isPro ? 'opacity-50 pointer-events-none' : ''}>
                                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Tag size={12} /> Custom Slug
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[var(--text-muted)] flex-shrink-0">bkt.url/</span>
                                    <input type="text" value={form.customSlug} onChange={e => set('customSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        placeholder="my-custom-slug" className="input-field h-10" />
                                </div>
                            </div>

                            <div className={!isPro ? 'opacity-50 pointer-events-none' : ''}>
                                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Lock size={12} /> Password Protection
                                </label>
                                <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                                    placeholder="Leave empty for no password" className="input-field h-10" />
                            </div>

                            <div className={`space-y-3 ${!isPro ? 'opacity-50 pointer-events-none' : ''}`}>
                                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Clock size={12} /> Link Expiration
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: 'Always', val: 'always', days: null },
                                        { label: '5 Days', val: '5d', days: 5 },
                                        { label: '15 Days', val: '15d', days: 15 },
                                        { label: '1 Month', val: '1m', days: 30 },
                                        { label: 'Custom', val: 'custom', days: null }
                                    ].map(p => (
                                        <button
                                            key={p.val}
                                            onClick={() => {
                                                setExpiryPreset(p.val);
                                                if (p.val === 'always') set('expiresAt', '');
                                                else if (p.days) {
                                                    const d = new Date();
                                                    d.setDate(d.getDate() + p.days);
                                                    set('expiresAt', d.toISOString().slice(0, 16));
                                                }
                                            }}
                                            className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider border transition-colors ${expiryPreset === p.val ? 'bg-white text-black border-white' : 'bg-transparent text-[var(--text-muted)] border-[var(--border)] hover:text-white'}`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                                {expiryPreset === 'custom' && (
                                    <input type="datetime-local" value={form.expiresAt} onChange={e => { set('expiresAt', e.target.value); setExpiryPreset('custom'); }} className="input-field h-10 mt-2" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: OpenGraph */}
                    {step === 3 && (
                        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <p className="text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg)] p-3 rounded border border-[var(--border)] border-l-2 border-l-white">
                                Control how this link looks when shared on social media like Twitter and LinkedIn.
                            </p>
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Custom Title (OG)</label>
                                <input type="text" value={form.ogTitle} onChange={e => set('ogTitle', e.target.value)}
                                    placeholder="Enter title" className="input-field h-10" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Custom Description (OG)</label>
                                <textarea value={form.ogDescription} onChange={e => set('ogDescription', e.target.value)}
                                    placeholder="Enter description..." rows={2} className="input-field resize-none py-2" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Image URL (OG)</label>
                                <input type="url" value={form.ogImage} onChange={e => set('ogImage', e.target.value)}
                                    placeholder="https://example.com/og-image.png" className="input-field h-10" />
                            </div>
                            {/* OG Preview */}
                            {(form.ogTitle || form.ogDescription || form.ogImage) && (
                                <div className="rounded border border-[var(--border)] overflow-hidden mt-4 shadow-sm">
                                    {form.ogImage ? <div className="h-32 bg-cover bg-center border-b border-[var(--border)]" style={{ backgroundImage: `url(${form.ogImage})` }} /> : <div className="h-32 bg-[var(--bg)] border-b border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-widest">No Image</div>}
                                    <div className="p-3 bg-[var(--bg-secondary)]">
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">bucketurl.app</p>
                                        <p className="text-sm font-bold text-white truncate">{form.ogTitle || 'Link Title'}</p>
                                        <p className="text-xs font-medium text-[var(--text-secondary)] mt-1 line-clamp-2">{form.ogDescription || 'No description provided'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-5 border-t border-[var(--border)] bg-[var(--bg)] rounded-b-xl">
                    <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="btn-secondary h-10 px-4">
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>
                    {step < 3 ? (
                        <button onClick={() => setStep(step + 1)} disabled={step === 1 && !form.originalUrl} className="btn-primary h-10 px-6">
                            Next
                        </button>
                    ) : (
                        <button onClick={handleCreate} disabled={saving} className="btn-primary h-10 px-6">
                            {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                            {saving ? 'Creating...' : 'Create Link'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// QR Modal
function QRModal({ link, onClose }) {
    const shortUrl = buildShortUrl(link.shortCode);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 text-center animate-fade-in-up shadow-2xl max-w-sm w-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-white truncate pr-4">{link.title || 'Untitled'}</h3>
                    <button onClick={onClose} className="p-1.5 rounded hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] transition-colors"><X size={16} className="text-white" /></button>
                </div>
                <div className="p-4 bg-white rounded-lg inline-block mb-6 shadow-sm border border-[var(--border)]">
                    <QRCodeSVG value={shortUrl} size={180} fgColor="#000000" />
                </div>
                <div className="bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 flex items-center justify-between mb-6">
                    <p className="text-xs font-bold text-[var(--text-secondary)] truncate">{shortUrl}</p>
                    <button onClick={() => { navigator.clipboard.writeText(shortUrl); toast.success('URL copied!'); }} className="text-white hover:text-[#d4d4d4] transition-colors ml-2">
                        <Copy size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main Page
export default function LinksPage() {
    return (
        <Suspense fallback={
            <div className="p-6 md:p-8 space-y-4 max-w-6xl mx-auto">
                <div className="skeleton h-10 w-full rounded-md mb-6" />
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-20 rounded-lg" />)}
            </div>
        }>
            <LinksList />
        </Suspense>
    );
}

function LinksList() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(searchParams.get('new') === 'true');
    const [qrLink, setQrLink] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [userPlan, setUserPlan] = useState('free');

    const fetchLinks = useCallback(async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/links?search=${search}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setLinks(data.links || []);

            // Also fetch user plan for gating features
            const uRes = await fetch('/api/users', { headers: { 'x-user-id': user.uid, Authorization: `Bearer ${token}` } });
            const uData = await uRes.json();
            if (uData.user) setUserPlan(uData.user.plan || 'free');

        } catch { toast.error('Failed to load links'); }
        finally { setLoading(false); }
    }, [user, search]);

    useEffect(() => { fetchLinks(); }, [fetchLinks]);

    const handleDelete = async (id) => {
        if (!confirm('Delete this link? This cannot be undone.')) return;
        setDeleting(id);
        try {
            const token = await user.getIdToken();
            await fetch(`/api/links/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            setLinks(l => l.filter(x => x.id !== id));
            toast.success('Link deleted');
        } catch { toast.error('Delete failed'); }
        finally { setDeleting(null); }
    };

    const copyLink = async (slug) => {
        await navigator.clipboard.writeText(buildShortUrl(slug));
        toast.success('Copied!');
    };

    if (loading) return (
        <div className="p-6 md:p-8 space-y-4 max-w-6xl mx-auto">
            <div className="skeleton h-10 w-full rounded-md mb-6" />
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-20 rounded-lg" />)}
        </div>
    );

    return (
        <div className="p-6 md:p-8 animate-fade-in max-w-6xl mx-auto">
            {showCreate && <CreateLinkModal onClose={() => setShowCreate(false)} onCreated={l => setLinks([l, ...links])} user={user} userPlan={userPlan} />}
            {qrLink && <QRModal link={qrLink} onClose={() => setQrLink(null)} />}

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">My Links</h1>
                    <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">{links.length} link{links.length !== 1 ? 's' : ''} total</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn-primary h-9 px-4"><Plus size={15} /> New Link</button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by title, URL, or slug..."
                    className="input-field pl-10 h-11 bg-[var(--bg-secondary)]" />
            </div>

            {/* Links List */}
            {links.length === 0 ? (
                <div className="card text-center py-16 border border-[var(--border)] shadow-sm">
                    <div className="w-12 h-12 rounded-full border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center mx-auto mb-5">
                        <Link2 size={20} className="text-[var(--text-muted)]" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">
                        {search ? 'No links match your search' : 'No links yet'}
                    </h3>
                    <p className="text-sm font-medium text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
                        {search ? 'Try a different search term.' : 'Create your first short link and start tracking clicks.'}
                    </p>
                    {!search && (
                        <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto h-10 px-6">
                            <Plus size={16} /> Create Link
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {links.map(link => (
                        <div key={link.id} className="card flex items-center gap-4 hover:border-white transition-colors p-4 group border border-[var(--border)] bg-[var(--bg-secondary)]">
                            {/* Icon */}
                            <div className="w-10 h-10 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center flex-shrink-0">
                                <Link2 size={16} className="text-white" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-bold text-white truncate">{link.title || 'Untitled Link'}</p>
                                    {link.password && <Lock size={12} className="text-[var(--text-secondary)] flex-shrink-0" title="Password Protected" />}
                                    {link.expiresAt && <Clock size={12} className="text-[var(--text-secondary)] flex-shrink-0" title="Expires" />}
                                </div>
                                <div className="flex items-center gap-3">
                                    <a href={buildShortUrl(link.shortCode)} target="_blank" rel="noreferrer"
                                        className="text-xs font-bold text-white hover:text-[#d4d4d4] transition-colors flex items-center gap-1">
                                        bkt.url/{link.shortCode} <ExternalLink size={10} />
                                    </a>
                                    <span className="text-[var(--text-muted)] text-[10px]">•</span>
                                    <p className="text-xs font-medium text-[var(--text-muted)] truncate">{link.originalUrl}</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="text-right flex-shrink-0 hidden sm:block pr-4 border-r border-[var(--border)]">
                                <p className="text-base font-bold text-white">{formatNumber(link.totalClicks || 0)}</p>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">clicks</p>
                            </div>

                            {/* Date */}
                            <div className="text-right flex-shrink-0 hidden lg:block pr-4">
                                <p className="text-xs font-bold text-[var(--text-secondary)]">{formatDate(link.createdAt)}</p>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Created</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 flex-shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity ml-2">
                                <button onClick={() => copyLink(link.shortCode)} className="p-2 rounded border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-secondary)] hover:text-white transition-all flex items-center gap-1.5" title="Copy">
                                    <Copy size={13} /> <span className="text-xs font-bold hidden xl:block">Copy</span>
                                </button>
                                <button onClick={() => setQrLink(link)} className="p-2 rounded border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-secondary)] hover:text-white transition-all" title="QR Code">
                                    <QrCode size={13} />
                                </button>
                                <Link href={`/dashboard/links/${link.id}`} className="p-2 rounded border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-secondary)] hover:text-white transition-all" title="Analytics">
                                    <BarChart3 size={13} />
                                </Link>
                                <button onClick={() => handleDelete(link.id)} disabled={deleting === link.id} className="p-2 rounded border border-transparent hover:border-red-500/30 hover:bg-red-500/5 text-[var(--text-secondary)] hover:text-red-400 transition-all" title="Delete">
                                    {deleting === link.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
