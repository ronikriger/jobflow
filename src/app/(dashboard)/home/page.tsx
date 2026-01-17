"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    Target,
    Clock,
    TrendingUp,
    Briefcase,
    MessageSquare,
    CalendarCheck,
    FileCheck,
    ChevronRight,
    Flame,
    Sparkles,
    Rocket,
    ArrowRight,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    useWeeklyStats,
    useDailyStats,
    useStaleApplications,
    useNextActions,
    useUserProgress,
} from "@/lib/hooks";
import { useUser } from "@stackframe/stack";
import { useActiveApplications, markFollowUpSent, markPrepDone } from "@/lib/hooks";
import { ApplicationCardCompact } from "@/components/application-card";
import { AddApplicationModal } from "@/components/add-application-modal";
import { DashboardSkeleton } from "@/components/skeleton";
import type { NextAction } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [dismissedActionIds, setDismissedActionIds] = useState<Set<string>>(new Set());

    const weeklyStats = useWeeklyStats();
    const dailyStats = useDailyStats();
    const staleApps = useStaleApplications();
    const nextActions = useNextActions();
    const visibleActions = nextActions.filter((action) => !dismissedActionIds.has(action.id));

    const handleActionDone = (id: string) => {
        setDismissedActionIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const progress = useUserProgress();
    const { apps: applications, loading, refresh, optimisticUpdate } = useActiveApplications();

    // Ensure we're on the client
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Show skeleton loading until client-side data is ready
    if (!isClient || loading) {
        return <DashboardSkeleton />;
    }

    const hasApplications = applications && applications.length > 0;
    const activeAppsCount = applications?.filter(
        (a) => !["rejected", "ghosted", "offer"].includes(a.status)
    ).length ?? 0;

    // Empty state for new users
    if (!hasApplications) {
        return (
            <div className="min-h-screen p-8" style={{ backgroundColor: '#09090b' }}>
                <div className="max-w-2xl mx-auto pt-20">
                    <div className="text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-2xl float pulse-glow"
                            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)' }}
                        >
                            <Rocket className="w-12 h-12 text-white" />
                        </motion.div>

                        <div className="space-y-3">
                            <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'white' }}>Welcome to JobFlow</h1>
                            <p className="text-lg max-w-md mx-auto" style={{ color: '#a1a1aa' }}>
                                Your personal job search command center. Track applications, stay organized, and land your dream job.
                            </p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="pt-4"
                        >
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-semibold text-lg transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1 hover-glow"
                                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)' }}
                            >
                                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                                Add Your First Application
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </button>
                            <AddApplicationModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={refresh} optimisticUpdate={optimisticUpdate} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="pt-12 grid grid-cols-3 gap-6 text-center"
                        >
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                                    <Target className="w-6 h-6" style={{ color: '#10b981' }} />
                                </div>
                                <h3 className="font-semibold" style={{ color: 'white' }}>Set Goals</h3>
                                <p className="text-sm" style={{ color: '#71717a' }}>Weekly & daily targets</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                                    <Briefcase className="w-6 h-6" style={{ color: '#8b5cf6' }} />
                                </div>
                                <h3 className="font-semibold" style={{ color: 'white' }}>Track Progress</h3>
                                <p className="text-sm" style={{ color: '#71717a' }}>Visual pipeline board</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                                    <Flame className="w-6 h-6" style={{ color: '#f59e0b' }} />
                                </div>
                                <h3 className="font-semibold" style={{ color: 'white' }}>Stay Motivated</h3>
                                <p className="text-sm" style={{ color: '#71717a' }}>XP, streaks & badges</p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <AddApplicationModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={refresh} optimisticUpdate={optimisticUpdate} />
            </div>
        );
    }

    // Dashboard with data
    return (
        <div className="min-h-screen p-6 md:p-8" style={{ backgroundColor: '#09090b' }}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'white' }}>Dashboard</h1>
                        <p style={{ color: '#a1a1aa' }} className="mt-1">
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="group flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover-glow"
                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                    >
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        Add Application
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Weekly Goal Card */}
                    <div className="rounded-2xl p-5 space-y-4 card-hover gradient-border" style={{ backgroundColor: '#18181b' }}>
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                                <Target className="w-5 h-5" style={{ color: '#3b82f6' }} />
                            </div>
                            <span className="text-2xl md:text-3xl font-bold" style={{ color: 'white' }}>
                                {weeklyStats.applied}<span className="text-lg font-normal" style={{ color: '#71717a' }}>/{weeklyStats.goal}</span>
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-2" style={{ color: '#e4e4e7' }}>Weekly Goal</p>
                            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#27272a' }}>
                                <div
                                    className="h-full rounded-full transition-all progress-animated"
                                    style={{
                                        width: `${Math.min(weeklyStats.percentage, 100)}%`,
                                        background: weeklyStats.percentage >= 100 ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Daily Progress */}
                    <div className="rounded-2xl p-5 space-y-4 card-hover gradient-border" style={{ backgroundColor: '#18181b' }}>
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                                <TrendingUp className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                            </div>
                            <span className="text-2xl md:text-3xl font-bold" style={{ color: 'white' }}>
                                {dailyStats.applied}<span className="text-lg font-normal" style={{ color: '#71717a' }}>/{dailyStats.goal}</span>
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-2" style={{ color: '#e4e4e7' }}>Today&apos;s Progress</p>
                            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#27272a' }}>
                                <div
                                    className="h-full rounded-full transition-all progress-animated"
                                    style={{ width: `${Math.min(dailyStats.percentage, 100)}%`, background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Active Applications */}
                    <div className="rounded-2xl p-5 space-y-4 card-hover gradient-border" style={{ backgroundColor: '#18181b' }}>
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                                <Briefcase className="w-5 h-5" style={{ color: '#f59e0b' }} />
                            </div>
                            <span className="text-2xl md:text-3xl font-bold" style={{ color: 'white' }}>{activeAppsCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium" style={{ color: '#e4e4e7' }}>Active Applications</p>
                            <Link href="/board" className="text-xs hover:underline" style={{ color: '#3b82f6' }}>
                                View →
                            </Link>
                        </div>
                    </div>

                    {/* Current Streak */}
                    <div className="rounded-2xl p-5 space-y-4 card-hover gradient-border" style={{ backgroundColor: '#18181b' }}>
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
                                <Flame className="w-5 h-5" style={{ color: '#f97316' }} />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl md:text-3xl font-bold" style={{ color: 'white' }}>{progress?.currentStreak ?? 0}</span>
                                <span style={{ color: '#71717a' }}>days</span>
                            </div>
                        </div>
                        <p className="text-sm font-medium" style={{ color: '#e4e4e7' }}>
                            Current Streak
                            {progress?.longestStreak ? <span style={{ color: '#71717a' }}> · Best: {progress.longestStreak}</span> : ""}
                        </p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Next Actions */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'white' }}>
                                <Clock className="w-5 h-5" style={{ color: '#71717a' }} />
                                Next Actions
                            </h2>
                            {visibleActions.length > 0 && (
                                <span className="text-sm px-2 py-1 rounded-lg" style={{ color: '#a1a1aa', backgroundColor: '#27272a' }}>
                                    {visibleActions.length} pending
                                </span>
                            )}
                        </div>

                        <div className="space-y-3">
                            {visibleActions.length === 0 ? (
                                <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
                                    <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                                        <CalendarCheck className="w-7 h-7" style={{ color: '#10b981' }} />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-1" style={{ color: 'white' }}>All caught up!</h3>
                                    <p className="text-sm" style={{ color: '#71717a' }}>No pending actions. Add more applications to keep momentum.</p>
                                </div>
                            ) : (
                                visibleActions.slice(0, 5).map((action, index) => (
                                    <NextActionCard key={action.id} action={action} index={index} onDone={handleActionDone} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Stale Applications */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'white' }}>
                                <Clock className="w-5 h-5" style={{ color: '#f59e0b' }} />
                                Needs Follow-up
                            </h2>
                            {staleApps.length > 0 && (
                                <span className="text-sm font-medium px-2 py-1 rounded-lg" style={{ color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                                    {staleApps.length}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            {staleApps.length === 0 ? (
                                <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
                                    <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                                        <Sparkles className="w-6 h-6" style={{ color: '#10b981' }} />
                                    </div>
                                    <h3 className="font-semibold mb-1" style={{ color: 'white' }}>Looking good!</h3>
                                    <p className="text-sm" style={{ color: '#71717a' }}>No stale applications.</p>
                                </div>
                            ) : (
                                staleApps.slice(0, 4).map((app) => (
                                    <ApplicationCardCompact key={app.id} application={app} />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* XP Progress */}
                {progress && (
                    <div className="rounded-2xl p-6" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                                    {progress.level}
                                </div>
                                <div>
                                    <p className="font-semibold" style={{ color: 'white' }}>Level {progress.level}</p>
                                    <p className="text-sm" style={{ color: '#71717a' }}>{progress.xp} total XP</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm" style={{ color: '#71717a' }}>Next level</p>
                                <p className="font-semibold" style={{ color: 'white' }}>{progress.level * 100 - (progress.xp % 100)} XP to go</p>
                            </div>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#27272a' }}>
                            <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${(progress.xp % 100)}%`, background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' }}
                            />
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/board" className="rounded-xl p-4 transition-all group" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                            <TrendingUp className="w-5 h-5" style={{ color: '#3b82f6' }} />
                        </div>
                        <p className="font-medium" style={{ color: 'white' }}>Pipeline</p>
                        <p className="text-xs" style={{ color: '#71717a' }}>View your flow</p>
                    </Link>
                    <Link href="/analytics" className="rounded-xl p-4 transition-all group" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                            <Zap className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                        </div>
                        <p className="font-medium" style={{ color: 'white' }}>Analytics</p>
                        <p className="text-xs" style={{ color: '#71717a' }}>Track performance</p>
                    </Link>
                    <Link href="/settings" className="rounded-xl p-4 transition-all group" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                            <Target className="w-5 h-5" style={{ color: '#f59e0b' }} />
                        </div>
                        <p className="font-medium" style={{ color: 'white' }}>Goals</p>
                        <p className="text-xs" style={{ color: '#71717a' }}>Set targets</p>
                    </Link>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="rounded-xl p-4 transition-all group text-left"
                        style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                            <Plus className="w-5 h-5" style={{ color: '#10b981' }} />
                        </div>
                        <p className="font-medium" style={{ color: 'white' }}>Quick Add</p>
                        <p className="text-xs" style={{ color: '#71717a' }}>New application</p>
                    </button>
                </div>
            </div>

            <AddApplicationModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={refresh} optimisticUpdate={optimisticUpdate} />
        </div>
    );
}

function NextActionCard({ action, index, onDone }: { action: NextAction; index: number; onDone: (id: string) => void }) {
    const user = useUser();
    const iconMap = {
        "follow-up": MessageSquare,
        prep: FileCheck,
        apply: Plus,
        "log-outcome": CalendarCheck,
    };
    const Icon = iconMap[action.type];

    const colorMap = {
        "follow-up": { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
        prep: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' },
        apply: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
        "log-outcome": { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
    };

    const handleAction = async () => {
        if (action.type === "follow-up") {
            await markFollowUpSent(action.application.id!, !!user);
        } else if (action.type === "prep") {
            await markPrepDone(action.application.id!, !!user);
        }
        onDone(action.id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
        >
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colorMap[action.type].bg }}
            >
                <Icon className="w-5 h-5" style={{ color: colorMap[action.type].color }} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-medium truncate" style={{ color: 'white' }}>{action.description}</p>
                <p className="text-sm truncate" style={{ color: '#71717a' }}>{action.application.company} · {action.application.role}</p>
            </div>

            <button
                onClick={handleAction}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                style={{ backgroundColor: '#27272a', color: 'white' }}
            >
                Done
                <ChevronRight className="w-4 h-4" />
            </button>
        </motion.div>
    );
}


