"use client";

import { useState } from "react";
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
    Award,
    Sparkles,
    Rocket,
    ArrowRight,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    useWeeklyStats,
    useDailyStats,
    useStaleApplications,
    useNextActions,
    useUserProgress,
    useActiveApplications,
    markFollowUpSent,
} from "@/lib/hooks";
import { ApplicationCardCompact } from "@/components/application-card";
import { AddApplicationModal } from "@/components/add-application-modal";
import { HeatmapCalendar } from "@/components/heatmap-calendar";
import { BADGE_CONFIG } from "@/lib/types";
import type { NextAction, BadgeType } from "@/lib/types";
import Link from "next/link";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
    const [showAddModal, setShowAddModal] = useState(false);
    const weeklyStats = useWeeklyStats();
    const dailyStats = useDailyStats();
    const staleApps = useStaleApplications();
    const nextActions = useNextActions();
    const progress = useUserProgress();
    const applications = useActiveApplications();

    // Loading state
    if (applications === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-zinc-400">Loading your dashboard...</p>
                </motion.div>
            </div>
        );
    }

    const hasApplications = applications && applications.length > 0;
    const activeAppsCount = applications?.filter(
        (a) => !["rejected", "ghosted", "offer"].includes(a.status)
    ).length ?? 0;

    // Empty state for new users
    if (!hasApplications) {
        return (
            <div className="min-h-screen p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto pt-20"
                >
                    <div className="text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg"
                        >
                            <Rocket className="w-10 h-10 text-white" />
                        </motion.div>

                        <div className="space-y-3">
                            <h1 className="text-4xl font-bold tracking-tight text-white">Welcome to JobFlow</h1>
                            <p className="text-lg text-zinc-400 max-w-md mx-auto">
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
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5"
                            >
                                <Plus className="w-5 h-5" />
                                Add Your First Application
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="pt-12 grid grid-cols-3 gap-6 text-center"
                        >
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <Target className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h3 className="font-semibold text-white">Set Goals</h3>
                                <p className="text-sm text-zinc-400">Weekly & daily targets</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto rounded-xl bg-violet-500/10 flex items-center justify-center">
                                    <Briefcase className="w-6 h-6 text-violet-500" />
                                </div>
                                <h3 className="font-semibold text-white">Track Progress</h3>
                                <p className="text-sm text-zinc-400">Visual pipeline board</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <Flame className="w-6 h-6 text-amber-500" />
                                </div>
                                <h3 className="font-semibold text-white">Stay Motivated</h3>
                                <p className="text-sm text-zinc-400">XP, streaks & badges</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                <AddApplicationModal open={showAddModal} onClose={() => setShowAddModal(false)} />
            </div>
        );
    }

    // Dashboard with data
    return (
        <div className="min-h-screen p-6 md:p-8">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto space-y-6"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Dashboard</h1>
                        <p className="text-zinc-400 mt-1">
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                    >
                        <Plus className="w-4 h-4" />
                        Add Application
                    </button>
                </motion.div>

                {/* Stats Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Weekly Goal Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Target className="w-5 h-5 text-blue-500" />
                            </div>
                            <span className="text-2xl md:text-3xl font-bold text-white">
                                {weeklyStats.applied}<span className="text-lg text-zinc-500 font-normal">/{weeklyStats.goal}</span>
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-300 mb-2">Weekly Goal</p>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(weeklyStats.percentage, 100)}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className={cn(
                                        "h-full rounded-full",
                                        weeklyStats.percentage >= 100 ? "bg-emerald-500" : "bg-blue-500"
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Daily Progress */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-violet-500" />
                            </div>
                            <span className="text-2xl md:text-3xl font-bold text-white">
                                {dailyStats.applied}<span className="text-lg text-zinc-500 font-normal">/{dailyStats.goal}</span>
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-300 mb-2">Today&apos;s Progress</p>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(dailyStats.percentage, 100)}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-violet-500 rounded-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Active Applications */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-amber-500" />
                            </div>
                            <span className="text-2xl md:text-3xl font-bold text-white">{activeAppsCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-zinc-300">Active Applications</p>
                            <Link href="/board" className="text-xs text-blue-400 hover:text-blue-300">
                                View all →
                            </Link>
                        </div>
                    </div>

                    {/* Current Streak */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <Flame className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl md:text-3xl font-bold text-white">{progress?.currentStreak ?? 0}</span>
                                <span className="text-zinc-500">days</span>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-zinc-300">
                            Current Streak
                            {progress?.longestStreak ? <span className="text-zinc-500"> · Best: {progress.longestStreak}</span> : ""}
                        </p>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Next Actions */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-zinc-400" />
                                Next Actions
                            </h2>
                            {nextActions.length > 0 && (
                                <span className="text-sm text-zinc-400 px-2 py-1 rounded-lg bg-zinc-800">
                                    {nextActions.length} pending
                                </span>
                            )}
                        </div>

                        <div className="space-y-3">
                            {nextActions.length === 0 ? (
                                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
                                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                                        <CalendarCheck className="w-7 h-7 text-emerald-500" />
                                    </div>
                                    <h3 className="font-semibold text-lg text-white mb-1">All caught up!</h3>
                                    <p className="text-sm text-zinc-400">No pending actions. Add more applications to keep momentum.</p>
                                </div>
                            ) : (
                                nextActions.slice(0, 5).map((action, index) => (
                                    <NextActionCard key={action.id} action={action} index={index} />
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Stale Applications */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-500" />
                                Needs Follow-up
                            </h2>
                            {staleApps.length > 0 && (
                                <span className="text-sm font-medium text-amber-500 px-2 py-1 rounded-lg bg-amber-500/10">
                                    {staleApps.length}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            {staleApps.length === 0 ? (
                                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
                                    <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                                        <Sparkles className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <h3 className="font-semibold text-white mb-1">Looking good!</h3>
                                    <p className="text-sm text-zinc-400">No stale applications.</p>
                                </div>
                            ) : (
                                staleApps.slice(0, 4).map((app) => (
                                    <ApplicationCardCompact key={app.id} application={app} />
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Heatmap Calendar */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Application Activity</h2>
                        <span className="text-sm text-zinc-400">Last 52 weeks</span>
                    </div>
                    <HeatmapCalendar applications={applications || []} />
                </motion.div>

                {/* Badges Section */}
                {progress?.badges && progress.badges.length > 0 && (
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-500" />
                                Achievements
                            </h2>
                            <span className="text-sm text-zinc-400">
                                {progress.badges.length} earned
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {progress.badges.map((badge) => (
                                <BadgeCard key={badge} badge={badge} />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* XP Progress */}
                {progress && (
                    <motion.div variants={itemVariants}>
                        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        {progress.level}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Level {progress.level}</p>
                                        <p className="text-sm text-zinc-400">{progress.xp} total XP</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-zinc-400">Next level</p>
                                    <p className="font-semibold text-white">{progress.level * 100 - (progress.xp % 100)} XP to go</p>
                                </div>
                            </div>
                            <div className="h-3 bg-zinc-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(progress.xp % 100)}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            <AddApplicationModal open={showAddModal} onClose={() => setShowAddModal(false)} />
        </div>
    );
}

function NextActionCard({ action, index }: { action: NextAction; index: number }) {
    const iconMap = {
        "follow-up": MessageSquare,
        prep: FileCheck,
        apply: Plus,
        "log-outcome": CalendarCheck,
    };
    const Icon = iconMap[action.type];

    const colorMap = {
        "follow-up": "bg-blue-500/10 text-blue-500",
        prep: "bg-violet-500/10 text-violet-500",
        apply: "bg-emerald-500/10 text-emerald-500",
        "log-outcome": "bg-amber-500/10 text-amber-500",
    };

    const handleAction = async () => {
        if (action.type === "follow-up") {
            await markFollowUpSent(action.application.id!);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors"
        >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", colorMap[action.type])}>
                <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{action.description}</p>
                <p className="text-sm text-zinc-400 truncate">{action.application.company} · {action.application.role}</p>
            </div>

            <button
                onClick={handleAction}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-white transition-colors flex-shrink-0"
            >
                Done
                <ChevronRight className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

function BadgeCard({ badge }: { badge: BadgeType }) {
    const config = BADGE_CONFIG[badge];

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Award className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="font-medium text-sm text-white">{config.label}</p>
                <p className="text-xs text-zinc-400">{config.description}</p>
            </div>
        </div>
    );
}
