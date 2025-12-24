"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Plus, Search, Inbox, Sparkles, TrendingUp, X, Loader2 } from "lucide-react";
import { useActiveApplications, updateApplicationStatus } from "@/lib/hooks";
import { ApplicationCard } from "@/components/application-card";
import { AddApplicationModal } from "@/components/add-application-modal";
import { cn } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/lib/types";

const PIPELINE_STAGES: { id: ApplicationStatus; title: string; color: string }[] = [
    { id: "saved", title: "Saved", color: "#818cf8" },
    { id: "applied", title: "Applied", color: "#60a5fa" },
    { id: "screen", title: "Screen", color: "#a78bfa" },
    { id: "interview1", title: "Interview 1", color: "#fbbf24" },
    { id: "interview2", title: "Interview 2", color: "#fb923c" },
    { id: "final", title: "Final", color: "#f472b6" },
    { id: "offer", title: "Offer", color: "#34d399" },
];

const END_STAGES: { id: ApplicationStatus; title: string; color: string }[] = [
    { id: "rejected", title: "Rejected", color: "#f87171" },
    { id: "ghosted", title: "Ghosted", color: "#6b7280" },
];

// Generate SVG path for a curved flow between two rectangles
function generateSankeyPath(
    x1: number, y1: number, h1: number,
    x2: number, y2: number, h2: number
): string {
    const midX = (x1 + x2) / 2;
    const topPath = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
    const bottomPath = `L ${x2} ${y2 + h2} C ${midX} ${y2 + h2}, ${midX} ${y1 + h1}, ${x1} ${y1 + h1} Z`;
    return topPath + " " + bottomPath;
}

// Sankey Diagram Component
function SankeyDiagram({
    applicationsByStatus,
    onStageClick,
    selectedStage,
    hoveredStage,
    onStageHover,
}: {
    applicationsByStatus: Record<ApplicationStatus, Application[]>;
    onStageClick: (stage: ApplicationStatus) => void;
    selectedStage: ApplicationStatus | null;
    hoveredStage: ApplicationStatus | null;
    onStageHover: (stage: ApplicationStatus | null) => void;
}) {
    const svgWidth = 900;
    const svgHeight = 340;
    const nodeWidth = 28;
    const nodePadding = 20;
    const topPadding = 50;

    const sankeyData = useMemo(() => {
        const allStages = [...PIPELINE_STAGES, ...END_STAGES];
        const maxCount = Math.max(...allStages.map(s => applicationsByStatus[s.id].length), 1);
        const minNodeHeight = 50;
        const maxNodeHeight = 180;

        const mainStageWidth = (svgWidth - nodePadding * 2) / PIPELINE_STAGES.length;

        const mainNodes = PIPELINE_STAGES.map((stage, index) => {
            const count = applicationsByStatus[stage.id].length;
            const height = Math.max(minNodeHeight, (count / maxCount) * maxNodeHeight);
            const x = nodePadding + index * mainStageWidth + (mainStageWidth - nodeWidth) / 2;
            const y = topPadding + (maxNodeHeight - height) / 2;

            return { ...stage, x, y, width: nodeWidth, height, count, centerY: y + height / 2 };
        });

        const endY = topPadding + maxNodeHeight + 60;
        const endStageWidth = svgWidth / (END_STAGES.length + 1);

        const endNodes = END_STAGES.map((stage, index) => {
            const count = applicationsByStatus[stage.id].length;
            const height = Math.max(minNodeHeight * 0.5, (count / maxCount) * maxNodeHeight * 0.4);
            const x = endStageWidth * (index + 1) - nodeWidth / 2;

            return { ...stage, x, y: endY, width: nodeWidth, height, count, centerY: endY + height / 2 };
        });

        const flows: { path: string; fromColor: string; toColor: string; fromId: ApplicationStatus; toId: ApplicationStatus; }[] = [];

        for (let i = 0; i < mainNodes.length - 1; i++) {
            const from = mainNodes[i];
            const to = mainNodes[i + 1];
            const flowCount = Math.min(from.count, to.count);
            if (flowCount === 0) continue;

            const flowHeight = Math.max(6, (flowCount / maxCount) * 50);
            const path = generateSankeyPath(
                from.x + from.width, from.centerY - flowHeight / 2, flowHeight,
                to.x, to.centerY - flowHeight / 2, flowHeight
            );

            flows.push({ path, fromColor: from.color, toColor: to.color, fromId: from.id, toId: to.id });
        }

        return { mainNodes, endNodes, flows, maxCount };
    }, [applicationsByStatus]);

    const isHighlighted = (stageId: ApplicationStatus) => {
        return selectedStage === stageId || hoveredStage === stageId;
    };

    return (
        <div className="w-full overflow-x-auto">
            <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full min-w-[700px]"
                style={{ maxHeight: '380px' }}
            >
                <defs>
                    {PIPELINE_STAGES.slice(0, -1).map((stage, i) => (
                        <linearGradient key={i} id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={stage.color} />
                            <stop offset="100%" stopColor={PIPELINE_STAGES[i + 1].color} />
                        </linearGradient>
                    ))}

                    <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Flow paths */}
                {sankeyData.flows.map((flow, i) => {
                    const isFlowHighlighted = isHighlighted(flow.fromId) || isHighlighted(flow.toId);
                    return (
                        <motion.path
                            key={i}
                            d={flow.path}
                            fill={`url(#gradient-${i})`}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: isFlowHighlighted ? 0.8 : 0.4,
                                filter: isFlowHighlighted ? "url(#glow)" : "none",
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    );
                })}

                {/* Main stage nodes */}
                {sankeyData.mainNodes.map((node, i) => {
                    const highlighted = isHighlighted(node.id);
                    return (
                        <g key={node.id}>
                            {/* Glow background for selected */}
                            {highlighted && (
                                <motion.rect
                                    x={node.x - 8}
                                    y={node.y - 8}
                                    width={node.width + 16}
                                    height={node.height + 16}
                                    rx={12}
                                    fill={node.color}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.3 }}
                                    filter="url(#strongGlow)"
                                />
                            )}

                            {/* Node rectangle */}
                            <motion.rect
                                x={node.x}
                                y={node.y}
                                width={node.width}
                                height={node.height}
                                rx={8}
                                fill={node.color}
                                className="cursor-pointer"
                                initial={{ opacity: 0, scaleY: 0 }}
                                animate={{
                                    opacity: highlighted ? 1 : 0.85,
                                    scaleY: 1,
                                    scale: highlighted ? 1.05 : 1,
                                }}
                                transition={{ delay: i * 0.05, duration: 0.3 }}
                                onClick={() => onStageClick(node.id)}
                                onMouseEnter={() => onStageHover(node.id)}
                                onMouseLeave={() => onStageHover(null)}
                                style={{ transformOrigin: `${node.x + node.width / 2}px ${node.y + node.height / 2}px` }}
                                filter={highlighted ? "url(#glow)" : undefined}
                            />

                            {/* Selection ring */}
                            {selectedStage === node.id && (
                                <motion.rect
                                    x={node.x - 3}
                                    y={node.y - 3}
                                    width={node.width + 6}
                                    height={node.height + 6}
                                    rx={10}
                                    fill="none"
                                    stroke="white"
                                    strokeWidth={2}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            )}

                            {/* Count label */}
                            <motion.text
                                x={node.x + node.width / 2}
                                y={node.y - 12}
                                textAnchor="middle"
                                className="text-base font-bold"
                                fill={highlighted ? "white" : "#e4e4e7"}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 + 0.2 }}
                            >
                                {node.count}
                            </motion.text>

                            {/* Stage label */}
                            <motion.text
                                x={node.x + node.width / 2}
                                y={node.y + node.height + 20}
                                textAnchor="middle"
                                className="text-xs font-medium"
                                fill={highlighted ? "white" : "#a1a1aa"}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 + 0.3 }}
                            >
                                {node.title}
                            </motion.text>
                        </g>
                    );
                })}

                {/* End stage nodes */}
                {sankeyData.endNodes.map((node, i) => {
                    const highlighted = isHighlighted(node.id);
                    return (
                        <g key={node.id}>
                            {highlighted && (
                                <motion.rect
                                    x={node.x - 6}
                                    y={node.y - 6}
                                    width={node.width + 12}
                                    height={node.height + 12}
                                    rx={10}
                                    fill={node.color}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.3 }}
                                    filter="url(#strongGlow)"
                                />
                            )}

                            <motion.rect
                                x={node.x}
                                y={node.y}
                                width={node.width}
                                height={node.height}
                                rx={6}
                                fill={node.color}
                                className="cursor-pointer"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: highlighted ? 1 : 0.7,
                                    scale: highlighted ? 1.05 : 1,
                                }}
                                transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                                onClick={() => onStageClick(node.id)}
                                onMouseEnter={() => onStageHover(node.id)}
                                onMouseLeave={() => onStageHover(null)}
                                style={{ transformOrigin: `${node.x + node.width / 2}px ${node.y + node.height / 2}px` }}
                                filter={highlighted ? "url(#glow)" : undefined}
                            />

                            {selectedStage === node.id && (
                                <motion.rect
                                    x={node.x - 3}
                                    y={node.y - 3}
                                    width={node.width + 6}
                                    height={node.height + 6}
                                    rx={8}
                                    fill="none"
                                    stroke="white"
                                    strokeWidth={2}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            )}

                            <motion.text
                                x={node.x + node.width / 2}
                                y={node.y - 10}
                                textAnchor="middle"
                                className="text-sm font-bold"
                                fill={highlighted ? "white" : "#e4e4e7"}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                            >
                                {node.count}
                            </motion.text>

                            <motion.text
                                x={node.x + node.width / 2}
                                y={node.y + node.height + 16}
                                textAnchor="middle"
                                className="text-[11px] font-medium"
                                fill={highlighted ? "white" : "#71717a"}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 + i * 0.1 }}
                            >
                                {node.title}
                            </motion.text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

export default function BoardPage() {
    const applications = useActiveApplications();
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [overId, setOverId] = useState<ApplicationStatus | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStage, setSelectedStage] = useState<ApplicationStatus | null>(null);
    const [hoveredStage, setHoveredStage] = useState<ApplicationStatus | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

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

    const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as number);

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

    const totalActive = applications?.filter((a) => !["rejected", "ghosted"].includes(a.status)).length ?? 0;
    const hasApplications = applications && applications.length > 0;

    useEffect(() => {
        if (hasApplications && !selectedStage) {
            const firstWithApps = [...PIPELINE_STAGES, ...END_STAGES].find(s => applicationsByStatus[s.id].length > 0);
            if (firstWithApps) setSelectedStage(firstWithApps.id);
        }
    }, [hasApplications, applicationsByStatus, selectedStage]);

    // Loading state
    if (applications === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-zinc-400">Loading pipeline...</p>
                </motion.div>
            </div>
        );
    }

    // Empty state
    if (!hasApplications) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center bg-zinc-950">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-white">Your Pipeline Awaits</h2>
                    <p className="text-zinc-400 mb-6">Start tracking your job search journey. Watch your applications flow through the pipeline.</p>
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
            <div className="min-h-screen p-6 flex flex-col bg-zinc-950">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-blue-500" />
                            Application Flow
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1">{totalActive} active • Click a stage to view applications</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm w-48 text-white placeholder:text-zinc-500"
                            />
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </div>
                </div>

                {/* Sankey Diagram */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 mb-6"
                >
                    <SankeyDiagram
                        applicationsByStatus={applicationsByStatus}
                        onStageClick={setSelectedStage}
                        selectedStage={selectedStage}
                        hoveredStage={hoveredStage}
                        onStageHover={setHoveredStage}
                    />
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
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                                        style={{ backgroundColor: selectedStageConfig.color, boxShadow: `0 4px 20px ${selectedStageConfig.color}40` }}
                                    >
                                        {selectedApps.length}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">{selectedStageConfig.title}</h2>
                                        <p className="text-sm text-zinc-400">
                                            {selectedApps.length === 0 ? "No applications in this stage" : `${selectedApps.length} application${selectedApps.length !== 1 ? 's' : ''} • Drag to reorder`}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedStage(null)} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <SortableContext items={selectedApps.map((a) => a.id!)} strategy={verticalListSortingStrategy}>
                                <div
                                    id={selectedStage}
                                    className={cn(
                                        "grid gap-3 min-h-[200px] p-4 rounded-xl border transition-all",
                                        selectedApps.length > 0 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "",
                                        overId === selectedStage ? "border-blue-500/50 bg-blue-500/5" : "border-zinc-800 bg-zinc-900/30"
                                    )}
                                >
                                    {selectedApps.length === 0 ? (
                                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-zinc-500">
                                            <Inbox className="w-12 h-12 mb-3 opacity-50" />
                                            <p className="text-sm">Drag applications here or add new ones</p>
                                        </div>
                                    ) : (
                                        selectedApps.map((app) => <ApplicationCard key={app.id} application={app} />)
                                    )}
                                </div>
                            </SortableContext>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!selectedStage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center">
                        <div className="text-center text-zinc-500">
                            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Click a stage in the diagram above to view applications</p>
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
