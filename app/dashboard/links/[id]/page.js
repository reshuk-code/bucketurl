'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Link2, Copy, ExternalLink, BarChart3, Globe,
    Monitor, Smartphone, Tablet, TrendingUp
} from 'lucide-react';
import { formatNumber, buildShortUrl, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const DEVICE_ICONS = { Mobile: Smartphone, Desktop: Monitor, Tablet };
const COLORS = ['#ffffff', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs">
                <p className="text-[var(--text-muted)] mb-1">{label}</p>
                <p className="text-white font-semibold">{payload[0].value} clicks</p>
            </div>
        );
    }
    return null;
};

export default function LinkDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [link, setLink] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    const fetchData = useCallback(async () => {
        if (!user || !id) return;
        try {
            const token = await user.getIdToken();
            const [linkRes, analyticsRes] = await Promise.all([
                fetch(`/api/links/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/analytics/${id}?days=${days}`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const linkData = await linkRes.json();
            const analyticsData = await analyticsRes.json();
            if (linkRes.ok) setLink(linkData.link);
            else { toast.error('Link not found'); router.push('/dashboard/links'); return; }
            if (analyticsRes.ok) setAnalytics(analyticsData);
        } catch { toast.error('Failed to load analytics'); }
        finally { setLoading(false); }
    }, [user, id, days, router]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const copyLink = async () => {
        await navigator.clipboard.writeText(buildShortUrl(link.shortCode));
        toast.success('Short URL copied!');
    };

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                <div className="skeleton h-8 w-64 mb-4" />
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
                </div>
                <div className="skeleton h-64 rounded-xl" />
            </div>
        );
    }

    if (!link) return null;

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-start gap-4">
                <button onClick={() => router.back()} className="mt-1 p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold text-white">{link.title}</h1>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <a href={buildShortUrl(link.shortCode)} target="_blank" rel="noreferrer" className="text-sm text-white hover:text-[#d4d4d4] flex items-center gap-1 transition-colors">
                            /{link.shortCode} <ExternalLink size={12} />
                        </a>
                        <span className="text-[var(--text-muted)] text-xs">•</span>
                        <p className="text-xs text-[var(--text-muted)] truncate max-w-xs">{link.originalUrl}</p>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Created {formatDate(link.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={copyLink} className="btn-secondary text-xs"><Copy size={13} /> Copy</button>
                    <a href={buildShortUrl(link.shortCode)} target="_blank" rel="noreferrer" className="btn-secondary text-xs"><ExternalLink size={13} /> Open</a>
                </div>
            </div>

            {/* Days Filter */}
            <div className="flex gap-1">
                {[7, 14, 30, 90].map(d => (
                    <button key={d} onClick={() => setDays(d)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${days === d ? 'bg-white text-black' : 'bg-transparent border border-[var(--border)] text-[var(--text-secondary)] hover:bg-white/5'}`}>
                        {d}d
                    </button>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <span className="section-title">Total Clicks</span>
                        <div className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center">
                            <BarChart3 size={14} className="text-[var(--text-secondary)]" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white">{formatNumber(link.totalClicks || 0)}</div>
                    <div className="text-xs text-[var(--text-muted)]">All time</div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <span className="section-title">This Period</span>
                        <div className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center">
                            <TrendingUp size={14} className="text-[var(--text-secondary)]" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white">{formatNumber(analytics?.totalClicks || 0)}</div>
                    <div className="text-xs text-[var(--text-muted)]">Last {days} days</div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <span className="section-title">Daily Average</span>
                        <div className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center">
                            <Globe size={14} className="text-[var(--text-secondary)]" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {analytics ? formatNumber(Math.round((analytics.totalClicks || 0) / days)) : '0'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">Clicks / day</div>
                </div>
            </div>

            {/* Click Trend Chart */}
            <div className="card">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-base font-semibold text-white">Click Trend</h2>
                        <p className="text-xs text-[var(--text-muted)]">Daily clicks over the last {days} days</p>
                    </div>
                </div>
                {analytics?.dailyData?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={analytics.dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: '#737373', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                            <YAxis tick={{ fill: '#737373', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="clicks" stroke="#ffffff" strokeWidth={1.5} fill="url(#grad2)" dot={false} activeDot={{ r: 4, fill: '#ffffff', strokeWidth: 0 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-48 flex items-center justify-center text-[var(--text-muted)] text-sm">No clicks in this period</div>
                )}
            </div>

            {/* Breakdown Row */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Device Breakdown */}
                <div className="card">
                    <h3 className="text-sm font-semibold text-white mb-4">Devices</h3>
                    {analytics?.deviceBreakdown?.length > 0 ? (
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="50%" height={140}>
                                <PieChart>
                                    <Pie data={analytics.deviceBreakdown} cx="50%" cy="50%" outerRadius={55} innerRadius={30} dataKey="value" paddingAngle={2}>
                                        {analytics.deviceBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2">
                                {analytics.deviceBreakdown.map(({ name, value }, i) => (
                                    <div key={name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-xs text-[var(--text-secondary)]">{name}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-white">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-[var(--text-muted)] text-sm">No data yet</div>
                    )}
                </div>

                {/* Top Countries */}
                <div className="card">
                    <h3 className="text-sm font-semibold text-white mb-4">Top Countries</h3>
                    {analytics?.topCountries?.length > 0 ? (
                        <div className="space-y-2.5">
                            {analytics.topCountries.slice(0, 5).map(({ country, count }, i) => {
                                const pct = analytics.totalClicks ? Math.round((count / analytics.totalClicks) * 100) : 0;
                                return (
                                    <div key={country}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-[var(--text-secondary)]">{country}</span>
                                            <span className="text-white font-medium">{count} ({pct}%)</span>
                                        </div>
                                        <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                                            <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-[var(--text-muted)] text-sm">No data yet</div>
                    )}
                </div>
            </div>

            {/* Referrers */}
            <div className="card">
                <h3 className="text-sm font-semibold text-white mb-4">Top Referrers</h3>
                {analytics?.topReferrers?.length > 0 ? (
                    <div className="space-y-2">
                        {analytics.topReferrers.map(({ referrer, count }) => (
                            <div key={referrer} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                                <span className="text-sm text-[var(--text-secondary)] truncate">{referrer}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-white">{formatNumber(count)}</span>
                                    <span className="text-xs text-[var(--text-muted)]">{analytics.totalClicks ? Math.round((count / analytics.totalClicks) * 100) : 0}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-[var(--text-muted)] text-sm">No referrer data yet</div>
                )}
            </div>

            {/* Link Settings */}
            <div className="card">
                <h3 className="text-sm font-semibold text-white mb-4">Link Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">Original URL</p>
                        <a href={link.originalUrl} target="_blank" rel="noreferrer" className="text-white hover:text-[var(--text-secondary)] text-xs break-all flex items-center gap-1">
                            {link.originalUrl} <ExternalLink size={10} />
                        </a>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">Short URL</p>
                        <p className="text-white text-xs flex items-center gap-1">
                            {buildShortUrl(link.shortCode)}
                            <button onClick={copyLink} className="text-[var(--text-secondary)] hover:text-white transition-colors"><Copy size={11} /></button>
                        </p>
                    </div>
                    {link.ogTitle && <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">OG Title</p>
                        <p className="text-white text-xs">{link.ogTitle}</p>
                    </div>}
                    {link.expiresAt && <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">Expires</p>
                        <p className="text-white text-xs">{formatDate(link.expiresAt)}</p>
                    </div>}
                    {link.utmSource && <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">UTM Source</p>
                        <p className="text-white text-xs">{link.utmSource}</p>
                    </div>}
                    {link.utmMedium && <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">UTM Medium</p>
                        <p className="text-white text-xs">{link.utmMedium}</p>
                    </div>}
                </div>
            </div>
        </div>
    );
}
