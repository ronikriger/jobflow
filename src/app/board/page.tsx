"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Search, Inbox } from "lucide-react";
import { useActiveApplications, updateApplicationStatus } from "@/lib/hooks";
import { ApplicationCard } from "@/components/application-card";
import { AddApplicationModal } from "@/components/add-application-modal";
import { cn } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/lib/types";

const KANBAN_COLUMNS: { id: ApplicationStatus; title: string; color: string }[] = [
    { id: "saved", title: "Saved", color: "#6366f1" },
    { id: "applied", title: "Applied", color: "#3b82f6" },
    { id: "screen", title: "Screen", color: "#8b5cf6" },
    { id: "interview1", title: "Interview 1", color: "#f59e0b" },
    { id: "interview2", title: "Interview 2", color: "#f97316" },
    { id: "final", title: "Final", color: "#ec4899" },
    { id: "offer", title: "Offer", color: "#10b981" },
    { id: "rejected", title: "Rejected", color: "#ef4444" },
    { id: "ghosted", title: "Ghosted", color: "#6b7280" },
];

export default function BoardPage() {
    const applications = useActiveApplications();
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [overId, setOverId] = useState<ApplicationStatus | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor)
    );

    // Group applications by status
    const applicationsByStatus = useMemo(() => {
        const grouped: Record<ApplicationStatus, Application[]> = {
            saved: [],
            applied: [],
            screen: [],
            interview1: [],
            interview2: [],
            final: [],
            offer: [],
            rejected: [],
            ghosted: [],
        };

        if (!applications) return grouped;

        const filtered = searchQuery
            ? applications.filter(
                (app) =>
                    app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    app.role.toLowerCase().includes(searchQuery.toLowerCase())
            )
            : applications;

        for (const app of filtered) {
            grouped[app.status].push(app);
        }

        // Sort by updatedAt within each column
        for (const status of Object.keys(grouped) as ApplicationStatus[]) {
            grouped[status].sort(
                (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
        }

        return grouped;
    }, [applications, searchQuery]);

    const activeApplication = useMemo(() => {
        if (!activeId || !applications) return null;
        return applications.find((app) => app.id === activeId);
    }, [activeId, applications]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as number);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;
        if (over) {
            if (typeof over.id === "string" && KANBAN_COLUMNS.some((col) => col.id === over.id)) {
                setOverId(over.id as ApplicationStatus);
            } else {
                const overApp = applications?.find((app) => app.id === over.id);
                if (overApp) {
                    setOverId(overApp.status);
                }
            }
        } else {
            setOverId(null);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setOverId(null);

        if (!over) return;

        const activeApp = applications?.find((app) => app.id === active.id);
        if (!activeApp) return;

        let newStatus: ApplicationStatus | null = null;

        if (typeof over.id === "string" && KANBAN_COLUMNS.some((col) => col.id === over.id)) {
            newStatus = over.id as ApplicationStatus;
        } else {
            const overApp = applications?.find((app) => app.id === over.id);
            if (overApp) {
                newStatus = overApp.status;
            }
        }

        if (newStatus && newStatus !== activeApp.status) {
            await updateApplicationStatus(activeApp.id!, newStatus);
        }
    };

    const totalActive = applications?.filter(
        (a) => !["rejected", "ghosted"].includes(a.status)
    ).length ?? 0;

    const hasApplications = applications && applications.length > 0;

    // Empty state
    if (!hasApplications) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                        <Inbox className="w-8 h-8 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">No applications yet</h2>
                    <p className="text-muted-foreground mb-6">
                        Start tracking your job search by adding your first application.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add Application
                    </button>
                    <AddApplicationModal open={showAddModal} onClose={() => setShowAddModal(false)} />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        {totalActive} active applications
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search applications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm w-64"
                        />
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                    {KANBAN_COLUMNS.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            color={column.color}
                            applications={applicationsByStatus[column.id]}
                            isOver={overId === column.id}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeApplication && (
                        <div className="rotate-2 opacity-95">
                            <ApplicationCard
                                application={activeApplication}
                                isDraggable={false}
                            />
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            <AddApplicationModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
            />
        </div>
    );
}

interface KanbanColumnProps {
    id: ApplicationStatus;
    title: string;
    color: string;
    applications: Application[];
    isOver: boolean;
}

function KanbanColumn({ id, title, color, applications, isOver }: KanbanColumnProps) {
    return (
        <div
            className={cn(
                "flex-shrink-0 w-72 flex flex-col rounded-xl border transition-all duration-200",
                isOver
                    ? "border-blue-500/50 bg-blue-500/5 ring-2 ring-blue-500/20"
                    : "border-border bg-card/30"
            )}
        >
            {/* Column Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                    />
                    <h3 className="font-semibold text-sm">{title}</h3>
                </div>
                <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-md bg-secondary">
                    {applications.length}
                </span>
            </div>

            {/* Column Content */}
            <SortableContext
                items={applications.map((a) => a.id!)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] max-h-[calc(100vh-220px)]">
                    <AnimatePresence mode="popLayout">
                        {applications.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-32 flex items-center justify-center"
                            >
                                <p className="text-xs text-muted-foreground text-center px-4">
                                    Drag applications here or add new ones
                                </p>
                            </motion.div>
                        ) : (
                            applications.map((app) => (
                                <ApplicationCard key={app.id} application={app} />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </SortableContext>
        </div>
    );
}
