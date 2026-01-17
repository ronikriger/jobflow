"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, FileSpreadsheet, X, Crown, Lock } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/export";
import type { Application } from "@/lib/types";

interface ExportMenuProps {
    applications: Application[];
    isPro: boolean;
    onUpgradeClick?: () => void;
}

export function ExportMenu({ applications, isPro, onUpgradeClick }: ExportMenuProps) {
    const [open, setOpen] = useState(false);
    const [exporting, setExporting] = useState<string | null>(null);

    const handleExport = async (type: "csv" | "pdf") => {
        if (!isPro) {
            onUpgradeClick?.();
            setOpen(false);
            return;
        }

        setExporting(type);

        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 300));

        if (type === "csv") {
            exportToCSV(applications);
        } else {
            exportToPDF(applications);
        }

        setExporting(null);
        setOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    color: "#a1a1aa"
                }}
            >
                <Download className="w-4 h-4" />
                Export
                {!isPro && <Lock className="w-3 h-3 text-amber-500" />}
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-64 rounded-xl overflow-hidden z-50"
                            style={{
                                backgroundColor: "#18181b",
                                border: "1px solid #27272a",
                                boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
                            }}
                        >
                            <div className="p-3 border-b" style={{ borderColor: "#27272a" }}>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white">Export Data</span>
                                    <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                {!isPro && (
                                    <div className="mt-2 flex items-center gap-2 text-xs text-amber-500">
                                        <Crown className="w-3 h-3" />
                                        Pro feature
                                    </div>
                                )}
                            </div>

                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => handleExport("csv")}
                                    disabled={exporting !== null}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                                    style={{ backgroundColor: "transparent" }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#27272a"}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                                >
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}
                                    >
                                        <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-sm font-medium text-white">
                                            {exporting === "csv" ? "Exporting..." : "Export to CSV"}
                                        </p>
                                        <p className="text-xs text-zinc-500">Spreadsheet format</p>
                                    </div>
                                    {!isPro && <Lock className="w-4 h-4 text-zinc-600" />}
                                </button>

                                <button
                                    onClick={() => handleExport("pdf")}
                                    disabled={exporting !== null}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                                    style={{ backgroundColor: "transparent" }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#27272a"}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                                >
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                                    >
                                        <FileText className="w-5 h-5 text-red-400" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-sm font-medium text-white">
                                            {exporting === "pdf" ? "Generating..." : "Export to PDF"}
                                        </p>
                                        <p className="text-xs text-zinc-500">Formatted report</p>
                                    </div>
                                    {!isPro && <Lock className="w-4 h-4 text-zinc-600" />}
                                </button>
                            </div>

                            <div className="p-3 border-t" style={{ borderColor: "#27272a" }}>
                                <p className="text-xs text-zinc-600 text-center">
                                    {applications.length} application{applications.length !== 1 ? "s" : ""} will be exported
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
