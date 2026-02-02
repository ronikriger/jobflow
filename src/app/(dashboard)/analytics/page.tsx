"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    Clock,
    MessageSquare,
    Briefcase,
    CheckCircle2,
    BarChart3,
} from "lucide-react";
import { useApplications, useUserProgress } from "@/lib/hooks";
import { calculateAnalytics } from "@/lib/utils";
import { STATUS_CONFIG, PLATFORM_CONFIG } from "@/lib/types";
import type { ApplicationStatus } from "@/lib/types";
import { format, subWeeks, startOfWeek, isWithinInterval, endOfWeek } from "date-fns";
import { useSubscription } from "@/components/subscription-provider";
import { UpgradeModal } from "@/components/upgrade-modal";
import { Lock, Crown } from "lucide-react";

const FUNNEL_COLORS: Record<ApplicationStatus, string> = {
    saved: "#6366f1",
    applied: "#3b82f6",
    screen: "#8b5cf6",
    interview1: "#f59e0b",
    interview2: "#f97316",
    final: "#ec4899",
    offer: "#10b981",
    rejected: "#ef4444",
    ghosted: "#6b7280",
};

export default function AnalyticsPage() {
    const [isClient, setIsClient] = useState(false);
    const { apps: applications, loading } = useApplications();
    const progress = useUserProgress();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Use shared subscription context
    const { subscription: subscriptionStatus, loading: subscriptionLoading, isPro } = useSubscription();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const analytics = useMemo(() => {
        if (!applications || applications.length === 0) return null;
        return calculateAnalytics(applications);
    }, [applications]);

    const funnelData = useMemo(() => {
        if (!applications || applications.length === 0) return [];

        const statusCounts: Record<ApplicationStatus, number> = {
            saved: 0, applied: 0, screen: 0, interview1: 0,
            interview2: 0, final: 0, offer: 0, rejected: 0, ghosted: 0,
        };

        applications.forEach((app) => {
            statusCounts[app.status]++;
        });

        const funnelOrder: ApplicationStatus[] = [
            "saved", "applied", "screen", "interview1", "interview2", "final", "offer",
        ];

        return funnelOrder.map((status) => ({
            name: STATUS_CONFIG[status].label,
            value: statusCounts[status],
            color: FUNNEL_COLORS[status],
        }));
    }, [applications]);

    const weeklyTrends = useMemo(() => {
        if (!applications) return [];

        const weeks = [];
        for (let i = 7; i >= 0; i--) {
            const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

            const weekApps = applications.filter((app) => {
                if (!app.appliedAt) return false;
                return isWithinInterval(new Date(app.appliedAt), { start: weekStart, end: weekEnd });
            });

            weeks.push({
                week: format(weekStart, "MMM d"),
                applications: weekApps.length,
            });
        }

        return weeks;
    }, [applications]);

    const platformData = useMemo(() => {
        if (!analytics || !analytics.platformStats) return [];

        return analytics.platformStats
            .filter((p) => p.total > 0)
            .sort((a, b) => b.total - a.total)
            .map((p) => ({
                name: PLATFORM_CONFIG[p.platform]?.label || p.platform,
                total: p.total,
                responseRate: p.responseRate,
                interviewRate: p.interviewRate,
            }));
    }, [analytics]);

    const statusDistribution = useMemo(() => {
        if (!applications || applications.length === 0) return [];

        const counts: Record<string, number> = {};
        applications.forEach((app) => {
            counts[app.status] = (counts[app.status] || 0) + 1;
        });

        return Object.entries(counts)
            .filter(([, value]) => value > 0)
            .map(([status, value]) => ({
                name: STATUS_CONFIG[status as ApplicationStatus]?.label || status,
                value,
                color: FUNNEL_COLORS[status as ApplicationStatus] || "#6b7280",
            }));
    }, [applications]);

    if (!isClient || loading || subscriptionLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#09090b' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p style={{ color: '#a1a1aa' }}>Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!applications || applications.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#09090b' }}>
                <div className="text-center max-w-md">
                    <div
                        className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                    >
                        <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'white' }}>No Data Yet</h2>
                    <p style={{ color: '#71717a' }}>
                        Start adding applications to see your analytics and track your job search performance.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-8" style={{ backgroundColor: '#09090b' }}>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'white' }}>Analytics</h1>
                    <p style={{ color: '#a1a1aa' }} className="mt-1">Track your job search performance</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Response Rate"
                        value={isPro ? `${analytics?.responseRate || 0}%` : "---"}
                        subtitle={`${analytics?.applied || 0} applications sent`}
                        icon={<MessageSquare className="w-5 h-5" />}
                        trend={(analytics?.responseRate || 0) > 20 ? "up" : "neutral"}
                        color="blue"
                        isPro={isPro}
                        onUpgrade={() => setShowUpgradeModal(true)}
                    />
                    <MetricCard
                        title="Interview Rate"
                        value={isPro ? `${analytics?.interviewRate || 0}%` : "---"}
                        subtitle={`${progress?.totalInterviews ?? 0} total interviews`}
                        icon={<Briefcase className="w-5 h-5" />}
                        trend={(analytics?.interviewRate || 0) > 10 ? "up" : "neutral"}
                        color="violet"
                        isPro={isPro}
                        onUpgrade={() => setShowUpgradeModal(true)}
                    />
                    <MetricCard
                        title="Avg. Response Time"
                        value={isPro ? `${analytics?.avgTimeToResponse || 0} days` : "---"}
                        subtitle="Time to first response"
                        icon={<Clock className="w-5 h-5" />}
                        trend={(analytics?.avgTimeToResponse || 0) < 7 ? "up" : "down"}
                        color="amber"
                        isPro={isPro}
                        onUpgrade={() => setShowUpgradeModal(true)}
                    />
                    <MetricCard
                        title="Offers Received"
                        value={progress?.totalOffers ?? 0}
                        subtitle={`${analytics?.total || 0} total applications`}
                        icon={<CheckCircle2 className="w-5 h-5" />}
                        trend="neutral"
                        color="emerald"
                        isPro={true} // Always visible
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly Activity */}
                    <div className="rounded-2xl p-6" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
                        <h3 className="text-lg font-semibold mb-6" style={{ color: 'white' }}>Weekly Activity</h3>
                        {weeklyTrends.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={weeklyTrends}>
                                    <defs>
                                        <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                    <XAxis dataKey="week" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={{ stroke: "#27272a" }} />
                                    <YAxis tick={{ fill: "#71717a", fontSize: 12 }} axisLine={{ stroke: "#27272a" }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", color: "white" }}
                                        labelStyle={{ color: "#fafafa" }}
                                    />
                                    <Area type="monotone" dataKey="applications" stroke="#3b82f6" fill="url(#colorApps)" strokeWidth={2} name="Applications" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center" style={{ color: '#71717a' }}>
                                No weekly data yet
                            </div>
                        )}
                    </div>

                    {/* Status Distribution */}
                    <div className="rounded-2xl p-6" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
                        <h3 className="text-lg font-semibold mb-6" style={{ color: 'white' }}>Status Distribution</h3>
                        {statusDistribution.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={statusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={85}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {statusDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", color: "white" }}
                                            formatter={(value: number, name: string, props: any) => [`${value} applications`, props.payload.name]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                                    {statusDistribution.map((item) => (
                                        <div key={item.name} className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-xs" style={{ color: '#a1a1aa' }}>{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center" style={{ color: '#71717a' }}>
                                No status data yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Funnel Chart - Pro Only */}
                <div className="rounded-2xl p-6 relative overflow-hidden" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold" style={{ color: 'white' }}>Application Funnel</h3>
                        {!isPro && <Lock className="w-5 h-5 text-amber-500" />}
                    </div>

                    {!isPro && (
                        <div className="absolute inset-0 z-10 backdrop-blur-sm bg-black/50 flex flex-col items-center justify-center text-center p-6">
                            <div className="p-3 rounded-full bg-amber-500/10 mb-4">
                                <Crown className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Pro Analytics</h3>
                            <p className="text-zinc-400 mb-6 max-w-sm">
                                Upgrade to visualize your conversion rates at each stage of the hiring pipeline.
                            </p>
                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all hover:scale-105"
                                style={{
                                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)"
                                }}
                            >
                                Unlock Pro Features
                            </button>
                        </div>
                    )}

                    {funnelData.length > 0 && funnelData.some(d => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={funnelData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                                <XAxis type="number" tick={{ fill: "#71717a", fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" tick={{ fill: "#71717a", fontSize: 12 }} width={100} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", color: "white" }}
                                    formatter={(value: number, name: string, props: any) => [`${value} applications`, props.payload.name]}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center" style={{ color: '#71717a' }}>
                            No funnel data yet
                        </div>
                    )}
                </div>

                {/* Platform Performance - Pro Only */}
                <div className="rounded-2xl p-6 relative overflow-hidden" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold" style={{ color: 'white' }}>Platform Performance</h3>
                        {!isPro && <Lock className="w-5 h-5 text-amber-500" />}
                    </div>

                    {!isPro && (
                        <div className="absolute inset-0 z-10 backdrop-blur-sm bg-black/50 flex flex-col items-center justify-center text-center p-6">
                            <div className="p-3 rounded-full bg-amber-500/10 mb-4">
                                <Crown className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Track Your Sources</h3>
                            <p className="text-zinc-400 mb-6 max-w-sm">
                                See which job boards and platforms are generating the most interviews.
                            </p>
                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all hover:scale-105"
                                style={{
                                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)"
                                }}
                            >
                                Unlock Pro Features
                            </button>
                        </div>
                    )}

                    {platformData.length === 0 ? (
                        <p className="text-center py-8" style={{ color: '#71717a' }}>Not enough data yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #27272a' }}>
                                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: '#a1a1aa' }}>Platform</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: '#a1a1aa' }}>Applications</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: '#a1a1aa' }}>Response Rate</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: '#a1a1aa' }}>Interview Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {platformData.map((platform, index) => (
                                        <tr key={platform.name} style={{ borderBottom: '1px solid rgba(39, 39, 42, 0.5)' }}>
                                            <td className="py-3 px-4 font-medium" style={{ color: 'white' }}>{platform.name}</td>
                                            <td className="py-3 px-4 text-right" style={{ color: '#e4e4e7' }}>{platform.total}</td>
                                            <td className="py-3 px-4 text-right" style={{ color: platform.responseRate > 20 ? '#10b981' : platform.responseRate > 10 ? '#f59e0b' : '#a1a1aa' }}>
                                                {platform.responseRate}%
                                            </td>
                                            <td className="py-3 px-4 text-right" style={{ color: platform.interviewRate > 15 ? '#10b981' : platform.interviewRate > 5 ? '#f59e0b' : '#a1a1aa' }}>
                                                {platform.interviewRate}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <UpgradeModal
                    open={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    currentApps={subscriptionStatus?.appCount ?? 0}
                    maxApps={20}
                />
            </div>
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    trend: "up" | "down" | "neutral";
    color: "blue" | "violet" | "amber" | "emerald";
    isPro?: boolean;
    onUpgrade?: () => void;
}

function MetricCard({ title, value, subtitle, icon, trend, color, isPro = true, onUpgrade }: MetricCardProps) {
    const colorConfig = {
        blue: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
        violet: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6' },
        amber: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
        emerald: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
    };

    return (
        <div
            className="rounded-2xl p-5 relative overflow-hidden group cursor-pointer"
            style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
            onClick={() => !isPro && onUpgrade?.()}
        >
            {!isPro && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Lock className="w-6 h-6 text-amber-500" />
                </div>
            )}

            <div className="flex items-start justify-between mb-4">
                <div
                    className="p-2.5 rounded-xl"
                    style={{ backgroundColor: colorConfig[color].bg, color: colorConfig[color].text }}
                >
                    {icon}
                </div>
                {!isPro ? (
                    <Lock className="w-4 h-4 text-zinc-600" />
                ) : trend !== "neutral" && (
                    <div style={{ color: trend === "up" ? "#10b981" : "#ef4444" }}>
                        {trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-2xl font-bold" style={{ color: 'white' }}>{value}</p>
                <p className="text-sm" style={{ color: '#e4e4e7' }}>{title}</p>
                <p className="text-xs" style={{ color: '#71717a' }}>{subtitle}</p>
            </div>
        </div>
    );
}
