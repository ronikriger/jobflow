"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
import { Plus, Search, Inbox, ChevronRight, Sparkles, TrendingUp, X } from "lucide-react";
import { useActiveApplications, updateApplicationStatus } from "@/lib/hooks";
import { ApplicationCard } from "@/components/application-card";
import { AddApplicationModal } from "@/components/add-application-modal";
import { cn } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/lib/types";

const PIPELINE_STAGES: { id: ApplicationStatus; title: string; color: string; gradient: string }[] = [
    { id: "saved", title: "Saved", color: "#818cf8", gradient: "from-indigo-500 to-indigo-600" },
    { id: "applied", title: "Applied", color: "#60a5fa", gradient: "from-blue-500 to-blue-600" },
    { id: "screen", title: "Screen", color: "#a78bfa", gradient: "from-violet-500 to-violet-600" },
    { id: "interview1", title: "Interview 1", color: "#fbbf24", gradient: "from-amber-500 to-amber-600" },
    { id: "interview2", title: "Interview 2", color: "#fb923c", gradient: "from-orange-500 to-orange-600" },
    { id: "final", title: "Final", color: "#f472b6", gradient: "from-pink-500 to-pink-600" },
    { id: "offer", title: "Offer", color: "#34d399", gradient: "from-emerald-500 to-emerald-600" },
];

const END_STAGES: { id: ApplicationStatus; title: string; color: string; gradient: string }[] = [
    { id: "rejected", title: "Rejected", color: "#f87171", gradient: "from-red-500 to-red-600" },
    { id: "ghosted", title: "Ghosted", color: "#9ca3af", gradient: "from-gray-500 to-gray-600" },
];

// Animated flow particles
function FlowParticle({ delay, color }: { delay: number; color: string }) {
    return (
        <motion.div
            className="absolute w-2 h-2 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
            initial={{ left: "0%", opacity: 0 }}
            animate={{
                left: ["0%", "100%"],
                opacity: [0, 1, 1, 0],
            }}
            transition={{
                duration: 2,
                delay,
                repeat: Infinity,
                ease: "linear",
            }}
        />
    );
}

// Flow connection between stages
function FlowConnection({ from, to, fromCount, toCount, maxCount }: {
    from: string;
    to: string;
    fromCount: number;
    toCount: number;
    maxCount: number;
}) {
    const flowStrength = Math.max(fromCount, toCount);
    const opacity = maxCount > 0 ? 0.3 + (flowStrength / maxCount) * 0.5 : 0.3;
    const width = maxCount > 0 ? 2 + (flowStrength / maxCount) * 4 : 2;

    return (
        <div className="flex-1 h-8 relative flex items-center mx-1">
            <div
                className="w-full rounded-full relative overflow-hidden"
                style={{
                    height: `${width}px`,
                    background: `linear-gradient(90deg, ${from}, ${to})`,
                    opacity,
                }}
            >
                {flowStrength > 0 && (
                    <>
                        <FlowParticle delay={0} color={to} />
                        <FlowParticle delay={0.7} color={to} />
                        <FlowParticle delay={1.4} color={to} />
                    </>
                )}
            </div>
        </div>
    );
}

// Stage node in the flow diagram
function StageNode({
    stage,
    count,
    maxCount,
    isSelected,
    onClick,
    isEnd = false,
}: {
    stage: typeof PIPELINE_STAGES[0];
    count: number;
    maxCount: number;
    isSelected: boolean;
    onClick: () => void;
    isEnd?: boolean;
}) {
    const size = 60 + (maxCount > 0 ? (count / maxCount) * 30 : 0);

    return (
        <motion.button
            onClick={onClick}
            className={cn(
                "relative group flex flex-col items-center gap-2 transition-all",
                isSelected && "scale-110"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Glow effect */}
            {count > 0 && (
                <motion.div
                    className="absolute rounded-full blur-xl"
                    style={{
                        width: size + 20,
                        height: size + 20,
                        backgroundColor: stage.color,
                        opacity: isSelected ? 0.4 : 0.2,
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: isSelected ? [0.3, 0.5, 0.3] : [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            {/* Main node */}
            <motion.div
                className={cn(
                    "relative rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-all border-2",
                    isSelected ? "border-white" : "border-transparent",
                    `bg-gradient-to-br ${stage.gradient}`
                )}
                style={{
                    width: size,
                    height: size,
                    boxShadow: count > 0 ? `0 4px 20px ${stage.color}50` : undefined,
                }}
            >
                <span className="text-lg">{count}</span>

                {/* Pulse ring when selected */}
                {isSelected && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2"
                        style={{ borderColor: stage.color }}
                        animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                )}
            </motion.div>

            {/* Label */}
            <span className={cn(
                "text-xs font-medium transition-colors",
                isSelected ? "text-white" : "text-zinc-400"
            )}>
                {stage.title}
            </span>
        </motion.button>
    );
}

export default function BoardPage() {
    const applications = useActiveApplications();
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [overId, setOverId] = useState<ApplicationStatus | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStage, setSelectedStage] = useState<ApplicationStatus | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
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
            grouped[status].sort(
                (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
        }

        return grouped;
    }, [applications, searchQuery]);

    const maxCount = useMemo(() => {
        return Math.max(...Object.values(applicationsByStatus).map(arr => arr.length), 1);
    }, [applicationsByStatus]);

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
            const allStages = [...PIPELINE_STAGES, ...END_STAGES];
            if (typeof over.id === "string" && allStages.some((s) => s.id === over.id)) {
                setOverId(over.id as ApplicationStatus);
            } else {
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
        const allStages = [...PIPELINE_STAGES, ...END_STAGES];

        if (typeof over.id === "string" && allStages.some((s) => s.id === over.id)) {
            newStatus = over.id as ApplicationStatus;
        } else {
            const overApp = applications?.find((app) => app.id === over.id);
            if (overApp) newStatus = overApp.status;
        }

        if (newStatus && newStatus !== activeApp.status) {
            await updateApplicationStatus(activeApp.id!, newStatus);
        }
    };

    const totalActive = applications?.filter(
        (a) => !["rejected", "ghosted"].includes(a.status)
    ).length ?? 0;

    const hasApplications = applications && applications.length > 0;

    // Auto-select first non-empty stage
    useEffect(() => {
        if (hasApplications && !selectedStage) {
            const firstWithApps = [...PIPELINE_STAGES, ...END_STAGES].find(
                s => applicationsByStatus[s.id].length > 0
            );
            if (firstWithApps) setSelectedStage(firstWithApps.id);
        }
    }, [hasApplications, applicationsByStatus, selectedStage]);

    // Empty state
    if (!hasApplications) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mb-6 shadow-lg">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-white">Your Pipeline Awaits</h2>
                    <p className="text-zinc-400 mb-6">
                        Start tracking your job search journey. Watch your applications flow through the pipeline.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium hover:opacity-90 transition-all shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Add First Application
                    </button>
                    <AddApplicationModal open={showAddModal} onClose={() => setShowAddModal(false)} />
                </motion.div>
            </div>
        );
    }

    const selectedApps = selectedStage ? applicationsByStatus[selectedStage] : [];
    const selectedStageConfig = [...PIPELINE_STAGES, ...END_STAGES].find(s => s.id === selectedStage);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="min-h-screen p-6 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-blue-500" />
                            Application Flow
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1">
                            {totalActive} active • Click a stage to view applications
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm w-48 text-white placeholder:text-zinc-500"
                            />
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium hover:opacity-90 transition-all shadow-lg text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </div>
                </div>

                {/* Flow Diagram */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8 mb-6"
                >
                    {/* Main Pipeline */}
                    <div className="flex items-center justify-center gap-1 mb-8">
                        {PIPELINE_STAGES.map((stage, index) => (
                            <div key={stage.id} className="flex items-center">
                                <StageNode
                                    stage={stage}
                                    count={applicationsByStatus[stage.id].length}
                                    maxCount={maxCount}
                                    isSelected={selectedStage === stage.id}
                                    onClick={() => setSelectedStage(stage.id)}
                                />
                                {index < PIPELINE_STAGES.length - 1 && (
                                    <FlowConnection
                                        from={stage.color}
                                        to={PIPELINE_STAGES[index + 1].color}
                                        fromCount={applicationsByStatus[stage.id].length}
                                        toCount={applicationsByStatus[PIPELINE_STAGES[index + 1].id].length}
                                        maxCount={maxCount}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* End stages (Rejected/Ghosted) */}
                    <div className="flex justify-center gap-8">
                        {END_STAGES.map((stage) => (
                            <StageNode
                                key={stage.id}
                                stage={stage}
                                count={applicationsByStatus[stage.id].length}
                                maxCount={maxCount}
                                isSelected={selectedStage === stage.id}
                                onClick={() => setSelectedStage(stage.id)}
                                isEnd
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Selected Stage Applications */}
                <AnimatePresence mode="wait">
                    {selectedStage && selectedStageConfig && (
                        <motion.div
                            key={selectedStage}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex-1"
                        >
                            {/* Stage Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold",
                                            `bg-gradient-to-br ${selectedStageConfig.gradient}`
                                        )}
                                    >
                                        {selectedApps.length}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">{selectedStageConfig.title}</h2>
                                        <p className="text-sm text-zinc-400">
                                            {selectedApps.length === 0
                                                ? "No applications in this stage"
                                                : `${selectedApps.length} application${selectedApps.length !== 1 ? 's' : ''}`
                                            }
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedStage(null)}
                                    className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Applications Grid */}
                            <SortableContext
                                items={selectedApps.map((a) => a.id!)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div
                                    id={selectedStage}
                                    className={cn(
                                        "grid gap-3 min-h-[200px] p-4 rounded-xl border transition-all",
                                        selectedApps.length > 0
                                            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                            : "",
                                        overId === selectedStage
                                            ? "border-blue-500/50 bg-blue-500/5"
                                            : "border-zinc-800 bg-zinc-900/30"
                                    )}
                                >
                                    {selectedApps.length === 0 ? (
                                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-zinc-500">
                                            <Inbox className="w-12 h-12 mb-3 opacity-50" />
                                            <p className="text-sm">Drag applications here or add new ones</p>
                                        </div>
                                    ) : (
                                        selectedApps.map((app) => (
                                            <ApplicationCard key={app.id} application={app} />
                                        ))
                                    )}
                                </div>
                            </SortableContext>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Quick stage selector when nothing selected */}
                {!selectedStage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex items-center justify-center"
                    >
                        <div className="text-center text-zinc-500">
                            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Click a stage above to view applications</p>
                        </div>
                    </motion.div>
                )}

                <DragOverlay>
                    {activeApplication && (
                        <div className="rotate-2 opacity-95">
                            <ApplicationCard application={activeApplication} isDraggable={false} />
                        </div>
                    )}
                </DragOverlay>

                <AddApplicationModal open={showAddModal} onClose={() => setShowAddModal(false)} />
            </div>
        </DndContext>
    );
}
