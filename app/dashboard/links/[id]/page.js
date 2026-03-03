'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Copy, ExternalLink, BarChart3,
    Monitor, Smartphone, Tablet, TrendingUp, Zap, Lock, QrCode,
    Clock, Link2, Share2, Globe, Send, MessageCircle, AtSign
} from 'lucide-react';
import { formatNumber, buildShortUrl, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';

// --- Sub-components ---

const ChartTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-[#111] border border-[var(--border)] rounded-lg px-3 py-2 text-xs shadow-xl">
                <p className="text-[var(--text-muted)] mb-0.5">{label}</p>
                <p className="text-white font-bold">{payload[0].value} clicks</p>
            </div>
        );
    }
    return null;
};

// Clean text abbreviations for traffic sources — NO emojis
const SOURCE_LABELS = {
    'Twitter / X': 'X',
    'Facebook': 'Fb',
    'Instagram': 'Ig',
    'LinkedIn': 'Li',
    'YouTube': 'Yt',
    'Reddit': 'Rd',
    'WhatsApp': 'Wa',
    'Telegram': 'Tg',
    'Google': 'G',
    'Direct': '—',
    'TikTok': 'Tk',
    'Discord': 'Dc',
    'Bing': 'Bg',
    'DuckDuckGo': 'Dk',
    'GitHub': 'Gh',
};

const DEVICE_ICONS = { Mobile: Smartphone, Desktop: Monitor, Tablet };


function StatCard({ label, value, sub, icon: Icon }) {
    return (
        <div className="card flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{label}</span>
                {Icon && (
                    <div className="w-7 h-7 rounded-md border border-[var(--border)] flex items-center justify-center">
                        <Icon size={13} className="text-[var(--text-muted)]" />
                    </div>
                )}
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
            {sub && <div className="text-[11px] text-[var(--text-muted)]">{sub}</div>}
        </div>
    );
}

function ProgressRow({ label, value, total, abbr, Icon }) {
    const pct = total ? Math.round((value / total) * 100) : 0;
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center bg-[var(--bg)] border border-[var(--border)] rounded flex-shrink-0">
                        {Icon
                            ? <Icon size={10} className="text-[var(--text-muted)]" />
                            : <span className="text-[9px] font-bold text-[var(--text-muted)] leading-none">{abbr}</span>
                        }
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] font-medium">{label}</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-white tabular-nums">{formatNumber(value)}</span>
                    <span className="text-[10px] text-[var(--text-muted)] tabular-nums w-8 text-right">{pct}%</span>
                </div>
            </div>
            <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                    className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

// --- Main Page ---

export default function LinkDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();

    const [link, setLink] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [campaignData, setCampaignData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(7);
    const [userPlan, setUserPlan] = useState('free');
    const [qrOpen, setQrOpen] = useState(false);
    const [proExpanded, setProExpanded] = useState(false);

    const isPro = userPlan === 'pro' || userPlan === 'team';
    const allowedDaysOptions = isPro ? [7, 14, 30, 90] : [7];
    const effectiveDays = isPro ? days : 7;

    const fetchData = useCallback(async () => {
        if (!user || !id) return;
        try {
            const token = await user.getIdToken();
            const tzOffset = new Date().getTimezoneOffset();
            const [linkRes, analyticsRes, userRes] = await Promise.all([
                fetch(`/api/links/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/analytics/${id}?days=${effectiveDays}&tzOffset=${tzOffset}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/users', { headers: { 'x-user-id': user.uid, Authorization: `Bearer ${token}` } }),
            ]);
            const linkData = await linkRes.json();
            const analyticsData = await analyticsRes.json();
            const userData = await userRes.json();

            if (linkRes.ok) {
                const l = linkData.link;
                setLink(l);
                // If this link has a campaign tag, fetch cross-link comparison
                if (l?.utmCampaign) {
                    fetch(`/api/analytics/campaign?campaign=${encodeURIComponent(l.utmCampaign)}`, { headers: { Authorization: `Bearer ${token}` } })
                        .then(r => r.json()).then(d => setCampaignData(d)).catch(() => { });
                }
            } else { toast.error('Link not found'); router.push('/dashboard/links'); return; }
            if (analyticsRes.ok) setAnalytics(analyticsData);
            if (userRes.ok) setUserPlan(userData.user?.plan || 'free');
        } catch { toast.error('Failed to load analytics'); }
        finally { setLoading(false); }
    }, [user, id, effectiveDays, router]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const copyLink = async () => {
        await navigator.clipboard.writeText(buildShortUrl(link.shortCode));
        toast.success('Copied!');
    };

    if (loading) {
        return (
            <div className="p-6 md:p-8 space-y-5 max-w-5xl mx-auto">
                <div className="skeleton h-7 w-48 rounded-md" />
                <div className="skeleton h-28 rounded-xl" />
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
                </div>
                <div className="skeleton h-56 rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="skeleton h-48 rounded-xl" />
                    <div className="skeleton h-48 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!link) return null;

    const shortUrl = buildShortUrl(link.shortCode);
    const dailyAvg = analytics ? Math.round((analytics.totalClicks || 0) / effectiveDays) : 0;
    const hasUtm = link.utmSource || link.utmMedium || link.utmCampaign;

    return (
        <div className="p-6 md:p-8 space-y-5 max-w-5xl mx-auto animate-fade-in">

            {/* ── Back Button ── */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white transition-colors"
            >
                <ArrowLeft size={14} /> Back to Links
            </button>

            {/* ── Hero Header ── */}
            <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-11 h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center flex-shrink-0">
                    <Link2 size={18} className="text-white" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-base font-bold text-white tracking-tight truncate">
                            {link.title || 'Untitled Link'}
                        </h1>
                        {link.password && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-400">
                                <Lock size={8} /> Protected
                            </span>
                        )}
                        {link.expiresAt && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-[var(--border)] text-[var(--text-muted)]">
                                <Clock size={8} /> Expires {formatDate(link.expiresAt)}
                            </span>
                        )}
                        {hasUtm && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-violet-500/30 bg-violet-500/10 text-violet-400">
                                UTM Tagged
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <a
                            href={shortUrl}
                            target="_blank" rel="noreferrer"
                            className="text-xs font-bold text-white hover:text-[var(--text-secondary)] flex items-center gap-1 transition-colors"
                        >
                            {shortUrl} <ExternalLink size={10} />
                        </a>
                        <span className="text-[var(--text-muted)] text-[10px]">•</span>
                        <p className="text-[11px] text-[var(--text-muted)] truncate max-w-xs">{link.originalUrl}</p>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">Created {formatDate(link.createdAt)}</p>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={copyLink} className="btn-secondary text-xs h-8 px-3">
                        <Copy size={12} /> Copy
                    </button>
                    <a href={shortUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs h-8 px-3">
                        <ExternalLink size={12} /> Visit
                    </a>
                    {isPro ? (
                        <button onClick={() => setQrOpen(true)} className="btn-secondary text-xs h-8 px-3">
                            <QrCode size={12} /> QR
                        </button>
                    ) : (
                        <button
                            className="btn-secondary text-xs h-8 px-3 opacity-50 cursor-not-allowed"
                            onClick={() => toast((rt) => (
                                <div onClick={() => { toast.dismiss(rt.id); router.push('/dashboard/billing'); }} className="flex items-center gap-3 cursor-pointer">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                                        <Zap size={16} className="text-amber-400 fill-amber-400" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 text-left">
                                        <p className="text-xs font-bold text-white">QR Codes are a Pro feature</p>
                                        <p className="text-[10px] text-amber-200/60 font-medium">Upgrade now →</p>
                                    </div>
                                </div>
                            ), { duration: 5000, style: { background: '#16161f', border: '1px solid #ebad1a33', padding: '12px', borderRadius: '12px' } })}
                        >
                            <Lock size={12} /> QR
                        </button>
                    )}
                </div>
            </div>

            {/* ── Time Range Filter ── */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mr-1">Range</span>
                <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg">
                    {allowedDaysOptions.map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${effectiveDays === d ? 'bg-white text-black shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'}`}
                        >
                            {d}d
                        </button>
                    ))}
                </div>
                {!isPro && (
                    <Link href="/dashboard/billing" className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 transition-colors font-semibold">
                        <Lock size={9} /> Unlock 90-day history
                    </Link>
                )}
            </div>

            {/* ── UTM Campaign Performance (only shown when link has UTM tags) ── */}
            {hasUtm && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-violet-500/10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                                <TrendingUp size={14} className="text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">UTM Campaign Performance</p>
                                <p className="text-[11px] text-violet-300/60 mt-0.5">Clicks attributed to this specific campaign tag</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-white">{formatNumber(link.totalClicks || 0)}</p>
                            <p className="text-[10px] text-violet-300/60">total attributed clicks</p>
                        </div>
                    </div>

                    {/* UTM Tag Pills */}
                    <div className="px-5 py-4 flex flex-wrap gap-2 border-b border-violet-500/10">
                        {link.utmSource && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">source</span>
                                <span className="text-[11px] font-bold text-white">{link.utmSource}</span>
                            </div>
                        )}
                        {link.utmMedium && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">medium</span>
                                <span className="text-[11px] font-bold text-white">{link.utmMedium}</span>
                            </div>
                        )}
                        {link.utmCampaign && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-violet-500/20">
                                <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">campaign</span>
                                <span className="text-[11px] font-bold text-white">{link.utmCampaign}</span>
                            </div>
                        )}
                    </div>

                    {/* Campaign Comparison — multiple links with same campaign */}
                    {campaignData?.links?.length > 1 && (
                        <div className="px-5 py-4">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">
                                All links in &quot;{link.utmCampaign}&quot; campaign
                            </p>
                            <div className="space-y-2">
                                {campaignData.links.map(cl => {
                                    const pct = campaignData.total ? Math.round((cl.totalClicks / campaignData.total) * 100) : 0;
                                    const isCurrentLink = cl.id === id;
                                    return (
                                        <div key={cl.id} className={`rounded-lg p-3 border transition-colors ${isCurrentLink
                                            ? 'bg-white/5 border-white/15'
                                            : 'bg-[var(--bg)] border-[var(--border)] hover:border-white/10'
                                            }`}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {isCurrentLink && (
                                                        <span className="text-[8px] font-bold bg-white text-black px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0">This</span>
                                                    )}
                                                    <span className="text-xs font-medium text-[var(--text-secondary)] truncate">
                                                        {cl.utmSource && <span className="text-[var(--text-muted)] mr-1">{cl.utmSource}</span>}
                                                        {cl.title}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-xs font-bold text-white tabular-nums">{formatNumber(cl.totalClicks)}</span>
                                                    <span className="text-[10px] text-[var(--text-muted)] w-7 text-right tabular-nums">{pct}%</span>
                                                </div>
                                            </div>
                                            <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-700 ${isCurrentLink ? 'bg-violet-400' : 'bg-[#525252]'}`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] mt-3">
                                Campaign total: <span className="text-white font-bold">{formatNumber(campaignData.total)} clicks</span> across {campaignData.links.length} links
                            </p>
                        </div>
                    )}
                </div>
            )}


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    label="Total Clicks"
                    value={formatNumber(link.totalClicks || 0)}
                    sub="All time"
                    icon={BarChart3}
                />
                <StatCard
                    label={`This Period`}
                    value={formatNumber(analytics?.totalClicks || 0)}
                    sub={`Last ${effectiveDays} days`}
                    icon={TrendingUp}
                />
                <StatCard
                    label="Daily Average"
                    value={formatNumber(dailyAvg)}
                    sub="Clicks per day"
                    icon={TrendingUp}
                />
            </div>

            {/* ── Click Trend Chart ── */}
            <div className="card">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-sm font-bold text-white">Click Trend</h2>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Daily clicks over the last {effectiveDays} days</p>
                    </div>
                    <span className="text-xs font-bold text-white bg-[var(--bg)] border border-[var(--border)] rounded-md px-2.5 py-1">
                        {formatNumber(analytics?.totalClicks || 0)} total
                    </span>
                </div>
                {analytics?.dailyData?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={analytics.dailyData} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
                            <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.12} />
                                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: '#525252', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                            <YAxis tick={{ fill: '#525252', fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="clicks" stroke="#ffffff" strokeWidth={1.5} fill="url(#areaGrad)" dot={false} activeDot={{ r: 4, fill: '#fff', strokeWidth: 0 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-[var(--text-muted)] gap-2">
                        <BarChart3 size={24} className="opacity-30" />
                        <p className="text-xs">No clicks in this period yet</p>
                    </div>
                )}
            </div>

            {/* ── Analytics Grid: Traffic Sources + Devices ── */}
            <div className="grid md:grid-cols-2 gap-4">

                {/* Referring Sites */}
                <div className="card flex flex-col gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-white">Referring Sites</h3>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Actual websites where the click physically happened</p>
                    </div>
                    {analytics?.topReferrers?.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.topReferrers.map(({ source, count }) => (
                                <ProgressRow
                                    key={source}
                                    label={source}
                                    value={count}
                                    total={analytics.totalClicks}
                                    abbr={SOURCE_LABELS[source] || source.slice(0, 2).toUpperCase()}
                                    Icon={source === 'Direct' ? Globe : null}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                            <Share2 size={24} className="text-[var(--text-muted)] opacity-40 mb-2" />
                            <p className="text-xs text-[var(--text-muted)]">Share your link to see traffic sources</p>
                        </div>
                    )}
                </div>

                {/* Devices */}
                <div className="card flex flex-col gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-white">Devices</h3>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">How your audience is accessing the link</p>
                    </div>
                    {analytics?.deviceBreakdown?.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.deviceBreakdown.map(({ name, value }) => {
                                const DevIcon = DEVICE_ICONS[name];
                                return (
                                    <ProgressRow
                                        key={name}
                                        label={name}
                                        value={value}
                                        total={analytics.totalClicks}
                                        Icon={DevIcon || Monitor}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                            <Monitor size={24} className="text-[var(--text-muted)] opacity-40 mb-2" />
                            <p className="text-xs text-[var(--text-muted)]">No device data yet</p>
                        </div>
                    )}
                </div>

            </div>

            {/* ── UTM Analytics ── */}
            <div className="grid md:grid-cols-3 gap-4">
                {/* UTM Sources */}
                <div className="card flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">UTM Sources</h3>
                    {analytics?.topUtmSources?.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.topUtmSources.map(({ name, count }) => (
                                <ProgressRow key={name} label={name} value={count} total={analytics.totalClicks} abbr={name.slice(0, 2).toUpperCase()} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center opacity-40">
                            <AtSign size={20} className="mb-2" />
                            <p className="text-[10px]">No UTM Sources</p>
                        </div>
                    )}
                </div>

                {/* UTM Mediums */}
                <div className="card flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">UTM Mediums</h3>
                    {analytics?.topUtmMediums?.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.topUtmMediums.map(({ name, count }) => (
                                <ProgressRow key={name} label={name} value={count} total={analytics.totalClicks} abbr={name.slice(0, 2).toUpperCase()} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center opacity-40">
                            <Send size={20} className="mb-2" />
                            <p className="text-[10px]">No UTM Mediums</p>
                        </div>
                    )}
                </div>

                {/* UTM Campaigns */}
                <div className="card flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">UTM Campaigns</h3>
                    {analytics?.topUtmCampaigns?.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.topUtmCampaigns.map(({ name, count }) => (
                                <ProgressRow key={name} label={name} value={count} total={analytics.totalClicks} abbr={name.slice(0, 2).toUpperCase()} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center opacity-40">
                            <TrendingUp size={20} className="mb-2" />
                            <p className="text-[10px]">No UTM Campaigns</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Pro Analytics ── */}
            {isPro ? (
                <div className="space-y-4">
                    {/* Browsers + OS */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="card flex flex-col gap-4">
                            <h3 className="text-sm font-bold text-white">Browsers</h3>
                            <div className="space-y-4">
                                {analytics?.browserBreakdown?.map(({ name, value }) => (
                                    <ProgressRow key={name} label={name} value={value} total={analytics.totalClicks} />
                                ))}
                            </div>
                        </div>
                        <div className="card flex flex-col gap-4">
                            <h3 className="text-sm font-bold text-white">Operating Systems</h3>
                            <div className="space-y-4">
                                {analytics?.osBreakdown?.map(({ name, value }) => (
                                    <ProgressRow key={name} label={name} value={value} total={analytics.totalClicks} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Hourly Heatmap */}
                    <div className="card">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-white">Hourly Activity</h3>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Clicks by hour over the last 24 hours</p>
                        </div>
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={analytics?.hourlyData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                                <XAxis dataKey="label" tick={{ fill: '#525252', fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #262626', borderRadius: '8px', fontSize: '10px' }}
                                />
                                <Bar dataKey="count" fill="#ffffff" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="card border-dashed flex items-center justify-between gap-4 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                            <Zap size={16} className="text-violet-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Unlock Advanced Analytics</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">Get browser, OS, hourly and country breakdown.</p>
                        </div>
                    </div>
                    <Link href="/dashboard/billing" className="btn-primary h-8 px-4 text-xs flex-shrink-0">
                        Upgrade
                    </Link>
                </div>
            )}

            {/* ── Share This Link ── */}
            <div className="card">
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-white">Share This Link</h3>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Send your short link directly to your audience</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'Twitter / X', Icon: AtSign, color: 'hover:text-white hover:border-white/20', url: (u) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(link.title || '')}` },
                        { label: 'WhatsApp', Icon: MessageCircle, color: 'hover:text-[#25D366] hover:border-[#25D366]/30', url: (u) => `https://wa.me/?text=${encodeURIComponent((link.title ? link.title + ' ' : '') + u)}` },
                        { label: 'LinkedIn', Icon: ExternalLink, color: 'hover:text-[#0077B5] hover:border-[#0077B5]/30', url: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
                        { label: 'Facebook', Icon: Share2, color: 'hover:text-[#1877F2] hover:border-[#1877F2]/30', url: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
                        { label: 'Telegram', Icon: Send, color: 'hover:text-[#2AABEE] hover:border-[#2AABEE]/30', url: (u) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(link.title || '')}` },
                    ].map(({ label, Icon, url, color }) => (
                        <a
                            key={label}
                            href={url(shortUrl)}
                            target="_blank" rel="noreferrer"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-muted)] text-xs font-semibold transition-all ${color}`}
                        >
                            <Icon size={13} />
                            {label}
                        </a>
                    ))}
                </div>
            </div>

            {/* ── Link Details ── */}
            <div className="card">
                <h3 className="text-sm font-bold text-white mb-4">Link Details</h3>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                    {[
                        { label: 'Short URL', value: shortUrl, copy: true },
                        { label: 'Destination', value: link.originalUrl, href: link.originalUrl, truncate: true },
                        link.ogTitle && { label: 'OG Title', value: link.ogTitle },
                        link.expiresAt && { label: 'Expires', value: formatDate(link.expiresAt) },
                        link.utmSource && { label: 'UTM Source', value: link.utmSource },
                        link.utmMedium && { label: 'UTM Medium', value: link.utmMedium },
                        link.utmCampaign && { label: 'UTM Campaign', value: link.utmCampaign },
                        { label: 'Created', value: formatDate(link.createdAt) },
                    ].filter(Boolean).map(({ label, value, href, copy, truncate }) => (
                        <div key={label}>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">{label}</p>
                            <div className="flex items-center gap-1.5">
                                {href ? (
                                    <a href={href} target="_blank" rel="noreferrer" className={`text-xs text-white hover:text-[var(--text-secondary)] transition-colors flex items-center gap-1 ${truncate ? 'truncate max-w-[240px]' : ''}`}>
                                        {value} <ExternalLink size={9} />
                                    </a>
                                ) : (
                                    <p className={`text-xs text-white ${truncate ? 'truncate max-w-[240px]' : ''}`}>{value}</p>
                                )}
                                {copy && (
                                    <button onClick={copyLink} className="text-[var(--text-muted)] hover:text-white transition-colors">
                                        <Copy size={10} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
