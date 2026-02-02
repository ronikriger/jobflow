"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Search, Sparkles, GripVertical, Building2, MapPin, Clock, ExternalLink } from "lucide-react";
import { useActiveApplications, updateApplicationStatus } from "@/lib/hooks";
import { AddApplicationModal } from "@/components/add-application-modal";
import { BoardSkeleton } from "@/components/skeleton";
import type { Application, ApplicationStatus } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useToast } from "@/components/toast";
import { UpgradeModal } from "@/components/upgrade-modal";
import { useSubscription } from "@/components/subscription-provider";
import { GuestSignupPrompt, useGuestSignupPrompt } from "@/components/guest-signup-prompt";

const PIPELINE_STAGES: { id: ApplicationStatus; title: string; color: string }[] = [
    { id: "saved", title: "Saved", color: "#818cf8" },
    { id: "applied", title: "Applied", color: "#3b82f6" },
    { id: "screen", title: "Screen", color: "#8b5cf6" },
    { id: "interview1", title: "Interview 1", color: "#f59e0b" },
    { id: "interview2", title: "Interview 2", color: "#f97316" },
    { id: "final", title: "Final", color: "#ec4899" },
    { id: "offer", title: "Offer", color: "#10b981" },
    { id: "rejected", title: "Rejected", color: "#ef4444" },
    { id: "ghosted", title: "Ghosted", color: "#6b7280" },
];

// Draggable Application Card
function DraggableCard({ application }: { application: Application }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: application.id! });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const daysInStage = Math.floor(
        (new Date().getTime() - new Date(application.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all"
            {...attributes}
            {...listeners}
        >
            <div
                className="rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                style={{
                    backgroundColor: 'rgba(31, 31, 35, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate" style={{ color: 'white' }}>
                            {application.company}
                        </h4>
                        <p className="text-sm truncate" style={{ color: '#a1a1aa' }}>
                            {application.role}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                            href={`/app/${application.id}`}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ backgroundColor: '#27272a' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="w-3.5 h-3.5" style={{ color: '#a1a1aa' }} />
                        </Link>
                    </div>
                </div>

                {/* Details */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    {application.location && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ backgroundColor: '#27272a', color: '#a1a1aa' }}>
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[80px]">{application.location}</span>
                        </div>
                    )}
                    <div
                        className="flex items-center gap-1 px-2 py-1 rounded-md"
                        style={{
                            backgroundColor: daysInStage > 7 ? 'rgba(245, 158, 11, 0.1)' : '#27272a',
                            color: daysInStage > 7 ? '#f59e0b' : '#a1a1aa'
                        }}
                    >
                        <Clock className="w-3 h-3" />
                        <span>{daysInStage}d</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Static card for drag overlay
function StaticCard({ application }: { application: Application }) {
    return (
        <div
            className="rounded-xl p-4 shadow-2xl rotate-3"
            style={{
                backgroundColor: '#1f1f23',
                border: '1px solid #3b82f6',
                width: '250px',
            }}
        >
            <div className="flex items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate" style={{ color: 'white' }}>
                        {application.company}
                    </h4>
                    <p className="text-sm truncate" style={{ color: '#a1a1aa' }}>
                        {application.role}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Kanban Column
function KanbanColumn({
    stage,
    applications,
    isOver
}: {
    stage: typeof PIPELINE_STAGES[0];
    applications: Application[];
    isOver: boolean;
}) {
    const { setNodeRef, isOver: isOverDroppable } = useDroppable({ id: stage.id });
    const isActive = isOver || isOverDroppable;

    return (
        <div
            ref={setNodeRef}
            className="flex-shrink-0 w-72 flex flex-col rounded-xl transition-all"
            style={{
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.05)' : '#0f0f10',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #1f1f23',
                maxHeight: 'calc(100vh - 200px)',
            }}
        >
            {/* Column Header */}
            <div
                className="p-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid #1f1f23' }}
            >
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-semibold text-sm" style={{ color: 'white' }}>{stage.title}</h3>
                </div>
                <span
                    className="text-xs font-medium px-2 py-1 rounded-md"
                    style={{ backgroundColor: '#1f1f23', color: '#a1a1aa' }}
                >
                    {applications.length}
                </span>
            </div>

            {/* Cards Container */}
            <SortableContext
                id={stage.id}
                items={applications.map((a) => a.id!)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 overflow-y-auto p-2 space-y-0">
                    <AnimatePresence mode="popLayout">
                        {applications.length === 0 ? (
                            <div
                                className="h-24 flex items-center justify-center rounded-lg m-2"
                                style={{ border: '2px dashed #27272a' }}
                            >
                                <p className="text-xs text-center px-4" style={{ color: '#52525b' }}>
                                    Drop here
                                </p>
                            </div>
                        ) : (
                            applications.map((app) => (
                                <DraggableCard key={app.id} application={app} />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </SortableContext>
        </div>
    );
}

export default function BoardPage() {
    const [isClient, setIsClient] = useState(false);
    const { apps: applications, loading, refresh, optimisticUpdate } = useActiveApplications();
    const { showToast } = useToast();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [overId, setOverId] = useState<ApplicationStatus | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Use shared subscription context
    const { subscription: subscriptionStatus, loading: subscriptionLoading, refresh: refreshSubscription } = useSubscription();

    // Guest signup prompt
    const { showPrompt: showGuestPrompt, appCount: guestAppCount, triggerPrompt, closePrompt } = useGuestSignupPrompt();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    // Group applications by status
    const applicationsByStatus = useMemo(() => {
        const grouped: Record<ApplicationStatus, Application[]> = {
            saved: [], applied: [], screen: [], interview1: [],
            interview2: [], final: [], offer: [], rejected: [], ghosted: [],
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

        for (const status of Object.keys(grouped) as ApplicationStatus[]) {
            grouped[status].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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
            if (typeof over.id === "string" && PIPELINE_STAGES.some((s) => s.id === over.id)) {
                setOverId(over.id as ApplicationStatus);
            } else {
                // Over a card - find its column
                const overApp = applications?.find((app) => app.id === over.id);
                if (overApp) setOverId(overApp.status);
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

        if (typeof over.id === "string" && PIPELINE_STAGES.some((s) => s.id === over.id)) {
            newStatus = over.id as ApplicationStatus;
        } else {
            const overApp = applications?.find((app) => app.id === over.id);
            if (overApp) newStatus = overApp.status;
        }

        if (newStatus && newStatus !== activeApp.status) {
            const stageName = PIPELINE_STAGES.find(s => s.id === newStatus)?.title || newStatus;
            await updateApplicationStatus(activeApp.id!, newStatus, true, optimisticUpdate);
            showToast(`Moved ${activeApp.company} to ${stageName}`, "success");
        }
    };

    const totalActive = applications?.filter((a) => !["rejected", "ghosted"].includes(a.status)).length ?? 0;
    const hasApplications = applications && applications.length > 0;

    // Handle add button click - check subscription limit
    const handleAddClick = () => {
        if (subscriptionStatus && !subscriptionStatus.canAddMore) {
            setShowUpgradeModal(true);
        } else {
            setShowAddModal(true);
        }
    };

    if (!isClient || loading || subscriptionLoading) {
        return <BoardSkeleton />;
    }

    // Empty state
    if (!hasApplications) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center" style={{ backgroundColor: '#09090b' }}>
                <div className="text-center max-w-md">
                    <div
                        className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                    >
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'white' }}>Your Pipeline Awaits</h2>
                    <p className="mb-6" style={{ color: '#71717a' }}>
                        Start tracking your job search journey with a visual Kanban board.
                    </p>
                    <button
                        onClick={handleAddClick}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                    >
                        <Plus className="w-5 h-5" />
                        Add First Application
                    </button>
                    <AddApplicationModal
                        open={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={refresh}
                        onGuestSuccess={triggerPrompt}
                        optimisticUpdate={optimisticUpdate}
                    />
                    <GuestSignupPrompt open={showGuestPrompt} onClose={closePrompt} applicationCount={guestAppCount} />
                </div>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#09090b' }}>
                {/* Header */}
                <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid #1f1f23' }}>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'white' }}>
                            Pipeline
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: '#71717a' }}>
                            {totalActive} active applications • Drag cards between stages
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#52525b' }} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 rounded-xl text-sm w-48 outline-none transition-all"
                                style={{
                                    backgroundColor: '#18181b',
                                    border: '1px solid #27272a',
                                    color: 'white',
                                }}
                            />
                        </div>

                        <button
                            onClick={handleAddClick}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium transition-all shadow-lg text-sm"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </div>
                </div>

                {/* Funnel Overview */}
                <div className="px-6 py-4 flex items-center gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #1f1f23' }}>
                    {PIPELINE_STAGES.map((stage, index) => {
                        const count = applicationsByStatus[stage.id].length;
                        return (
                            <div key={stage.id} className="flex items-center">
                                <div
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                    style={{
                                        backgroundColor: count > 0 ? `${stage.color}15` : 'transparent',
                                        color: count > 0 ? stage.color : '#52525b',
                                    }}
                                >
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: stage.color, opacity: count > 0 ? 1 : 0.3 }}
                                    />
                                    <span>{stage.title}</span>
                                    <span
                                        className="px-1.5 py-0.5 rounded text-xs"
                                        style={{ backgroundColor: count > 0 ? `${stage.color}20` : '#27272a' }}
                                    >
                                        {count}
                                    </span>
                                </div>
                                {index < PIPELINE_STAGES.length - 1 && (
                                    <div className="w-4 h-px mx-1" style={{ backgroundColor: '#27272a' }} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Kanban Board */}
                <div className="flex-1 overflow-x-auto p-6">
                    <div className="flex gap-4 min-w-max">
                        {PIPELINE_STAGES.map((stage) => (
                            <KanbanColumn
                                key={stage.id}
                                stage={stage}
                                applications={applicationsByStatus[stage.id]}
                                isOver={overId === stage.id}
                            />
                        ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeApplication && <StaticCard application={activeApplication} />}
                </DragOverlay>

                <AddApplicationModal
                    open={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        refresh();
                        refreshSubscription();
                    }}
                    onGuestSuccess={triggerPrompt}
                    optimisticUpdate={optimisticUpdate}
                />
                <UpgradeModal
                    open={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    currentApps={subscriptionStatus?.appCount ?? 0}
                    maxApps={20}
                />
                <GuestSignupPrompt
                    open={showGuestPrompt}
                    onClose={closePrompt}
                    applicationCount={guestAppCount}
                />
            </div>
        </DndContext>
    );
}
