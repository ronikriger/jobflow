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
import { Plus, Filter, Search } from "lucide-react";
import { useActiveApplications, updateApplicationStatus } from "@/lib/hooks";
import { ApplicationCard } from "@/components/application-card";
import { AddApplicationModal } from "@/components/add-application-modal";
import { cn, getStatusColorClass } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/types";

const KANBAN_COLUMNS: { id: ApplicationStatus; title: string }[] = [
    { id: "saved", title: "Saved" },
    { id: "applied", title: "Applied" },
    { id: "screen", title: "Screen" },
    { id: "interview1", title: "Interview 1" },
    { id: "interview2", title: "Interview 2" },
    { id: "final", title: "Final" },
    { id: "offer", title: "Offer" },
    { id: "rejected", title: "Rejected" },
    { id: "ghosted", title: "Ghosted" },
];

export default function BoardPage() {
    const applications = useActiveApplications();
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [overId, setOverId] = useState<ApplicationStatus | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);

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
            // Check if over a column
            if (typeof over.id === "string" && KANBAN_COLUMNS.some((col) => col.id === over.id)) {
                setOverId(over.id as ApplicationStatus);
            } else {
                // Over another card - find its column
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

        // Dropped on a column
        if (typeof over.id === "string" && KANBAN_COLUMNS.some((col) => col.id === over.id)) {
            newStatus = over.id as ApplicationStatus;
        } else {
            // Dropped on another card
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
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm w-48"
                        />
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm"
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
                            applications={applicationsByStatus[column.id]}
                            isOver={overId === column.id}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeApplication && (
                        <div className="rotate-3 opacity-90">
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
    applications: Application[];
    isOver: boolean;
}

function KanbanColumn({ id, title, applications, isOver }: KanbanColumnProps) {
    const statusConfig = STATUS_CONFIG[id];

    return (
        <div
            className={cn(
                "flex-shrink-0 w-72 flex flex-col bg-card/30 rounded-xl border transition-all duration-200",
                isOver
                    ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
                    : "border-border"
            )}
        >
            {/* Column Header */}
            <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            id === "saved" && "bg-indigo-500",
                            id === "applied" && "bg-blue-500",
                            id === "screen" && "bg-violet-500",
                            id === "interview1" && "bg-amber-500",
                            id === "interview2" && "bg-orange-500",
                            id === "final" && "bg-pink-500",
                            id === "offer" && "bg-emerald-500",
                            id === "rejected" && "bg-red-500",
                            id === "ghosted" && "bg-gray-500"
                        )}
                    />
                    <h3 className="font-medium text-sm">{title}</h3>
                </div>
                <span className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded">
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
                                className="h-full flex items-center justify-center p-4"
                            >
                                <p className="text-xs text-muted-foreground text-center">
                                    Drop applications here
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

