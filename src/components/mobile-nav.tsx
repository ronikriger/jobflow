"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MobileNav({ className }: { className?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    return (
        <div className={className}>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 transition-colors"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Sidebar Drawer */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="fixed inset-y-0 left-0 z-50 flex"
                        >
                            <Sidebar />

                            {/* Close button outside sidebar (optional, but accessible) */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-[-3rem] p-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 pointer-events-auto"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
