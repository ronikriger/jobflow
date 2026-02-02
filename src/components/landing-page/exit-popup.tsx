"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function ExitPopup() {
    const [show, setShow] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const handleMouseLeave = useCallback((e: MouseEvent) => {
        // Only trigger when mouse leaves through the top of the viewport
        if (e.clientY <= 0 && !dismissed && !show) {
            // Check if user has been on page for at least 5 seconds
            const timeOnPage = Date.now() - (window as any).__pageLoadTime;
            if (timeOnPage > 5000) {
                // Check if already shown in this session
                const alreadyShown = sessionStorage.getItem("exitPopupShown");
                if (!alreadyShown) {
                    setShow(true);
                    sessionStorage.setItem("exitPopupShown", "true");
                }
            }
        }
    }, [dismissed, show]);

    useEffect(() => {
        // Track page load time
        (window as any).__pageLoadTime = Date.now();

        document.addEventListener("mouseleave", handleMouseLeave);
        return () => document.removeEventListener("mouseleave", handleMouseLeave);
    }, [handleMouseLeave]);

    const handleDismiss = () => {
        setShow(false);
        setDismissed(true);
    };

    return (
        <AnimatePresence>
            {show && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleDismiss}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
                    >
                        <div className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-blue-500/20 blur-[60px] rounded-full" />
                            <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-purple-500/20 blur-[60px] rounded-full" />

                            {/* Close button */}
                            <button
                                onClick={handleDismiss}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 sm:p-2 rounded-lg hover:bg-zinc-800 active:bg-zinc-800 transition-colors text-zinc-400 hover:text-white active:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="relative z-10 text-center">
                                {/* Icon */}
                                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                    Wait! Don&apos;t leave empty-handed 👋
                                </h3>
                                <p className="text-sm sm:text-base text-zinc-400 mb-4 sm:mb-6">
                                    Get organized and land your dream job faster. Start tracking for free - no signup required.
                                </p>

                                {/* Benefits */}
                                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                                    {["20 Free Apps", "No Signup", "Visual Pipeline"].map((benefit) => (
                                        <span
                                            key={benefit}
                                            className="px-2.5 sm:px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs sm:text-sm"
                                        >
                                            ✓ {benefit}
                                        </span>
                                    ))}
                                </div>

                                {/* CTA */}
                                <Link
                                    href="/home"
                                    onClick={handleDismiss}
                                    className="w-full inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-base sm:text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg min-h-[48px] sm:min-h-[56px]"
                                >
                                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Try Free – No Signup
                                    <ArrowRight className="w-4 h-4" />
                                </Link>

                                <button
                                    onClick={handleDismiss}
                                    className="mt-3 sm:mt-4 text-xs sm:text-sm text-zinc-500 hover:text-zinc-400 active:text-zinc-400 transition-colors py-1"
                                >
                                    No thanks, I&apos;ll keep using spreadsheets
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
