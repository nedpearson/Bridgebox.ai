import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { Bot, Save, CheckCircle, ChevronRight, Activity, Globe, Mic, LayoutDashboard, Settings } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../LoadingSpinner';
import ErrorState from '../../ErrorState';

export default function OnboardingShell() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { currentOrganization } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchSession() {
            if (!sessionId || !currentOrganization) return;
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('bb_onboarding_sessions')
                    .select('*')
                    .eq('id', sessionId)
                    .eq('organization_id', currentOrganization.id)
                    .single();
                
                if (error) throw error;
                setSession(data);
            } catch (e) {
                console.error('Failed to load onboarding session', e);
            } finally {
                setLoading(false);
            }
        }
        fetchSession();
    }, [sessionId, currentOrganization]);

    const handleSaveDraft = async () => {
        if (!session) return;
        setSaving(true);
        // In a real implementation, we would extract child context state here
        // For now, we simulate a structural save
        await new Promise(r => setTimeout(r, 800));
        setSaving(false);
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><LoadingSpinner /></div>;
    if (!session) return <div className="h-screen bg-slate-950 p-8"><ErrorState message="Onboarding Session not found or unauthorized." /></div>;

    const navLinks = [
        { path: 'intake', label: 'Client Intake', icon: <LayoutDashboard className="w-4 h-4" />, role: 'client' },
        { path: 'analysis', label: 'Web Analysis', icon: <Globe className="w-4 h-4" />, role: 'client' },
        { path: 'voice-capture', label: 'Voice Dictation', icon: <Mic className="w-4 h-4" />, role: 'client' },
        { path: 'review', label: 'Blueprint Review', icon: <CheckCircle className="w-4 h-4" />, role: 'client' },
        { path: 'admin', label: 'Admin Command', icon: <Settings className="w-4 h-4 text-indigo-400" />, role: 'admin' },
    ];

    return (
        <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
            {/* OnboardingHeader & StickyActionBar */}
            <header className="h-16 flex items-center justify-between px-6 bg-slate-900 border-b border-white/5 flex-shrink-0 z-20 shadow-sm relative">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-sm tracking-wide">AI ONBOARDING WORKSPACE</h1>
                        <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                            <span className="flex items-center"><Activity className="w-3 h-3 mr-1 text-emerald-400" /> Active Session</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="truncate max-w-[200px]">{session.session_title}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span>{Math.round((navLinks.findIndex(l => location.pathname.includes(l.path)) + 1) / navLinks.length * 100)}% Complete</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button 
                       onClick={handleSaveDraft}
                       className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700"
                    >
                        {saving ? <div className="mr-2"><LoadingSpinner size="sm" /></div> : <Save className="w-4 h-4 mr-2" />}
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button 
                       onClick={() => navigate('/app/onboarding-command')} // Placeholder fallback
                       className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors border border-indigo-500"
                    >
                        Review Summary <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* OnboardingProgressRail (Left Sidebar) */}
                <aside className="hidden lg:flex w-64 bg-slate-900/50 border-r border-white/5 flex-col pt-6 flex-shrink-0 relative z-10">
                    <div className="px-6 mb-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Workspace Phases</p>
                        <nav className="space-y-1">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={`/app/onboarding/${sessionId}/${link.path}`}
                                    className={({ isActive }) => `
                                        flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                        ${isActive ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}
                                    `}
                                >
                                    <span className="mr-3">{link.icon}</span>
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                    
                    {/* Live AI Status Widget Mini */}
                    <div className="mt-auto p-6 border-t border-white/5">
                         <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-xl">
                             <h4 className="flex items-center text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wide">
                                 <Bot className="w-3 h-3 mr-1.5" /> AI Engine Active
                             </h4>
                             <p className="text-xs text-slate-400 leading-relaxed mb-3">
                                 The Copilot is actively processing your inputs into a verified systemic blueprint.
                             </p>
                             <div className="w-full bg-slate-800 rounded-full h-1.5">
                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '45%' }} />
                             </div>
                         </div>
                    </div>
                </aside>

                {/* Main Content Area (Outlet) */}
                <main className="flex-1 bg-slate-950 relative overflow-y-auto overflow-x-hidden">
                    <Outlet context={{ session, setSession }} />
                </main>
            </div>
        </div>
    );
}
