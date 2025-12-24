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
    LineChart,
    Line,
    AreaChart,
    Area,
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    Clock,
    Target,
    MessageSquare,
    Briefcase,
    CheckCircle2,
} from "lucide-react";
import { useApplications, useUserProgress } from "@/lib/hooks";
import { calculateAnalytics, cn } from "@/lib/utils";
import { STATUS_CONFIG, PLATFORM_CONFIG } from "@/lib/types";
import type { ApplicationStatus, Platform } from "@/lib/types";
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

const FUNNEL_COLORS = {
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
        if (!applications) return null;
        return calculateAnalytics(applications);
    }, [applications]);

    // Funnel data
    const funnelData = useMemo(() => {
        if (!applications) return [];

        const statusCounts: Record<ApplicationStatus, number> = {
            saved: 0,
            applied: 0,
            screen: 0,
            interview1: 0,
            interview2: 0,
            final: 0,
            offer: 0,
            rejected: 0,
            ghosted: 0,
        };

        applications.forEach((app) => {
            statusCounts[app.status]++;
        });

        const funnelOrder: ApplicationStatus[] = [
            "saved",
            "applied",
            "screen",
            "interview1",
            "interview2",
            "final",
            "offer",
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
                return isWithinInterval(new Date(app.appliedAt), {
                    start: weekStart,
                    end: weekEnd,
                });
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
        if (!analytics) return [];

        return analytics.platformStats
            .filter((p) => p.total > 0)
            .sort((a, b) => b.total - a.total)
            .map((p) => ({
                name: PLATFORM_CONFIG[p.platform].label,
                total: p.total,
                responseRate: p.responseRate,
                interviewRate: p.interviewRate,
            }));
    }, [analytics]);

    // Status distribution for pie chart
    const statusDistribution = useMemo(() => {
        if (!applications) return [];

        const counts: Record<string, number> = {};
        applications.forEach((app) => {
            counts[app.status] = (counts[app.status] || 0) + 1;
        });

        return Object.entries(counts)
            .filter(([, value]) => value > 0)
            .map(([status, value]) => ({
                name: STATUS_CONFIG[status as ApplicationStatus].label,
                value,
                color: FUNNEL_COLORS[status as ApplicationStatus],
            }));
    }, [applications]);

    if (!analytics || !applications) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-8"
            >
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground mt-1">
                        Track your job search performance
                    </p>
                </motion.div>

                {/* Key Metrics */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Response Rate"
                        value={`${analytics.responseRate}%`}
                        subtitle={`${analytics.applied} applications sent`}
                        icon={<MessageSquare className="w-5 h-5" />}
                        trend={analytics.responseRate > 20 ? "up" : "neutral"}
                        color="blue"
                    />
                    <MetricCard
                        title="Interview Rate"
                        value={`${analytics.interviewRate}%`}
                        subtitle={`${progress?.totalInterviews ?? 0} total interviews`}
                        icon={<Briefcase className="w-5 h-5" />}
                        trend={analytics.interviewRate > 10 ? "up" : "neutral"}
                        color="violet"
                    />
                    <MetricCard
                        title="Avg. Response Time"
                        value={`${analytics.avgTimeToResponse} days`}
                        subtitle="Time to first response"
                        icon={<Clock className="w-5 h-5" />}
                        trend={analytics.avgTimeToResponse < 7 ? "up" : "down"}
                        color="amber"
                    />
                    <MetricCard
                        title="Offers Received"
                        value={progress?.totalOffers ?? 0}
                        subtitle={`${analytics.total} total applications`}
                        icon={<CheckCircle2 className="w-5 h-5" />}
                        trend="neutral"
                        color="emerald"
                    />
                </motion.div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly Activity */}
                    <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
                        <h3 className="text-lg font-semibold mb-6">Weekly Activity</h3>
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
                                <XAxis
                                    dataKey="week"
                                    tick={{ fill: "#71717a", fontSize: 12 }}
                                    axisLine={{ stroke: "#27272a" }}
                                />
                                <YAxis
                                    tick={{ fill: "#71717a", fontSize: 12 }}
                                    axisLine={{ stroke: "#27272a" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#141416",
                                        border: "1px solid #27272a",
                                        borderRadius: "8px",
                                    }}
                                    labelStyle={{ color: "#fafafa" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="applications"
                                    stroke="#3b82f6"
                                    fill="url(#colorApps)"
                                    strokeWidth={2}
                                    name="Applications"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="interviews"
                                    stroke="#8b5cf6"
                                    fill="url(#colorInterviews)"
                                    strokeWidth={2}
                                    name="Interviews"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Status Distribution */}
                    <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
                        <h3 className="text-lg font-semibold mb-6">Status Distribution</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#141416",
                                        border: "1px solid #27272a",
                                        borderRadius: "8px",
                                    }}
                                    formatter={(value: number) => [`${value} applications`, ""]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 mt-4 justify-center">
                            {statusDistribution.map((item) => (
                                <div key={item.name} className="flex items-center gap-1.5">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-xs text-muted-foreground">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Funnel Chart */}
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-6">Application Funnel</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={funnelData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                            <XAxis type="number" tick={{ fill: "#71717a", fontSize: 12 }} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fill: "#71717a", fontSize: 12 }}
                                width={100}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#141416",
                                    border: "1px solid #27272a",
                                    borderRadius: "8px",
                                }}
                                formatter={(value: number) => [`${value} applications`, ""]}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Platform Performance */}
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-6">Platform Performance</h3>
                    {platformData.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            Not enough data yet
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                            Platform
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                                            Applications
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                                            Response Rate
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                                            Interview Rate
                                        </th>
                                        <th className="py-3 px-4 text-sm font-medium text-muted-foreground">
                                            Performance
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {platformData.map((platform, index) => (
                                        <motion.tr
                                            key={platform.name}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                                        >
                                            <td className="py-3 px-4 font-medium">{platform.name}</td>
                                            <td className="py-3 px-4 text-right">{platform.total}</td>
                                            <td className="py-3 px-4 text-right">
                                                <span
                                                    className={cn(
                                                        platform.responseRate > 20
                                                            ? "text-emerald-400"
                                                            : platform.responseRate > 10
                                                                ? "text-amber-400"
                                                                : "text-muted-foreground"
                                                    )}
                                                >
                                                    {platform.responseRate}%
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span
                                                    className={cn(
                                                        platform.interviewRate > 15
                                                            ? "text-emerald-400"
                                                            : platform.interviewRate > 5
                                                                ? "text-amber-400"
                                                                : "text-muted-foreground"
                                                    )}
                                                >
                                                    {platform.interviewRate}%
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all"
                                                        style={{
                                                            width: `${Math.min(
                                                                100,
                                                                (platform.responseRate + platform.interviewRate) / 2
                                                            )}%`,
                                                        }}
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
        <div className="glass-card rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl", colorClasses[color])}>{icon}</div>
                {trend !== "neutral" && (
                    <div
                        className={cn(
                            "flex items-center gap-1 text-xs font-medium",
                            trend === "up" ? "text-emerald-400" : "text-red-400"
                        )}
                    >
                        {trend === "up" ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                        )}
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-xs text-muted-foreground/70">{subtitle}</p>
            </div>
        </div>
    );
}

