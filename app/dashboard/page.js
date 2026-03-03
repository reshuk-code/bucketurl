'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
    BarChart3,
    Link2,
    TrendingUp,
    ArrowUpRight,
    Plus,
    ExternalLink,
    Copy,
    Clock,
    CalendarIcon,
    Activity,
    Zap,
    Lock,
    Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { formatNumber, buildShortUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2 text-xs shadow-2xl">
                <p className="text-[var(--text-muted)] mb-1 font-medium">{label}</p>
                <p className="text-white font-bold">{payload[0].value} clicks</p>
            </div>
        );
    }
    return null;
};

function formatHourLabel(hour) {
    const d = new Date();
    d.setHours(hour, 0, 0, 0);
    return d.toLocaleTimeString('en-US', { hour: 'numeric' });
}

function resolveDays(filter) {
    if (filter === 'live') return 1;
    if (filter === '3d') return 3;
    if (filter === '30d') return 30;
    return 15;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [links, setLinks] = useState([]);
    const [stats, setStats] = useState({ totalLinks: 0, totalClicks: 0, topLink: null });

    const [timeFilter, setTimeFilter] = useState('15d'); // live | 3d | 15d | 30d
    const [selectedScope, setSelectedScope] = useState('all'); // 'all' | linkId
    const [scopeOpen, setScopeOpen] = useState(false);

    const [chartData, setChartData] = useState([]);
    const [indexRequired, setIndexRequired] = useState(false);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingChart, setLoadingChart] = useState(true);
    const [pulse, setPulse] = useState(false);
    const [userPlan, setUserPlan] = useState('free');
    const isPro = userPlan === 'pro' || userPlan === 'team';

    // Real-time stats listener (links + total clicks + top link)
    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'links'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const linkList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            const totalClicks = linkList.reduce((sum, l) => sum + (l.totalClicks || 0), 0);

            setStats((prev) => {
                if (totalClicks > prev.totalClicks) {
                    setPulse(true);
                    setTimeout(() => setPulse(false), 800);
                }
                const top = [...linkList].sort(
                    (a, b) => (b.totalClicks || 0) - (a.totalClicks || 0),
                )[0];
                return { totalLinks: linkList.length, totalClicks, topLink: top };
            });

            setLinks(linkList);
            setLoadingStats(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Fetch user plan once
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const token = await user.getIdToken();
                const res = await fetch('/api/users', { headers: { 'x-user-id': user.uid, Authorization: `Bearer ${token}` } });
                const data = await res.json();
                setUserPlan(data.user?.plan || 'free');
            } catch { }
        })();
    }, [user]);

    // Fetch analytics for chart (aggregated or per-link) using real click data
    const fetchAnalyticsData = useCallback(async () => {
        if (!user) return;
        try {
            setLoadingChart(true);
            const token = await user.getIdToken();
            // Free plan: always cap to 7 days
            const isPlanPro = userPlan === 'pro' || userPlan === 'team';
            const capDays = isPlanPro ? resolveDays(timeFilter) : Math.min(resolveDays(timeFilter), 7);
            const tzOffset = new Date().getTimezoneOffset(); // minutes offset from UTC

            if (selectedScope === 'all') {
                const res = await fetch(`/api/analytics/all?days=${capDays}&tzOffset=${tzOffset}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();

                if (!res.ok) {
                    console.error('GET /api/analytics/all failed:', data);
                    setChartData([]);
                    setIndexRequired(false);
                    return;
                }

                setChartData(data.chartData || []);
                setIndexRequired(data.indexRequired || false);
            } else {
                const res = await fetch(
                    `/api/analytics/${selectedScope}?days=${capDays}&tzOffset=${tzOffset}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
                const data = await res.json();

                if (!res.ok) {
                    console.error('GET /api/analytics/[linkId] failed:', data);
                    setChartData([]);
                    setIndexRequired(false);
                    return;
                }

                if (timeFilter === 'live') {
                    const hourly = data.hourlyData || [];
                    setChartData(
                        hourly.map((h) => ({
                            date: h.label || formatHourLabel(h.hour),
                            clicks: h.count,
                        })),
                    );
                } else {
                    const daily = data.dailyData || [];
                    setChartData(
                        daily.map((d) => ({
                            date: new Date(d.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            }),
                            clicks: d.clicks,
                        })),
                    );
                }
                setIndexRequired(false);
            }
        } catch (err) {
            console.error('Failed to fetch analytics', err);
            setChartData([]);
            setIndexRequired(false);
        } finally {
            setLoadingChart(false);
        }
    }, [user, timeFilter, selectedScope]);

    // Refresh chart when filters or live stats change
    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData, stats.totalClicks]);

    const copyToClipboard = async (slug) => {
        await navigator.clipboard.writeText(buildShortUrl(slug));
        toast.success('Copied to clipboard!');
    };

    if (loadingStats && loadingChart) {
        return (
            <div className="p-6 space-y-4">
                <div className="skeleton h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-28 rounded-xl" />
                    ))}
                </div>
                <div className="skeleton h-56 rounded-xl" />
            </div>
        );
    }

    const displayName = user?.displayName?.split(' ')[0] || 'there';
    const currentScopeLabel =
        selectedScope === 'all'
            ? 'All links'
            : links.find((l) => l.id === selectedScope)?.title ||
            links.find((l) => l.id === selectedScope)?.shortCode ||
            'Selected link';

    return (
        <div className="p-6 md:p-8 space-y-8 animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                        Good day, {displayName}
                    </h1>
                    <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
                        High-level overview of everything happening across your workspace.
                    </p>
                </div>
                <Link href="/dashboard/links?new=true" className="btn-primary h-9 px-4 md:px-5">
                    <Plus size={15} /> New Link
                </Link>
            </div>

            {/* Stat Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] via-transparent to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                            Total Links
                        </span>
                        <div className="w-8 h-8 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center">
                            <Link2 size={14} className="text-white" />
                        </div>
                    </div>
                    <div className="text-3xl font-semibold text-white mb-1 relative z-10">
                        {formatNumber(stats.totalLinks)}
                    </div>
                    <div className="text-xs font-medium text-[var(--text-muted)] relative z-10">
                        Active short links
                    </div>
                </div>

                <div className="card relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                            Total Clicks
                        </span>
                        <div className="w-8 h-8 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center">
                            <TrendingUp size={14} className="text-white" />
                        </div>
                    </div>
                    <div
                        className={`text-3xl font-semibold text-white mb-1 relative z-10 transition-transform duration-300 ${pulse ? 'scale-110' : 'scale-100'
                            }`}
                    >
                        {formatNumber(stats.totalClicks)}
                    </div>
                    <div className="text-xs font-medium text-[var(--text-muted)] relative z-10">
                        Across all links
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                            Top Link
                        </span>
                        <div className="w-8 h-8 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center">
                            <BarChart3 size={14} className="text-white" />
                        </div>
                    </div>
                    {stats.topLink ? (
                        <>
                            <div className="text-sm font-semibold text-white truncate mb-1">
                                {stats.topLink.title || 'Untitled Link'}
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] truncate mb-1">
                                bucketurl.onrender.com/{stats.topLink.shortCode}
                            </p>
                            <div className="text-xs font-medium text-[var(--text-muted)]">
                                {formatNumber(stats.topLink.totalClicks || 0)} clicks
                            </div>
                        </>
                    ) : (
                        <div className="text-sm font-medium text-[var(--text-muted)] pt-2">
                            Create your first link to see performance.
                        </div>
                    )}
                </div>
            </div>

            {/* Analytics Card */}
            <div className="card">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-sm font-semibold text-white tracking-tight">
                            Click Trends
                        </h2>
                        <p className="text-xs font-medium text-[var(--text-muted)] mt-1">
                            {selectedScope === 'all'
                                ? 'Real-time aggregate of all link activity.'
                                : 'Real-time performance for the selected link.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap justify-start md:justify-end">
                        {/* Custom scope selector */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setScopeOpen((o) => !o)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] text-xs font-medium text-[var(--text-secondary)] hover:border-white/60 hover:text-white transition-colors"
                            >
                                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                <span className="truncate max-w-[140px] text-left">{currentScopeLabel}</span>
                                <span className="text-[10px] opacity-70">▼</span>
                            </button>
                            {scopeOpen && (
                                <div className="absolute right-0 mt-1 w-56 max-h-64 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--bg)] shadow-2xl z-20">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedScope('all');
                                            setScopeOpen(false);
                                        }}
                                        className={`w-full px-3 py-2 text-xs text-left hover:bg-white/5 flex items-center justify-between ${selectedScope === 'all'
                                            ? 'text-white'
                                            : 'text-[var(--text-secondary)]'
                                            }`}
                                    >
                                        <span>All links</span>
                                        {selectedScope === 'all' && (
                                            <span className="text-[10px] text-emerald-400 font-semibold">
                                                Live
                                            </span>
                                        )}
                                    </button>
                                    <div className="border-t border-[var(--border)] my-1" />
                                    {links.map((l) => (
                                        <button
                                            key={l.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedScope(l.id);
                                                setScopeOpen(false);
                                            }}
                                            className={`w-full px-3 py-2 text-xs text-left hover:bg-white/5 flex flex-col ${selectedScope === l.id
                                                ? 'text-white'
                                                : 'text-[var(--text-secondary)]'
                                                }`}
                                        >
                                            <span className="truncate">
                                                {l.title || l.shortCode || 'Untitled link'}
                                            </span>
                                            <span className="text-[10px] text-[var(--text-muted)] truncate">
                                                bucketurl.onrender.com/{l.shortCode}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Time filter */}
                        <div className="flex p-0.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md">
                            {[
                                { val: 'live', label: 'Live', icon: Activity, proOnly: true },
                                { val: '3d', label: '3d' },
                                { val: '15d', label: '15d' },
                                { val: '30d', label: '30d' },
                            ].map((t) => (
                                <button
                                    key={t.val}
                                    onClick={() => {
                                        if (t.proOnly && !isPro) {
                                            toast((rt) => (
                                                <div
                                                    onClick={() => {
                                                        toast.dismiss(rt.id);
                                                        router.push('/dashboard/billing');
                                                    }}
                                                    className="flex items-center gap-3 cursor-pointer"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                                                        <Zap size={16} className="text-amber-400 fill-amber-400" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-xs font-bold text-white tracking-tight">
                                                            Live analytics is a Pro feature
                                                        </p>
                                                        <p className="text-[10px] text-amber-200/60 font-medium">
                                                            Upgrade now to unlock real-time tracking →
                                                        </p>
                                                    </div>
                                                </div>
                                            ), {
                                                duration: 5000,
                                                style: {
                                                    background: '#16161f',
                                                    border: '1px solid #ebad1a33',
                                                    padding: '12px',
                                                    borderRadius: '12px',
                                                }
                                            });
                                            return;
                                        }
                                        setTimeFilter(t.val);
                                    }}
                                    className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${timeFilter === t.val
                                        ? 'bg-[var(--bg)] text-white shadow-sm border border-[var(--border)]'
                                        : 'text-[var(--text-muted)] hover:text-white border border-transparent'
                                        }`}
                                >
                                    {t.icon && (
                                        <t.icon
                                            size={12}
                                            className={
                                                timeFilter === t.val && t.val === 'live'
                                                    ? 'text-emerald-400 animate-pulse'
                                                    : ''
                                            }
                                        />
                                    )}
                                    {t.label}
                                    {t.proOnly && !isPro && <Lock size={9} className="text-[var(--text-muted)] opacity-70" />}
                                </button>
                            ))}
                            <button
                                className="hidden md:inline-flex items-center px-2 text-[10px] text-[var(--text-muted)]"
                                disabled
                            >
                                <CalendarIcon size={11} className="mr-1 opacity-70" />
                                Range
                            </button>
                        </div>
                    </div>
                </div>

                {loadingChart ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="skeleton h-40 w-full rounded-xl" />
                    </div>
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.12} />
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.05)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#737373', fontSize: 10, fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                                interval={timeFilter === 'live' ? 3 : 'preserveStartEnd'}
                            />
                            <YAxis
                                tick={{ fill: '#737373', fontSize: 10, fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                                allowDecimals={false}
                                domain={[0, 'auto']}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="clicks"
                                stroke="#ffffff"
                                strokeWidth={2}
                                fill="url(#clickGrad)"
                                dot={false}
                                activeDot={{ r: 4, fill: '#ffffff', strokeWidth: 0 }}
                                animationDuration={600}
                                connectNulls
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : indexRequired ? (
                    <div className="h-64 flex flex-col items-center justify-center text-[var(--text-muted)] text-sm font-medium border border-dashed border-[var(--border)] rounded-xl bg-white/[0.01]">
                        <Clock size={32} className="mb-4 opacity-40 animate-pulse" />
                        <h3 className="text-white mb-1">Building your analytics…</h3>
                        <p className="max-w-xs text-center text-xs opacity-60 px-6">
                            Firestore is currently indexing your data. This usually takes 2–5 minutes. Your
                            clicks will appear here automatically.
                        </p>
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-[var(--text-muted)] text-sm font-medium border border-dashed border-[var(--border)] rounded-xl bg-white/[0.01]">
                        <Activity size={32} className="mb-4 opacity-20" />
                        No click data yet. Share your links to get started.
                    </div>
                )}
            </div>

            {/* Recent Links (single place for actionable controls to avoid duplication) */}
            <div className="card">
                <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-4">
                    <div>
                        <h2 className="text-sm font-semibold text-white tracking-tight">Recent Links</h2>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            Quick snapshot of the latest activity in your workspace.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/links"
                        className="text-xs font-bold text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-1"
                    >
                        View all <ArrowUpRight size={12} />
                    </Link>
                </div>

                {links.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                            <Link2 size={16} className="text-[var(--text-muted)]" />
                        </div>
                        <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                            You haven&apos;t created any links yet.
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                            Use the{" "}
                            <span className="font-semibold text-white">New Link</span> button in the top-right
                            corner to create your first short link.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--border)] -mx-4 px-4">
                        {links.slice(0, 5).map((link) => (
                            <div key={link.id} className="flex items-center gap-4 py-3 group">
                                <div className="w-8 h-8 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center flex-shrink-0">
                                    <Link2 size={14} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {link.title || 'Untitled Link'}
                                    </p>
                                    <p className="text-xs font-medium text-[var(--text-secondary)] truncate">
                                        bucketurl.onrender.com/{link.shortCode}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0 pr-4">
                                    <p className="text-sm font-semibold text-white">
                                        {formatNumber(link.totalClicks || 0)}
                                    </p>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                        clicks
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                    <button
                                        onClick={() => copyToClipboard(link.shortCode)}
                                        className="p-1.5 rounded border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-secondary)] hover:text-white transition-all"
                                    >
                                        <Copy size={13} />
                                    </button>
                                    <a
                                        href={buildShortUrl(link.shortCode)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 rounded border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-secondary)] hover:text-white transition-all"
                                    >
                                        <ExternalLink size={13} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

