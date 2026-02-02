"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Check, Loader2, Sparkles } from "lucide-react";

interface UpgradeModalProps {
    open: boolean;
    onClose: () => void;
    currentApps: number;
    maxApps: number;
}

export function UpgradeModal({ open, onClose, currentApps, maxApps }: UpgradeModalProps) {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
            });
            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("No checkout URL returned");
                setLoading(false);
            }
        } catch (error) {
            console.error("Failed to create checkout session:", error);
            setLoading(false);
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
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 flex items-center justify-center z-50 px-4"
                    >
                        <div
                            className="relative w-full max-w-md rounded-2xl overflow-hidden"
                            style={{
                                background: "linear-gradient(135deg, #18181b 0%, #1f1f23 100%)",
                                border: "1px solid rgba(139, 92, 246, 0.3)",
                            }}
                        >
                            {/* Header with gradient */}
                            <div
                                className="p-6 text-center"
                                style={{
                                    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)",
                                }}
                            >
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5 text-zinc-400" />
                                </button>

                                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                                    style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}
                                >
                                    <Crown className="w-8 h-8 text-white" />
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Upgrade to Pro
                                </h2>
                                <p className="text-zinc-400">
                                    You&apos;ve reached {currentApps} of {maxApps} free applications
                                </p>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Price */}
                                <div className="text-center">
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-bold text-white">$0.99</span>
                                        <span className="text-zinc-400">/month</span>
                                    </div>
                                    <p className="text-sm text-zinc-500 mt-1">Less than a coffee · Cancel anytime</p>
                                </div>

                                {/* Features */}
                                <div className="space-y-3">
                                    {[
                                        "Unlimited job applications",
                                        "Priority email support",
                                        "Advanced analytics",
                                        "Export to CSV/PDF",
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: "rgba(16, 185, 129, 0.2)" }}
                                            >
                                                <Check className="w-3 h-3 text-emerald-400" />
                                            </div>
                                            <span className="text-zinc-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={handleUpgrade}
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                                    style={{
                                        background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                                    }}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Redirecting to checkout...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Sparkles className="w-5 h-5" />
                                            Upgrade Now
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-full py-3 text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
                                >
                                    Maybe later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
