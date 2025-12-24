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
import { Plus, Search, Inbox, Sparkles, TrendingUp, X, GripVertical } from "lucide-react";
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
  
  // Top curve
  const topPath = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  // Bottom curve (reverse direction)
  const bottomPath = `L ${x2} ${y2 + h2} C ${midX} ${y2 + h2}, ${midX} ${y1 + h1}, ${x1} ${y1 + h1} Z`;
  
  return topPath + " " + bottomPath;
}

// Sankey Diagram Component
function SankeyDiagram({ 
  applicationsByStatus, 
  onStageClick,
  selectedStage 
}: { 
  applicationsByStatus: Record<ApplicationStatus, Application[]>;
  onStageClick: (stage: ApplicationStatus) => void;
  selectedStage: ApplicationStatus | null;
}) {
  const svgWidth = 900;
  const svgHeight = 320;
  const nodeWidth = 24;
  const nodePadding = 20;
  const topPadding = 40;
  
  // Calculate positions and heights
  const sankeyData = useMemo(() => {
    const allStages = [...PIPELINE_STAGES, ...END_STAGES];
    const maxCount = Math.max(...allStages.map(s => applicationsByStatus[s.id].length), 1);
    const minNodeHeight = 40;
    const maxNodeHeight = 180;
    
    // Main pipeline stages
    const mainStageWidth = (svgWidth - nodePadding * 2) / PIPELINE_STAGES.length;
    
    const mainNodes = PIPELINE_STAGES.map((stage, index) => {
      const count = applicationsByStatus[stage.id].length;
      const height = Math.max(minNodeHeight, (count / maxCount) * maxNodeHeight);
      const x = nodePadding + index * mainStageWidth + (mainStageWidth - nodeWidth) / 2;
      const y = topPadding + (maxNodeHeight - height) / 2;
      
      return {
        ...stage,
        x,
        y,
        width: nodeWidth,
        height,
        count,
        centerY: y + height / 2,
      };
    });
    
    // End stages (below main flow)
    const endY = topPadding + maxNodeHeight + 50;
    const endStageWidth = svgWidth / (END_STAGES.length + 1);
    
    const endNodes = END_STAGES.map((stage, index) => {
      const count = applicationsByStatus[stage.id].length;
      const height = Math.max(minNodeHeight * 0.6, (count / maxCount) * maxNodeHeight * 0.5);
      const x = endStageWidth * (index + 1) - nodeWidth / 2;
      
      return {
        ...stage,
        x,
        y: endY,
        width: nodeWidth,
        height,
        count,
        centerY: endY + height / 2,
      };
    });
    
    // Generate flows between main stages
    const flows: { path: string; color: string; opacity: number }[] = [];
    
    for (let i = 0; i < mainNodes.length - 1; i++) {
      const from = mainNodes[i];
      const to = mainNodes[i + 1];
      
      // Flow thickness based on minimum of the two connected stages
      const flowCount = Math.min(from.count, to.count);
      if (flowCount === 0) continue;
      
      const flowHeight = Math.max(4, (flowCount / maxCount) * 60);
      
      const path = generateSankeyPath(
        from.x + from.width, from.centerY - flowHeight / 2, flowHeight,
        to.x, to.centerY - flowHeight / 2, flowHeight
      );
      
      // Gradient from one color to next
      flows.push({
        path,
        color: `url(#gradient-${i})`,
        opacity: 0.6,
      });
    }
    
    // Flows to end stages (from any stage with applications)
    const rejectedSource = mainNodes.find(n => applicationsByStatus[n.id].length > 0);
    const ghostedSource = mainNodes.find(n => applicationsByStatus[n.id].length > 0);
    
    if (rejectedSource && applicationsByStatus.rejected.length > 0) {
      const endNode = endNodes[0];
      const flowHeight = Math.max(3, (applicationsByStatus.rejected.length / maxCount) * 40);
      flows.push({
        path: generateSankeyPath(
          rejectedSource.x + rejectedSource.width, rejectedSource.centerY, flowHeight,
          endNode.x, endNode.y, flowHeight
        ),
        color: endNode.color,
        opacity: 0.3,
      });
    }
    
    if (ghostedSource && applicationsByStatus.ghosted.length > 0) {
      const endNode = endNodes[1];
      const flowHeight = Math.max(3, (applicationsByStatus.ghosted.length / maxCount) * 40);
      flows.push({
        path: generateSankeyPath(
          ghostedSource.x + ghostedSource.width, ghostedSource.centerY, flowHeight,
          endNode.x, endNode.y, flowHeight
        ),
        color: endNode.color,
        opacity: 0.3,
      });
    }
    
    return { mainNodes, endNodes, flows, maxCount };
  }, [applicationsByStatus]);

  return (
    <div className="w-full overflow-x-auto">
      <svg 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
        className="w-full min-w-[700px]"
        style={{ maxHeight: '350px' }}
      >
        <defs>
          {/* Gradients for flows */}
          {PIPELINE_STAGES.slice(0, -1).map((stage, i) => (
            <linearGradient key={i} id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={stage.color} />
              <stop offset="100%" stopColor={PIPELINE_STAGES[i + 1].color} />
            </linearGradient>
          ))}
          
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Flow paths */}
        {sankeyData.flows.map((flow, i) => (
          <motion.path
            key={i}
            d={flow.path}
            fill={flow.color}
            opacity={flow.opacity}
            initial={{ opacity: 0 }}
            animate={{ opacity: flow.opacity }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
        ))}
        
        {/* Main stage nodes */}
        {sankeyData.mainNodes.map((node, i) => (
          <g key={node.id}>
            {/* Node rectangle */}
            <motion.rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              rx={6}
              fill={node.color}
              className="cursor-pointer"
              filter={selectedStage === node.id ? "url(#glow)" : undefined}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ 
                opacity: 1, 
                scaleY: 1,
                stroke: selectedStage === node.id ? "#fff" : "transparent",
                strokeWidth: selectedStage === node.id ? 2 : 0,
              }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              onClick={() => onStageClick(node.id)}
              style={{ transformOrigin: `${node.x + node.width/2}px ${node.y + node.height}px` }}
              whileHover={{ scale: 1.05, filter: "url(#glow)" }}
            />
            
            {/* Count label */}
            <motion.text
              x={node.x + node.width / 2}
              y={node.y - 8}
              textAnchor="middle"
              className="text-sm font-bold fill-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 + 0.2 }}
            >
              {node.count}
            </motion.text>
            
            {/* Stage label */}
            <motion.text
              x={node.x + node.width / 2}
              y={node.y + node.height + 18}
              textAnchor="middle"
              className={cn(
                "text-xs font-medium",
                selectedStage === node.id ? "fill-white" : "fill-zinc-400"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 + 0.3 }}
            >
              {node.title}
            </motion.text>
          </g>
        ))}
        
        {/* End stage nodes */}
        {sankeyData.endNodes.map((node, i) => (
          <g key={node.id}>
            <motion.rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              rx={4}
              fill={node.color}
              className="cursor-pointer"
              filter={selectedStage === node.id ? "url(#glow)" : undefined}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 0.8,
                stroke: selectedStage === node.id ? "#fff" : "transparent",
                strokeWidth: selectedStage === node.id ? 2 : 0,
              }}
              transition={{ delay: 0.5 + i * 0.1 }}
              onClick={() => onStageClick(node.id)}
              whileHover={{ opacity: 1, filter: "url(#glow)" }}
            />
            
            <motion.text
              x={node.x + node.width / 2}
              y={node.y - 8}
              textAnchor="middle"
              className="text-xs font-semibold fill-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
              {node.count}
            </motion.text>
            
            <motion.text
              x={node.x + node.width / 2}
              y={node.y + node.height + 14}
              textAnchor="middle"
              className={cn(
                "text-[10px] font-medium",
                selectedStage === node.id ? "fill-white" : "fill-zinc-500"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
            >
              {node.title}
            </motion.text>
          </g>
        ))}
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
        <div className="flex items-center justify-between mb-6">
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
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                    style={{ backgroundColor: selectedStageConfig.color }}
                  >
                    {selectedApps.length}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{selectedStageConfig.title}</h2>
                    <p className="text-sm text-zinc-400">
                      {selectedApps.length === 0 
                        ? "No applications in this stage"
                        : `${selectedApps.length} application${selectedApps.length !== 1 ? 's' : ''} • Drag to reorder or move`
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
