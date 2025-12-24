"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Kanban,
    BarChart3,
    Settings,
    Flame,
    Sparkles,
    Command,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProgress, useWeeklyStats } from "@/lib/hooks";
import { LEVEL_THRESHOLDS } from "@/lib/types";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/board", label: "Pipeline", icon: Kanban },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const progress = useUserProgress();
    const weeklyStats = useWeeklyStats();

    const currentThreshold = LEVEL_THRESHOLDS[progress?.level ?? 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[(progress?.level ?? 1) + 1] || currentThreshold;
    const xpInLevel = (progress?.xp ?? 0) - currentThreshold;
    const xpForLevel = nextThreshold - currentThreshold;
    const levelProgress = xpForLevel > 0 ? (xpInLevel / xpForLevel) * 100 : 0;

    return (
        <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
            {/* Logo */}
            <div className="p-6">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">JobFlow</h1>
                        <p className="text-xs text-muted-foreground">Job Search Tracker</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                                isActive
                                    ? "text-white"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                />
                            )}
                            <item.icon className={cn("w-5 h-5 relative z-10", isActive && "text-white")} />
                            <span className="relative z-10">{item.label}</span>
                        </Link>
                    );
                })}

                {/* Keyboard shortcut hint */}
                <div className="pt-6 mt-6 border-t border-border">
                    <button
                        onClick={() => {
                            const event = new KeyboardEvent("keydown", {
                                key: "k",
                                metaKey: true,
                            });
                            document.dispatchEvent(event);
                        }}
                        className="flex items-center gap-3 px-4 py-3 w-full text-sm text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-secondary/50"
                    >
                        <Command className="w-5 h-5" />
                        <span>Quick actions</span>
                        <kbd className="ml-auto px-2 py-1 text-xs rounded-md bg-secondary border border-border font-mono">
                            ⌘K
                        </kbd>
                    </button>
                </div>
            </nav>

            {/* Progress section */}
            <div className="p-4 space-y-4 border-t border-border">
                {/* Weekly Goal */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Weekly Goal</span>
                        <span className="font-semibold">
                            {weeklyStats.applied}/{weeklyStats.goal}
                        </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${weeklyStats.percentage}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={cn(
                                "h-full rounded-full transition-colors",
                                weeklyStats.percentage >= 100
                                    ? "bg-emerald-500"
                                    : "bg-blue-500"
                            )}
                        />
                    </div>
                </div>

                {/* Level & XP */}
                <div className="glass-card rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
                                {progress?.level ?? 1}
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Level</p>
                                <p className="text-sm font-semibold">{progress?.xp ?? 0} XP</p>
                            </div>
                        </div>
                        {(progress?.currentStreak ?? 0) > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-orange-500/15 text-orange-500">
                                <Flame className="w-4 h-4" />
                                <span className="text-sm font-semibold">{progress?.currentStreak}</span>
                            </div>
                        )}
                    </div>

                    {/* XP Progress */}
                    <div className="space-y-1.5">
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${levelProgress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">
                            {Math.round(xpInLevel)}/{xpForLevel} to level {(progress?.level ?? 1) + 1}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
