'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Users, Plus, Mail, Crown, User, Shield, Eye, X, Loader2, Check, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const ROLES = {
    owner: { label: 'Owner', icon: Crown, color: 'text-white' },
    admin: { label: 'Admin', icon: Shield, color: 'text-[#d4d4d4]' },
    member: { label: 'Member', icon: User, color: 'text-[#a3a3a3]' },
    viewer: { label: 'Viewer', icon: Eye, color: 'text-[var(--text-muted)]' },
};

function CreateTeamModal({ onClose, onCreated }) {
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) return;
        setSaving(true);
        await new Promise(r => setTimeout(r, 600)); // Simulate API
        const newTeam = { id: Date.now().toString(), name, members: [{ role: 'owner' }] };
        onCreated(newTeam);
        toast.success(`Team "${name}" created!`);
        onClose();
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-sm animate-fade-in-up shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-white">Create Team</h2>
                    <button onClick={onClose} className="p-1 rounded bg-transparent hover:bg-white/10 text-[var(--text-muted)] transition-colors"><X size={16} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Team Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Marketing Team" className="input-field" autoFocus />
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={onClose} className="btn-secondary flex-1 justify-center bg-transparent border border-[var(--border)] hover:bg-white/5">Cancel</button>
                        <button onClick={handleCreate} disabled={!name.trim() || saving} className="btn-primary flex-1 justify-center transition-colors">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                            {saving ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TeamsPage() {
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [inviting, setInviting] = useState(false);

    // Check if user is on pro plan
    const [userPlan, setUserPlan] = useState('free');
    const [loadingPlan, setLoadingPlan] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const res = await fetch('/api/users', { headers: { 'x-user-id': user.uid, Authorization: `Bearer ${token}` } });
                const data = await res.json();
                setUserPlan(data.user?.plan === 'team' ? 'pro' : (data.user?.plan || 'free'));
            } catch { } finally { setLoadingPlan(false); }
        };
        fetchUser();
    }, [user]);

    // Mock teams for demo
    useEffect(() => {
        setTeams([]);
    }, []);

    const handleInvite = async () => {
        if (!inviteEmail || !selectedTeam) return;
        setInviting(true);
        await new Promise(r => setTimeout(r, 800));
        toast.success(`Invitation sent to ${inviteEmail}`);
        setInviteEmail('');
        setInviting(false);
    };

    if (loadingPlan) {
        return <div className="p-6 text-center text-[var(--text-muted)] font-medium mt-10"><Loader2 className="animate-spin inline mr-2" size={16} /> Loading teams...</div>;
    }

    const isPro = userPlan === 'pro';

    return (
        <div className="p-6 animate-fade-in max-w-4xl mx-auto">
            {showCreate && isPro && (
                <CreateTeamModal onClose={() => setShowCreate(false)} onCreated={t => { setTeams([...teams, t]); setSelectedTeam(t); }} />
            )}

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Teams</h1>
                    <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">Collaborate with your team on links</p>
                </div>
                {isPro && <button onClick={() => setShowCreate(true)} className="btn-primary h-9 px-4"><Plus size={15} /> New Team</button>}
            </div>

            {!isPro ? (
                <div className="card text-center py-16 border border-[var(--border)] shadow-lg max-w-2xl mx-auto mt-4">
                    <div className="w-14 h-14 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center mx-auto mb-5">
                        <Lock size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Unlock Team Collaboration</h3>
                    <p className="text-sm font-medium text-[var(--text-secondary)] mb-8 max-w-sm mx-auto leading-relaxed">
                        Upgrade to the Pro plan to create shared workspaces, invite members, and manage access roles.
                    </p>
                    <Link href="/dashboard/billing" className="btn-primary inline-flex h-10 px-6">
                        Upgrade to Pro
                    </Link>
                </div>
            ) : teams.length === 0 ? (
                <div className="card text-center py-16 border border-[var(--border)] shadow-lg mt-4">
                    <div className="w-14 h-14 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center mx-auto mb-5">
                        <Users size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No teams yet</h3>
                    <p className="text-sm font-medium text-[var(--text-secondary)] mb-8 max-w-sm mx-auto leading-relaxed">
                        Create a team to collaborate with others on shared links and analytics.
                    </p>
                    <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto h-10 px-6">
                        <Plus size={16} /> Create Your First Team
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-5 mt-4">
                    {teams.map(team => (
                        <div key={team.id} className={`card cursor-pointer border hover:border-white transition-all ${selectedTeam?.id === team.id ? 'border-white bg-[var(--bg-card)]' : 'border-[var(--border)] bg-[var(--bg-secondary)]'}`}
                            onClick={() => setSelectedTeam(selectedTeam?.id === team.id ? null : team)}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center">
                                    <Users size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{team.name}</p>
                                    <p className="text-xs font-medium text-[var(--text-muted)]">{team.members?.length || 1} member{(team.members?.length || 1) !== 1 ? 's' : ''}</p>
                                </div>
                            </div>

                            {selectedTeam?.id === team.id && (
                                <div onClick={e => e.stopPropagation()} className="mt-4 pt-4 border-t border-[var(--border)]">
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Invite Member</p>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                            <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                                                placeholder="member@company.com" className="input-field pl-9 text-xs h-9" />
                                        </div>
                                        <button onClick={handleInvite} disabled={!inviteEmail || inviting} className="btn-primary text-xs px-4 h-9">
                                            {inviting ? <Loader2 size={14} className="animate-spin" /> : null}
                                            Invite
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Roles Reference */}
            {isPro && (
                <div className="card mt-10 border border-[var(--border)] shadow-sm">
                    <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 border-b border-[var(--border)] pb-2">Role Permissions</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(ROLES).map(([role, { label, icon: Icon, color }]) => (
                            <div key={role} className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon size={14} className={color} />
                                    <span className={`text-sm font-bold ${color}`}>{label}</span>
                                </div>
                                <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                                    {role === 'owner' ? 'Full control, billing access' :
                                        role === 'admin' ? 'Manage links & members' :
                                            role === 'member' ? 'Create & edit links' :
                                                'View analytics only'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
