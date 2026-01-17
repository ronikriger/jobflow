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
    Command,
    Zap,
} from "lucide-react";
import { useUserProgress, useWeeklyStats } from "@/lib/hooks";
import { AuthButton } from "./auth-button";
import { ProBadge } from "./pro-badge";
import { getSubscriptionStatus } from "@/lib/actions";
import { useEffect, useState } from "react";

const navItems = [
    { href: "/home", label: "Dashboard", icon: LayoutDashboard },
    { href: "/board", label: "Pipeline", icon: Kanban },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const progress = useUserProgress();
    const weeklyStats = useWeeklyStats();
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        getSubscriptionStatus().then(status => setIsPro(status?.tier === "pro"));
    }, []);

    return (
        <aside
            className="w-64 flex flex-col"
            style={{ backgroundColor: '#0f0f10', borderRight: '1px solid #27272a' }}
        >
            {/* Logo */}
            <div className="p-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)' }}
                    >
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-bold text-lg tracking-tight" style={{ color: 'white' }}>JobFlow</h1>
                            {isPro && <ProBadge size="sm" showText={true} />}
                        </div>
                        <p className="text-xs" style={{ color: '#71717a' }}>Job Search Tracker</p>
                    </div>
                </Link>
            </div>

            {/* Auth Button */}
            <div className="px-4 pb-4">
                <AuthButton />
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
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative hover:bg-white/5"
                            style={{
                                color: isActive ? 'white' : '#a1a1aa',
                            }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 rounded-xl shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                />
                            )}
                            <item.icon className="w-5 h-5 relative z-10" style={{ color: isActive ? 'white' : '#a1a1aa' }} />
                            <span className="relative z-10">{item.label}</span>
                        </Link>
                    );
                })}

                {/* Keyboard shortcut hint */}
                <div className="pt-6 mt-6" style={{ borderTop: '1px solid #27272a' }}>
                    <button
                        onClick={() => {
                            const event = new KeyboardEvent("keydown", {
                                key: "k",
                                metaKey: true,
                            });
                            document.dispatchEvent(event);
                        }}
                        className="flex items-center gap-3 px-4 py-3 w-full text-sm transition-colors rounded-xl"
                        style={{ color: '#a1a1aa' }}
                    >
                        <Command className="w-5 h-5" />
                        <span>Quick actions</span>
                        <kbd
                            className="ml-auto px-2 py-1 text-xs rounded-md font-mono"
                            style={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa' }}
                        >
                            ⌘K
                        </kbd>
                    </button>
                </div>
            </nav>

            {/* Progress section */}
            <div className="p-4 space-y-4" style={{ borderTop: '1px solid #27272a' }}>
                {/* Weekly Goal */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span style={{ color: '#a1a1aa' }}>Weekly Goal</span>
                        <span className="font-semibold" style={{ color: 'white' }}>
                            {weeklyStats.applied}/{weeklyStats.goal}
                        </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#27272a' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(weeklyStats.percentage, 100)}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="h-full rounded-full progress-animated"
                            style={{ background: weeklyStats.percentage >= 100 ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)' }}
                        />
                    </div>
                </div>

                {/* Level & XP */}
                <div className="rounded-xl p-4 space-y-3 gradient-border" style={{ backgroundColor: '#18181b' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
                            >
                                {progress?.level ?? 1}
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#71717a' }}>Level</p>
                                <p className="text-sm font-semibold" style={{ color: 'white' }}>{progress?.xp ?? 0} XP</p>
                            </div>
                        </div>
                        {(progress?.currentStreak ?? 0) > 0 && (
                            <div
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                                style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}
                            >
                                <Flame className="w-4 h-4" />
                                <span className="text-sm font-semibold">{progress?.currentStreak}</span>
                            </div>
                        )}
                    </div>

                    {/* XP Progress */}
                    <div className="space-y-1.5">
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#27272a' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(progress?.xp ?? 0) % 100}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{ background: 'linear-gradient(90deg, #f59e0b, #ea580c)' }}
                            />
                        </div>
                        <p className="text-xs text-right" style={{ color: '#71717a' }}>
                            {(progress?.xp ?? 0) % 100}/100 to level {(progress?.level ?? 1) + 1}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
