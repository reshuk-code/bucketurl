'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { BarChart3, Link2, TrendingUp, ArrowUpRight, Plus, ExternalLink, Copy, Clock, CalendarIcon, Activity, Zap } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { formatNumber, buildShortUrl, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
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

export default function DashboardPage() {
    const { user } = useAuth();
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalLinks: 0, totalClicks: 0, topLink: null });
    const [chartData, setChartData] = useState([]);
    const [timeFilter, setTimeFilter] = useState('15d');
    const [pulse, setPulse] = useState(false);
    const [indexRequired, setIndexRequired] = useState(false);

    // Real-time stats listener
    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'links'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const linkList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const totalClicks = linkList.reduce((sum, l) => sum + (l.totalClicks || 0), 0);

            setStats(prev => {
                if (totalClicks > prev.totalClicks) {
                    setPulse(true);
                    setTimeout(() => setPulse(false), 800);
                }
                const top = [...linkList].sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0))[0];
                return { totalLinks: linkList.length, totalClicks, topLink: top };
            });
            setLinks(linkList);
        });

        return () => unsubscribe();
    }, [user]);

    const fetchAnalyticsData = useCallback(async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            let days = 15;
            if (timeFilter === '3d') days = 3;
            else if (timeFilter === '30d') days = 30;
            else if (timeFilter === 'live') days = 1;

            const res = await fetch(`/api/analytics/all?days=${days}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setChartData(data.chartData || []);
            setIndexRequired(data.indexRequired || false);
        } catch (err) { console.error('Failed to fetch analytics', err); }
        finally { setLoading(false); }
    }, [user, timeFilter]);

    useEffect(() => { fetchAnalyticsData(); }, [fetchAnalyticsData]);

    const copyToClipboard = async (slug) => {
        await navigator.clipboard.writeText(buildShortUrl(slug));
        toast.success('Copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                <div className="skeleton h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
                </div>
                <div className="skeleton h-56 rounded-xl" />
            </div>
        );
    }

    const displayName = user?.displayName?.split(' ')[0] || 'there';

    return (
        <div className="p-6 md:p-8 space-y-8 animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Good day, {displayName}</h1>
                    <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">Here&apos;s what&apos;s happening with your links</p>
                </div>
                <Link href="/dashboard/links?new=true" className="btn-primary h-9 px-4">
                    <Plus size={15} /> New Link
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Links</span>
                        <div className="w-8 h-8 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center">
                            <Link2 size={14} className="text-white" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{formatNumber(stats.totalLinks)}</div>
                    <div className="text-xs font-medium text-[var(--text-muted)]">Active short links</div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Clicks</span>
                        <div className="w-8 h-8 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center">
                            <TrendingUp size={14} className="text-white" />
                        </div>
                    </div>
                    <div className={`text-3xl font-bold text-white mb-1 transition-all duration-300 ${pulse ? 'scale-110 text-white' : 'scale-100'}`}>
                        {formatNumber(stats.totalClicks)}
                        {pulse && <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>}
                    </div>
                    <div className="text-xs font-medium text-[var(--text-muted)]">Across all links</div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Top Link</span>
                        <div className="w-8 h-8 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center">
                            <BarChart3 size={14} className="text-white" />
                        </div>
                    </div>
                    {stats.topLink ? (
                        <>
                            <div className="text-lg font-bold text-white truncate mb-1">{stats.topLink.title || 'Untitled Link'}</div>
                            <div className="text-xs font-medium text-[var(--text-muted)]">{formatNumber(stats.topLink.totalClicks || 0)} clicks</div>
                        </>
                    ) : (
                        <div className="text-sm font-medium text-[var(--text-muted)] pt-2">Create your first link to see stats</div>
                    )}
                </div>
            </div>

            {/* Click Chart */}
            <div className="card">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-tight">Click Trends</h2>
                        <p className="text-xs font-medium text-[var(--text-muted)] mt-1">Aggregate analytics for your workspace</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex p-0.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md">
                            {[
                                { val: 'live', label: 'Live', icon: Activity },
                                { val: '3d', label: '3d' },
                                { val: '15d', label: '15d' },
                                { val: '30d', label: '30d' },
                                { val: 'custom', label: <CalendarIcon size={12} /> }
                            ].map(t => (
                                <button
                                    key={t.val}
                                    onClick={() => setTimeFilter(t.val)}
                                    className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${timeFilter === t.val ? 'bg-[var(--bg)] text-white shadow-sm border border-[var(--border)]' : 'text-[var(--text-muted)] hover:text-white border border-transparent'}`}
                                >
                                    {t.icon && <t.icon size={12} className={timeFilter === t.val && t.val === 'live' ? 'text-red-400 animate-pulse' : ''} />}
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.12} />
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                            <Area
                                type="monotone"
                                dataKey="clicks"
                                stroke="#ffffff"
                                strokeWidth={2}
                                fill="url(#clickGrad)"
                                dot={false}
                                activeDot={{ r: 4, fill: '#ffffff', strokeWidth: 0 }}
                                animationDuration={1000}
                                connectNulls
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : indexRequired ? (
                    <div className="h-64 flex flex-col items-center justify-center text-[var(--text-muted)] text-sm font-medium border border-dashed border-[var(--border)] rounded-xl bg-white/[0.01]">
                        <Clock size={32} className="mb-4 opacity-40 animate-pulse" />
                        <h3 className="text-white mb-1">Building your analytics...</h3>
                        <p className="max-w-xs text-center text-xs opacity-60 px-6">Firestore is currently indexing your data. This usually takes 2-5 minutes. Your clicks will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-[var(--text-muted)] text-sm font-medium border border-dashed border-[var(--border)] rounded-xl bg-white/[0.01]">
                        <Activity size={32} className="mb-4 opacity-20" />
                        No click data yet. Share your links to get started!
                    </div>
                )}
            </div>

            {/* Recent Links */}
            <div className="card">
                <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-4">
                    <h2 className="text-sm font-bold text-white tracking-tight">Recent Links</h2>
                    <Link href="/dashboard/links" className="text-xs font-bold text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-1">
                        View all <ArrowUpRight size={12} />
                    </Link>
                </div>

                {links.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                            <Link2 size={16} className="text-[var(--text-muted)]" />
                        </div>
                        <p className="text-sm font-medium text-[var(--text-secondary)] mb-4">No links generated yet.</p>
                        <Link href="/dashboard/links?new=true" className="btn-primary mx-auto">
                            <Plus size={14} /> Create your first link
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--border)] -mx-4 px-4">
                        {links.slice(0, 5).map(link => (
                            <div key={link.id} className="flex items-center gap-4 py-3 group">
                                <div className="w-8 h-8 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center flex-shrink-0">
                                    <Link2 size={14} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{link.title || 'Untitled Link'}</p>
                                    <p className="text-xs font-medium text-[var(--text-secondary)] truncate">bkt.url/{link.shortCode}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold text-white">{formatNumber(link.totalClicks || 0)}</p>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">clicks</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-2">
                                    <button onClick={() => copyToClipboard(link.shortCode)} className="p-1.5 rounded border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-secondary)] hover:text-white transition-all">
                                        <Copy size={13} />
                                    </button>
                                    <a href={buildShortUrl(link.shortCode)} target="_blank" rel="noreferrer" className="p-1.5 rounded border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-secondary)] hover:text-white transition-all">
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
