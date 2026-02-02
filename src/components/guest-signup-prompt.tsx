"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cloud, AlertTriangle, Sparkles, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

interface GuestSignupPromptProps {
    open: boolean;
    onClose: () => void;
    applicationCount?: number;
}

export function GuestSignupPrompt({ open, onClose, applicationCount = 1 }: GuestSignupPromptProps) {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem("hideGuestSignupPrompt", "true");
        }
        onClose();
    };

    const handleSignUp = () => {
        if (dontShowAgain) {
            localStorage.setItem("hideGuestSignupPrompt", "true");
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[60] w-auto sm:w-full sm:max-w-md flex items-center justify-center"
                    >
                        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto w-full">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/20 blur-[50px] rounded-full" />
                            <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-500/20 blur-[50px] rounded-full" />

                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="relative z-10">
                                {/* Icon */}
                                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                                    <Cloud className="w-6 h-6 text-white" />
                                </div>

                                {/* Content */}
                                <div className="text-center mb-4">
                                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                                        Save Your Progress! ☁️
                                    </h3>
                                    <p className="text-sm text-zinc-400">
                                        {applicationCount === 1
                                            ? "Your app is stored locally on this browser only."
                                            : `${applicationCount} apps stored locally on this browser only.`
                                        }
                                    </p>
                                </div>

                                {/* Warning - more compact */}
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-200/80">
                                        <span className="font-medium">Without an account:</span> Data lost on browser clear, no sync, no backup
                                    </div>
                                </div>

                                {/* Benefits of signing up - inline */}
                                <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                                    {["Sync devices", "Backup", "Free"].map((benefit) => (
                                        <span
                                            key={benefit}
                                            className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20"
                                        >
                                            ✓ {benefit}
                                        </span>
                                    ))}
                                </div>

                                {/* CTA */}
                                <Link
                                    href="/handler/sign-up"
                                    onClick={handleSignUp}
                                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
                                >
                                    <Shield className="w-4 h-4" />
                                    Create Free Account
                                    <ArrowRight className="w-4 h-4" />
                                </Link>

                                {/* Don't show again + Continue as guest in one row */}
                                <div className="mt-3 flex items-center justify-between">
                                    <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={dontShowAgain}
                                            onChange={(e) => setDontShowAgain(e.target.checked)}
                                            className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                                        />
                                        Don&apos;t remind me
                                    </label>
                                    <button
                                        onClick={handleClose}
                                        className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors py-1"
                                    >
                                        Continue as guest
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Hook to manage the guest signup prompt
export function useGuestSignupPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [appCount, setAppCount] = useState(1);

    const triggerPrompt = (applicationCount: number) => {
        // Check if user has dismissed the prompt
        const hidden = localStorage.getItem("hideGuestSignupPrompt");
        if (hidden === "true") return;

        // Show on 1st, 3rd, and 5th application, then stop
        if (applicationCount === 1 || applicationCount === 3 || applicationCount === 5) {
            setAppCount(applicationCount);
            setShowPrompt(true);
        }
    };

    const closePrompt = () => setShowPrompt(false);

    return { showPrompt, appCount, triggerPrompt, closePrompt };
}
