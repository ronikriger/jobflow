"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Target,
    Clock,
    Download,
    Trash2,
    RefreshCw,
    AlertTriangle,
    Upload,
    Crown,
    FileSpreadsheet,
    FileText,
    Lock,
} from "lucide-react";
import { useSettings, updateSettings, useActiveApplications } from "@/lib/hooks";
import { useUser } from "@stackframe/stack";
import { exportToCSV as dbExportToCSV, db, initializeDefaults } from "@/lib/db";
import { exportToCSV, exportToPDF } from "@/lib/export";
import { cn } from "@/lib/utils";
import { ProBadge, UpgradeToPro } from "@/components/pro-badge";
import { UpgradeModal } from "@/components/upgrade-modal";
import { getSubscriptionStatus } from "@/lib/actions";

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

export default function SettingsPage() {
    const user = useUser();
    const settings = useSettings();
    const [localSettings, setLocalSettings] = useState({
        weeklyGoal: 8,
        dailyGoal: 2,
        followUpDays: 7,
        interviewFollowUpDays: 2,
        ghostedDays: 21,
        streakGraceDays: 2,
        darkMode: true,
    });
    const [saving, setSaving] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<{
        tier: "free" | "pro"; appCount: number; limit: number; canAddMore: boolean;
    } | null>(null);
    const { apps: applications } = useActiveApplications();

    useEffect(() => {
        if (settings) {
            setLocalSettings({
                weeklyGoal: settings.weeklyGoal,
                dailyGoal: settings.dailyGoal,
                followUpDays: settings.followUpDays,
                interviewFollowUpDays: settings.interviewFollowUpDays,
                ghostedDays: settings.ghostedDays,
                streakGraceDays: settings.streakGraceDays,
                darkMode: settings.darkMode,
            });
        }
    }, [settings]);

    useEffect(() => {
        getSubscriptionStatus().then(setSubscriptionStatus);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        await updateSettings(localSettings, !!user);
        setTimeout(() => setSaving(false), 500);
    };

    const handleExport = async () => {
        const csv = await dbExportToCSV();
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `job-applications-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleProExportCSV = () => {
        if (subscriptionStatus?.tier !== "pro") {
            setShowUpgradeModal(true);
            return;
        }
        exportToCSV(applications);
    };

    const handleProExportPDF = () => {
        if (subscriptionStatus?.tier !== "pro") {
            setShowUpgradeModal(true);
            return;
        }
        exportToPDF(applications);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Dynamic import to avoid SSR issues with db
        const { importFromCSV } = await import("@/lib/db");
        const result = await importFromCSV(file);

        if (result.success) {
            alert(`Successfully imported ${result.count} applications!`);
            window.location.reload();
        } else {
            alert("Failed to import data. Please check the CSV format.");
        }
    };

    const handleReset = async () => {
        await db.applications.clear();
        await db.events.clear();
        await db.contacts.clear();
        await db.reminders.clear();
        await db.userProgress.clear();
        await db.settings.clear();
        await initializeDefaults();
        setShowResetConfirm(false);
        window.location.reload();
    };



    return (
        <div className="min-h-screen p-8">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-2xl mx-auto space-y-8"
            >
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-1">
                        Customize your job tracking experience
                    </p>
                </motion.div>

                {/* Subscription Section */}
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Crown className="w-24 h-24 rotate-12" />
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2 rounded-lg bg-indigo-500/10">
                            <Crown className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold">Subscription</h2>
                            <p className="text-sm text-muted-foreground">
                                Manage your plan and billing
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border relative z-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Current Plan</span>
                                {subscriptionStatus?.tier === "pro" ? (
                                    <ProBadge />
                                ) : (
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300">Free</span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {subscriptionStatus?.tier === "pro"
                                    ? "You have access to all premium features"
                                    : `${subscriptionStatus?.appCount || 0} / ${subscriptionStatus?.limit || 15} applications used`}
                            </p>
                        </div>

                        {subscriptionStatus?.tier !== "pro" && (
                            <UpgradeToPro onClick={() => setShowUpgradeModal(true)} />
                        )}
                    </div>
                </motion.div>

                {/* Goals Section */}

                {/* Goals Section */}
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-semibold">Application Goals</h2>
                            <p className="text-sm text-muted-foreground">
                                Set your targets to stay on track
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Weekly Goal</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={localSettings.weeklyGoal}
                                    onChange={(e) =>
                                        setLocalSettings({
                                            ...localSettings,
                                            weeklyGoal: parseInt(e.target.value),
                                        })
                                    }
                                    className="flex-1 accent-primary"
                                />
                                <span className="w-10 text-center font-medium">
                                    {localSettings.weeklyGoal}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Applications per week
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Daily Goal</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={localSettings.dailyGoal}
                                    onChange={(e) =>
                                        setLocalSettings({
                                            ...localSettings,
                                            dailyGoal: parseInt(e.target.value),
                                        })
                                    }
                                    className="flex-1 accent-primary"
                                />
                                <span className="w-10 text-center font-medium">
                                    {localSettings.dailyGoal}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Applications per day
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Follow-up Settings */}
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-500/10">
                            <Clock className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold">Follow-up Reminders</h2>
                            <p className="text-sm text-muted-foreground">
                                Smart timing for your follow-ups
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">After Applying</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="3"
                                    max="14"
                                    value={localSettings.followUpDays}
                                    onChange={(e) =>
                                        setLocalSettings({
                                            ...localSettings,
                                            followUpDays: parseInt(e.target.value),
                                        })
                                    }
                                    className="flex-1 accent-violet-500"
                                />
                                <span className="w-16 text-center font-medium">
                                    {localSettings.followUpDays} days
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">After Interview</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="1"
                                    max="7"
                                    value={localSettings.interviewFollowUpDays}
                                    onChange={(e) =>
                                        setLocalSettings({
                                            ...localSettings,
                                            interviewFollowUpDays: parseInt(e.target.value),
                                        })
                                    }
                                    className="flex-1 accent-violet-500"
                                />
                                <span className="w-16 text-center font-medium">
                                    {localSettings.interviewFollowUpDays} days
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mark as Ghosted After</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="14"
                                    max="45"
                                    value={localSettings.ghostedDays}
                                    onChange={(e) =>
                                        setLocalSettings({
                                            ...localSettings,
                                            ghostedDays: parseInt(e.target.value),
                                        })
                                    }
                                    className="flex-1 accent-violet-500"
                                />
                                <span className="w-16 text-center font-medium">
                                    {localSettings.ghostedDays} days
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Streak Grace Days</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    value={localSettings.streakGraceDays}
                                    onChange={(e) =>
                                        setLocalSettings({
                                            ...localSettings,
                                            streakGraceDays: parseInt(e.target.value),
                                        })
                                    }
                                    className="flex-1 accent-violet-500"
                                />
                                <span className="w-16 text-center font-medium">
                                    {localSettings.streakGraceDays} days
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Days you can miss before breaking your streak
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Data Management */}
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-4">
                    <h2 className="font-semibold">Data Management</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                            onClick={handleProExportCSV}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-all group border border-transparent hover:border-emerald-500/20"
                        >
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                                <FileSpreadsheet className="w-4 h-4" />
                            </div>
                            <div className="text-left flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">Export to CSV</span>
                                    {subscriptionStatus?.tier !== "pro" && <Lock className="w-3 h-3 text-amber-500" />}
                                </div>
                                <p className="text-xs text-muted-foreground">Spreadsheet format</p>
                            </div>
                        </button>

                        <button
                            onClick={handleProExportPDF}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-all group border border-transparent hover:border-red-500/20"
                        >
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="text-left flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">Export to PDF</span>
                                    {subscriptionStatus?.tier !== "pro" && <Lock className="w-3 h-3 text-amber-500" />}
                                </div>
                                <p className="text-xs text-muted-foreground">Formatted report</p>
                            </div>
                        </button>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <div className="relative flex-1">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleImport}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <button
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors font-medium text-sm"
                            >
                                <Upload className="w-4 h-4" />
                                Import CSV
                            </button>
                        </div>

                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors font-medium text-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                            Reset All Data
                        </button>
                    </div>
                </motion.div>

                {/* Save Button */}
                <motion.div variants={itemVariants}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={cn(
                            "w-full py-3 rounded-xl font-medium transition-all",
                            saving
                                ? "bg-primary/50 cursor-not-allowed"
                                : "bg-primary hover:bg-primary/90"
                        )}
                    >
                        {saving ? (
                            <span className="flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Saving...
                            </span>
                        ) : (
                            "Save Settings"
                        )}
                    </button>
                </motion.div>
            </motion.div>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={() => setShowResetConfirm(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl p-6 z-50"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold">Reset All Data?</h3>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            This will permanently delete all your applications, events, contacts,
                            and progress. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                            >
                                Reset Everything
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
            {/* Upgrade Modal */}
            <UpgradeModal
                open={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                currentApps={subscriptionStatus?.appCount ?? 0}
                maxApps={15}
            />
        </div>
    );
}

