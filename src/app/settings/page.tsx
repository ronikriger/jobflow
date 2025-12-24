"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Target,
    Clock,
    Download,
    Trash2,
    Moon,
    Sun,
    RefreshCw,
    AlertTriangle,
} from "lucide-react";
import { useSettings, updateSettings } from "@/lib/hooks";
import { exportToCSV, db, seedDemoData } from "@/lib/db";
import { cn } from "@/lib/utils";

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

    const handleSave = async () => {
        setSaving(true);
        await updateSettings(localSettings);
        setTimeout(() => setSaving(false), 500);
    };

    const handleExport = async () => {
        const csv = await exportToCSV();
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `job-applications-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleReset = async () => {
        await db.applications.clear();
        await db.events.clear();
        await db.contacts.clear();
        await db.reminders.clear();
        await db.userProgress.clear();
        await db.settings.clear();
        await seedDemoData();
        setShowResetConfirm(false);
        window.location.reload();
    };

    const toggleDarkMode = () => {
        const newDarkMode = !localSettings.darkMode;
        setLocalSettings({ ...localSettings, darkMode: newDarkMode });
        document.documentElement.classList.toggle("dark", newDarkMode);
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

                {/* Appearance */}
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {localSettings.darkMode ? (
                                <div className="p-2 rounded-lg bg-indigo-500/10">
                                    <Moon className="w-5 h-5 text-indigo-400" />
                                </div>
                            ) : (
                                <div className="p-2 rounded-lg bg-amber-500/10">
                                    <Sun className="w-5 h-5 text-amber-400" />
                                </div>
                            )}
                            <div>
                                <h2 className="font-semibold">Appearance</h2>
                                <p className="text-sm text-muted-foreground">
                                    {localSettings.darkMode ? "Dark mode" : "Light mode"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={cn(
                                "w-14 h-8 rounded-full p-1 transition-colors",
                                localSettings.darkMode ? "bg-primary" : "bg-secondary"
                            )}
                        >
                            <motion.div
                                className="w-6 h-6 rounded-full bg-white shadow-md"
                                animate={{ x: localSettings.darkMode ? 24 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>
                </motion.div>

                {/* Data Management */}
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-4">
                    <h2 className="font-semibold">Data Management</h2>

                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors font-medium text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Export to CSV
                        </button>

                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors font-medium text-sm"
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
        </div>
    );
}

