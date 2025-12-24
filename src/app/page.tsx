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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
    const [showAddModal, setShowAddModal] = useState(false);
    const weeklyStats = useWeeklyStats();
    const dailyStats = useDailyStats();
    const staleApps = useStaleApplications();
    const nextActions = useNextActions();
    const progress = useUserProgress();
    const applications = useActiveApplications();

    const activeAppsCount = applications?.filter(
        (a) => !["rejected", "ghosted", "offer"].includes(a.status)
    ).length ?? 0;

    return (
        <div className="min-h-screen p-8">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto space-y-8"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Today</h1>
                        <p className="text-muted-foreground mt-1">
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                    >
                        <Plus className="w-4 h-4" />
                        Add Application
                    </button>
                </motion.div>

                {/* Stats Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Weekly Goal Card */}
                    <div className="glass-card rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Target className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-2xl font-bold">
                                {weeklyStats.applied}/{weeklyStats.goal}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Weekly Goal</p>
                            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${weeklyStats.percentage}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className={cn(
                                        "h-full rounded-full",
                                        weeklyStats.percentage >= 100 ? "bg-emerald-500" : "bg-primary"
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Daily Progress */}
                    <div className="glass-card rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="p-2 rounded-lg bg-violet-500/10">
                                <TrendingUp className="w-5 h-5 text-violet-400" />
                            </div>
                            <span className="text-2xl font-bold">
                                {dailyStats.applied}/{dailyStats.goal}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Today&apos;s Progress</p>
                            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${dailyStats.percentage}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-violet-500 rounded-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Active Applications */}
                    <div className="glass-card rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <Briefcase className="w-5 h-5 text-amber-400" />
                            </div>
                            <span className="text-2xl font-bold">{activeAppsCount}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Active Applications</p>
                    </div>

                    {/* Current Streak */}
                    <div className="glass-card rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <Flame className="w-5 h-5 text-orange-400" />
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-2xl font-bold">{progress?.currentStreak ?? 0}</span>
                                <span className="text-sm text-muted-foreground">days</span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Current Streak
                            {progress?.longestStreak ? ` (Best: ${progress.longestStreak})` : ""}
                        </p>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Next Actions */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                                Next Actions
                            </h2>
                            <span className="text-sm text-muted-foreground">
                                {nextActions.length} pending
                            </span>
                        </div>

                        <div className="space-y-3">
                            {nextActions.length === 0 ? (
                                <EmptyState
                                    icon={<CalendarCheck className="w-8 h-8" />}
                                    title="All caught up!"
                                    description="No pending actions. Add more applications to keep your momentum."
                                />
                            ) : (
                                nextActions.slice(0, 5).map((action, index) => (
                                    <NextActionCard
                                        key={action.id}
                                        action={action}
                                        index={index}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Stale Applications */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-400" />
                                Stale Applications
                            </h2>
                            <span className="text-sm text-amber-400 font-medium">
                                {staleApps.length}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {staleApps.length === 0 ? (
                                <EmptyState
                                    icon={<Sparkles className="w-8 h-8" />}
                                    title="Looking good!"
                                    description="No stale applications. Keep the momentum going!"
                                    small
                                />
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
                        <h2 className="text-lg font-semibold">Application Activity</h2>
                        <span className="text-sm text-muted-foreground">Last 52 weeks</span>
                    </div>
                    <HeatmapCalendar applications={applications || []} />
                </motion.div>

                {/* Badges Section */}
                {progress?.badges && progress.badges.length > 0 && (
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-400" />
                                Achievements
                            </h2>
                            <span className="text-sm text-muted-foreground">
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
        "follow-up": "text-blue-400 bg-blue-500/10",
        prep: "text-violet-400 bg-violet-500/10",
        apply: "text-emerald-400 bg-emerald-500/10",
        "log-outcome": "text-amber-400 bg-amber-500/10",
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
            className="glass-card rounded-xl p-4 flex items-center gap-4"
        >
            <div className={cn("p-2.5 rounded-xl", colorMap[action.type])}>
                <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-medium">{action.description}</p>
                <p className="text-sm text-muted-foreground truncate">
                    {action.application.role}
                </p>
            </div>

            <button
                onClick={handleAction}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors"
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
        <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="font-medium text-sm">{config.label}</p>
                <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
        </div>
    );
}

function EmptyState({
    icon,
    title,
    description,
    small = false,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    small?: boolean;
}) {
    return (
        <div className={cn(
            "glass-card rounded-xl flex flex-col items-center justify-center text-center",
            small ? "p-6" : "p-12"
        )}>
            <div className="text-muted-foreground mb-3">{icon}</div>
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
        </div>
    );
}

