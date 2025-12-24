"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Briefcase,
    Phone,
    X,
    CalendarCheck,
    MessageSquare,
    FileText,
    BarChart3,
    Settings,
    Kanban,
    LayoutDashboard,
    UserPlus,
    Download,
} from "lucide-react";
import { AddApplicationModal } from "./add-application-modal";
import { exportToCSV } from "@/lib/db";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const router = useRouter();

    // Toggle the menu when ⌘K is pressed
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

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

    return (
        <>
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => setOpen(false)}
                        />

                        {/* Command palette */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.15 }}
                            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
                        >
                            <Command className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                                <div className="flex items-center border-b border-border px-4">
                                    <span className="text-muted-foreground">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="11" cy="11" r="8" />
                                            <path d="m21 21-4.3-4.3" />
                                        </svg>
                                    </span>
                                    <Command.Input
                                        placeholder="Type a command or search..."
                                        className="flex-1 px-3 py-4 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
                                    />
                                    <kbd className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground border border-border">
                                        ESC
                                    </kbd>
                                </div>

                                <Command.List className="max-h-80 overflow-auto p-2">
                                    <Command.Empty className="py-6 text-center text-muted-foreground">
                                        No results found.
                                    </Command.Empty>

                                    <Command.Group heading="Quick Actions" className="px-2 py-1.5">
                                        <Command.Item
                                            onSelect={() => runCommand(() => setShowAddModal(true))}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Add Application</span>
                                            <kbd className="ml-auto px-1.5 py-0.5 text-xs rounded bg-muted border border-border">
                                                N
                                            </kbd>
                                        </Command.Item>

                                        <Command.Item
                                            onSelect={() => runCommand(() => setShowAddModal(true))}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                                        >
                                            <Briefcase className="w-4 h-4" />
                                            <span>Log Interview</span>
                                        </Command.Item>

                                        <Command.Item
                                            onSelect={() => runCommand(() => setShowAddModal(true))}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            <span>Send Follow-up</span>
                                        </Command.Item>

                                        <Command.Item
                                            onSelect={() => runCommand(() => setShowAddModal(true))}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Mark Rejected</span>
                                        </Command.Item>

                                        <Command.Item
                                            onSelect={() => runCommand(() => setShowAddModal(true))}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            <span>Add Contact</span>
                                        </Command.Item>
                                    </Command.Group>

                                    <Command.Group heading="Navigation" className="px-2 py-1.5">
                                        <Command.Item
                                            onSelect={() => runCommand(() => router.push("/"))}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            <span>Go to Dashboard</span>
                                        </Command.Item>

                                        <Command.Item
                                            onSelect={() => runCommand(() => router.push("/board"))}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                                        >
                                            <Kanban className="w-4 h-4" />
                                            <span>Go to Pipeline Board</span>
                                        </Command.Item>

                                        <Command.Item
                                            onSelect={() => runCommand(() => router.push("/analytics"))}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                                        >
                                            <BarChart3 className="w-4 h-4" />
                                            <span>Go to Analytics</span>
                                        </Command.Item>

                                        <Command.Item
                                            onSelect={() => runCommand(() => router.push("/settings"))}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span>Go to Settings</span>
                                        </Command.Item>
                                    </Command.Group>

                                    <Command.Group heading="Data" className="px-2 py-1.5">
                                        <Command.Item
                                            onSelect={() => runCommand(handleExport)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Export to CSV</span>
                                        </Command.Item>
                                    </Command.Group>
                                </Command.List>
                            </Command>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AddApplicationModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
            />
        </>
    );
}

