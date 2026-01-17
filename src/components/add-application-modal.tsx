"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link as LinkIcon, Building2, Briefcase, MapPin, DollarSign } from "lucide-react";
import { addApplication } from "@/lib/hooks";
import { parseCompanyFromUrl, detectPlatformFromUrl, cn } from "@/lib/utils";
import type { Platform, ApplicationStatus } from "@/lib/types";
import { PLATFORM_CONFIG } from "@/lib/types";
import { useUser } from "@stackframe/stack";

interface AddApplicationModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function AddApplicationModal({ open, onClose, onSuccess }: AddApplicationModalProps) {
    const user = useUser();
    const [url, setUrl] = useState("");
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [location, setLocation] = useState("");
    const [salary, setSalary] = useState("");
    const [platform, setPlatform] = useState<Platform>("other");
    const [status, setStatus] = useState<ApplicationStatus>("applied");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-detect company and platform from URL
    useEffect(() => {
        if (url) {
            const detectedCompany = parseCompanyFromUrl(url);
            if (detectedCompany && !company) {
                setCompany(detectedCompany);
            }
            const detectedPlatform = detectPlatformFromUrl(url);
            setPlatform(detectedPlatform);
        }
    }, [url, company]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company || !role) return;

        setIsSubmitting(true);
        try {
            await addApplication({
                company,
                role,
                location: location || undefined,
                salary: salary || undefined,
                url: url || undefined,
                platform,
                status,
            }, !!user);  // Pass authentication state

            // Reset form
            setUrl("");
            setCompany("");
            setRole("");
            setLocation("");
            setSalary("");
            setPlatform("other");
            setStatus("applied");

            onSuccess?.();  // Trigger refresh
            onClose();
        } catch (error) {
            console.error("Failed to add application:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClassName = "w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-white placeholder:text-zinc-500";

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

                    {/* Modal Container - Centered with Flexbox */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg max-h-[85vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-zinc-800 flex-shrink-0">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Add Application</h2>
                                    <p className="text-sm text-zinc-400 mt-1">
                                        Track a new job opportunity
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Form Content */}
                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                                <div className="p-6 space-y-5 overflow-y-auto flex-1">

                                    {/* Company & Role row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-zinc-500" />
                                                Company *
                                            </label>
                                            <input
                                                type="text"
                                                value={company}
                                                onChange={(e) => setCompany(e.target.value)}
                                                placeholder="e.g. Stripe"
                                                required
                                                className={inputClassName}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-zinc-500" />
                                                Role *
                                            </label>
                                            <input
                                                type="text"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                placeholder="e.g. Software Engineer"
                                                required
                                                className={inputClassName}
                                            />
                                        </div>
                                    </div>

                                    {/* Location & Salary row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-zinc-500" />
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="e.g. Remote, NYC"
                                                className={inputClassName}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-zinc-500" />
                                                Salary Range
                                            </label>
                                            <input
                                                type="text"
                                                value={salary}
                                                onChange={(e) => setSalary(e.target.value)}
                                                placeholder="e.g. $150k - $200k"
                                                className={inputClassName}
                                            />
                                        </div>
                                    </div>

                                    {/* Platform selector */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Platform</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(Object.entries(PLATFORM_CONFIG) as [Platform, { label: string }][]).map(([key, config]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setPlatform(key)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                                                        platform === key
                                                            ? "bg-blue-500 text-white border-blue-500"
                                                            : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                                                    )}
                                                >
                                                    {config.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status selector */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Initial Status</label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setStatus("saved")}
                                                className={cn(
                                                    "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                                                    status === "saved"
                                                        ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/50"
                                                        : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-400"
                                                )}
                                            >
                                                Save for Later
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setStatus("applied")}
                                                className={cn(
                                                    "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                                                    status === "applied"
                                                        ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                                                        : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-400"
                                                )}
                                            >
                                                Applied
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Sticky Submit buttons */}
                                <div className="flex gap-3 p-6 border-t border-zinc-800 bg-zinc-900 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 rounded-xl font-medium bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !company || !role}
                                        className={cn(
                                            "flex-1 px-4 py-3 rounded-xl font-semibold transition-all",
                                            isSubmitting || !company || !role
                                                ? "bg-blue-500/50 text-white/50 cursor-not-allowed"
                                                : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg"
                                        )}
                                    >
                                        {isSubmitting ? "Adding..." : status === "saved" ? "Save Application" : "Add Application"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
