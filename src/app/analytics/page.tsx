"use client";

import { useMemo } from "react";
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
    Loader2,
} from "lucide-react";
import { useApplications, useUserProgress } from "@/lib/hooks";
import { calculateAnalytics, cn } from "@/lib/utils";
import { STATUS_CONFIG, PLATFORM_CONFIG } from "@/lib/types";
import type { ApplicationStatus } from "@/lib/types";
import { format, subWeeks, startOfWeek, isWithinInterval, endOfWeek } from "date-fns";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

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
    const applications = useApplications();
    const progress = useUserProgress();

    const analytics = useMemo(() => {
        if (!applications || applications.length === 0) return null;
        return calculateAnalytics(applications);
    }, [applications]);

    // Funnel data
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

    // Weekly trends (last 8 weeks)
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

            const interviews = applications.filter((app) => {
                const updated = new Date(app.updatedAt);
                return (
                    isWithinInterval(updated, { start: weekStart, end: weekEnd }) &&
                    ["screen", "interview1", "interview2", "final"].includes(app.status)
                );
            });

            weeks.push({
                week: format(weekStart, "MMM d"),
                applications: weekApps.length,
                interviews: interviews.length,
            });
        }

        return weeks;
    }, [applications]);

    // Platform breakdown
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

    // Status distribution for pie chart
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

    // Loading state
    if (applications === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-zinc-400">Loading analytics...</p>
                </motion.div>
            </div>
        );
    }

    // Empty state
    if (!applications || applications.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mb-6 shadow-lg">
                        <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-white">No Data Yet</h2>
                    <p className="text-zinc-400 mb-6">
                        Start adding applications to see your analytics and track your job search performance.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-8 bg-zinc-950">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-6"
            >
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Analytics</h1>
                    <p className="text-zinc-400 mt-1">Track your job search performance</p>
                </motion.div>

                {/* Key Metrics */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Response Rate"
                        value={`${analytics?.responseRate || 0}%`}
                        subtitle={`${analytics?.applied || 0} applications sent`}
                        icon={<MessageSquare className="w-5 h-5" />}
                        trend={(analytics?.responseRate || 0) > 20 ? "up" : "neutral"}
                        color="blue"
                    />
                    <MetricCard
                        title="Interview Rate"
                        value={`${analytics?.interviewRate || 0}%`}
                        subtitle={`${progress?.totalInterviews ?? 0} total interviews`}
                        icon={<Briefcase className="w-5 h-5" />}
                        trend={(analytics?.interviewRate || 0) > 10 ? "up" : "neutral"}
                        color="violet"
                    />
                    <MetricCard
                        title="Avg. Response Time"
                        value={`${analytics?.avgTimeToResponse || 0} days`}
                        subtitle="Time to first response"
                        icon={<Clock className="w-5 h-5" />}
                        trend={(analytics?.avgTimeToResponse || 0) < 7 ? "up" : "down"}
                        color="amber"
                    />
                    <MetricCard
                        title="Offers Received"
                        value={progress?.totalOffers ?? 0}
                        subtitle={`${analytics?.total || 0} total applications`}
                        icon={<CheckCircle2 className="w-5 h-5" />}
                        trend="neutral"
                        color="emerald"
                    />
                </motion.div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly Activity */}
                    <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-6">Weekly Activity</h3>
                        {weeklyTrends.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={weeklyTrends}>
                                    <defs>
                                        <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                    <XAxis dataKey="week" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={{ stroke: "#27272a" }} />
                                    <YAxis tick={{ fill: "#71717a", fontSize: 12 }} axisLine={{ stroke: "#27272a" }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                                        labelStyle={{ color: "#fafafa" }}
                                    />
                                    <Area type="monotone" dataKey="applications" stroke="#3b82f6" fill="url(#colorApps)" strokeWidth={2} name="Applications" />
                                    <Area type="monotone" dataKey="interviews" stroke="#8b5cf6" fill="url(#colorInterviews)" strokeWidth={2} name="Interviews" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-zinc-500">
                                No weekly data yet
                            </div>
                        )}
                    </motion.div>

                    {/* Status Distribution */}
                    <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-6">Status Distribution</h3>
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
                                            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                                            formatter={(value: number) => [`${value} applications`, ""]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                                    {statusDistribution.map((item) => (
                                        <div key={item.name} className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-xs text-zinc-400">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-zinc-500">
                                No status data yet
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Funnel Chart */}
                <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Application Funnel</h3>
                    {funnelData.length > 0 && funnelData.some(d => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={funnelData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                                <XAxis type="number" tick={{ fill: "#71717a", fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" tick={{ fill: "#71717a", fontSize: 12 }} width={100} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                                    formatter={(value: number) => [`${value} applications`, ""]}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-zinc-500">
                            No funnel data yet
                        </div>
                    )}
                </motion.div>

                {/* Platform Performance */}
                <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Platform Performance</h3>
                    {platformData.length === 0 ? (
                        <p className="text-zinc-500 text-center py-8">Not enough data yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-800">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Platform</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Applications</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Response Rate</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Interview Rate</th>
                                        <th className="py-3 px-4 text-sm font-medium text-zinc-400">Performance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {platformData.map((platform, index) => (
                                        <motion.tr
                                            key={platform.name}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                                        >
                                            <td className="py-3 px-4 font-medium text-white">{platform.name}</td>
                                            <td className="py-3 px-4 text-right text-zinc-300">{platform.total}</td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={cn(
                                                    platform.responseRate > 20 ? "text-emerald-400" :
                                                        platform.responseRate > 10 ? "text-amber-400" : "text-zinc-400"
                                                )}>
                                                    {platform.responseRate}%
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={cn(
                                                    platform.interviewRate > 15 ? "text-emerald-400" :
                                                        platform.interviewRate > 5 ? "text-amber-400" : "text-zinc-400"
                                                )}>
                                                    {platform.interviewRate}%
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full transition-all"
                                                        style={{ width: `${Math.min(100, (platform.responseRate + platform.interviewRate) / 2)}%` }}
                                                    />
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </motion.div>
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
}

function MetricCard({ title, value, subtitle, icon, trend, color }: MetricCardProps) {
    const colorClasses = {
        blue: "bg-blue-500/10 text-blue-400",
        violet: "bg-violet-500/10 text-violet-400",
        amber: "bg-amber-500/10 text-amber-400",
        emerald: "bg-emerald-500/10 text-emerald-400",
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl", colorClasses[color])}>{icon}</div>
                {trend !== "neutral" && (
                    <div className={cn("flex items-center gap-1 text-xs font-medium", trend === "up" ? "text-emerald-400" : "text-red-400")}>
                        {trend === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-zinc-300">{title}</p>
                <p className="text-xs text-zinc-500">{subtitle}</p>
            </div>
        </div>
    );
}
