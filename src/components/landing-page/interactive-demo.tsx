"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2,
    MapPin,
    GripVertical,
    Plus,
    Sparkles,
    ArrowRight,
    CheckCircle2,
    Clock,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Hand
} from "lucide-react";
import Link from "next/link";

// Sample applications for the demo
type DemoApp = { id: number; company: string; role: string; location: string; color: string };
type DemoApps = {
    saved: DemoApp[];
    applied: DemoApp[];
    screen: DemoApp[];
    interview: DemoApp[];
    offer: DemoApp[];
};

const DEMO_APPS: DemoApps = {
    saved: [
        { id: 1, company: "Stripe", role: "Frontend Engineer", location: "Remote", color: "#635bff" },
    ],
    applied: [
        { id: 2, company: "Vercel", role: "Software Engineer", location: "SF / Remote", color: "#000" },
        { id: 3, company: "Linear", role: "Full Stack Dev", location: "Remote", color: "#5e6ad2" },
    ],
    screen: [
        { id: 4, company: "Notion", role: "Product Engineer", location: "NYC", color: "#000" },
    ],
    interview: [
        { id: 5, company: "Figma", role: "Design Engineer", location: "SF", color: "#f24e1e" },
    ],
    offer: [],
};

const STAGES = [
    { id: "saved", label: "Saved", color: "#818cf8" },
    { id: "applied", label: "Applied", color: "#3b82f6" },
    { id: "screen", label: "Screen", color: "#8b5cf6" },
    { id: "interview", label: "Interview", color: "#f59e0b" },
    { id: "offer", label: "Offer", color: "#10b981" },
];

function DemoCard({ app, isDragging, onTap }: { app: DemoApp; isDragging?: boolean; onTap?: () => void }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onTap}
            className={`p-3 rounded-lg bg-zinc-800/80 border border-zinc-700/50 cursor-grab active:cursor-grabbing touch-manipulation ${isDragging ? 'shadow-xl ring-2 ring-blue-500' : ''}`}
        >
            <div className="flex items-start gap-2">
                <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0"
                    style={{ backgroundColor: app.color }}
                >
                    {app.company[0]}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-white text-sm truncate">{app.company}</p>
                    <p className="text-xs text-zinc-400 truncate">{app.role}</p>
                </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
                <MapPin className="w-3 h-3" />
                <span>{app.location}</span>
            </div>
        </motion.div>
    );
}

export function InteractiveDemo() {
    const [apps, setApps] = useState<DemoApps>(DEMO_APPS);
    const [draggedApp, setDraggedApp] = useState<DemoApp | null>(null);
    const [draggedFrom, setDraggedFrom] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [interacted, setInteracted] = useState(false);
    const [selectedApp, setSelectedApp] = useState<{ app: DemoApp; from: string } | null>(null);
    const [showHint, setShowHint] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-animate a card moving to show it's interactive
    useEffect(() => {
        if (interacted) return;

        const timer = setTimeout(() => {
            // Move Figma to offer
            setApps(prev => {
                const figmaApp = prev.interview.find(a => a.id === 5);
                if (!figmaApp) return prev;

                return {
                    ...prev,
                    interview: prev.interview.filter(a => a.id !== 5),
                    offer: [...prev.offer, figmaApp],
                };
            });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 2500);

        return () => clearTimeout(timer);
    }, [interacted]);

    // Hide hint after interaction
    useEffect(() => {
        if (interacted) setShowHint(false);
    }, [interacted]);

    const handleDragStart = (app: DemoApp, fromStage: string) => {
        setInteracted(true);
        setDraggedApp(app);
        setDraggedFrom(fromStage);
    };

    const handleDragEnd = () => {
        setDraggedApp(null);
        setDraggedFrom(null);
    };

    const handleDrop = (toStage: string) => {
        if (!draggedApp || !draggedFrom || draggedFrom === toStage) return;

        setApps(prev => ({
            ...prev,
            [draggedFrom]: prev[draggedFrom as keyof typeof prev].filter(a => a.id !== draggedApp.id),
            [toStage]: [...prev[toStage as keyof typeof prev], draggedApp],
        }));

        if (toStage === "offer") {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }

        handleDragEnd();
    };

    // Mobile tap-to-select and tap-to-move
    const handleCardTap = (app: DemoApp, fromStage: string) => {
        setInteracted(true);
        if (selectedApp?.app.id === app.id) {
            setSelectedApp(null);
        } else {
            setSelectedApp({ app, from: fromStage });
        }
    };

    const handleColumnTap = (toStage: string) => {
        if (!selectedApp || selectedApp.from === toStage) return;

        setApps(prev => ({
            ...prev,
            [selectedApp.from]: prev[selectedApp.from as keyof typeof prev].filter(a => a.id !== selectedApp.app.id),
            [toStage]: [...prev[toStage as keyof typeof prev], selectedApp.app],
        }));

        if (toStage === "offer") {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }

        setSelectedApp(null);
    };

    // Scroll helpers for mobile
    const scrollLeft = () => {
        scrollRef.current?.scrollBy({ left: -176, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 176, behavior: 'smooth' });
    };

    return (
        <section className="py-12 sm:py-20 bg-black relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/0 via-blue-500/5 to-zinc-900/0" />

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center mb-8 sm:mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-medium mb-4 border border-emerald-500/20"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Try it now - no signup required</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
                    >
                        <span className="hidden sm:inline">Drag cards to see the magic ✨</span>
                        <span className="sm:hidden">Tap to move cards ✨</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto px-2"
                    >
                        Your job search, visualized. Move applications through your pipeline as you progress.
                    </motion.p>
                </div>

                {/* Demo Board */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-3 sm:p-4 backdrop-blur-sm shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-zinc-800">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="flex gap-1 sm:gap-1.5">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                                </div>
                                <span className="text-xs sm:text-sm text-zinc-400">Your Job Pipeline</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="hidden sm:inline">5 active applications</span>
                                <span className="sm:hidden">5 apps</span>
                            </div>
                        </div>

                        {/* Mobile scroll hint */}
                        <AnimatePresence>
                            {showHint && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="sm:hidden flex items-center justify-center gap-2 mb-3 text-xs text-zinc-500"
                                >
                                    <Hand className="w-4 h-4 animate-pulse" />
                                    <span>Swipe to see all stages · Tap a card then tap a column</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Mobile scroll buttons */}
                        <div className="sm:hidden flex justify-between mb-2">
                            <button
                                onClick={scrollLeft}
                                className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white active:scale-95 transition-all"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={scrollRight}
                                className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white active:scale-95 transition-all"
                                aria-label="Scroll right"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Kanban */}
                        <div
                            ref={scrollRef}
                            className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {STAGES.map((stage) => (
                                <div
                                    key={stage.id}
                                    onClick={() => handleColumnTap(stage.id)}
                                    className={`flex-shrink-0 w-36 sm:w-44 rounded-xl bg-zinc-950/50 border transition-all snap-start ${selectedApp && selectedApp.from !== stage.id
                                        ? 'border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/30'
                                        : draggedApp && draggedFrom !== stage.id
                                            ? 'border-blue-500/50 bg-blue-500/5'
                                            : 'border-zinc-800/50'
                                        }`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(stage.id)}
                                >
                                    {/* Column Header */}
                                    <div className="p-2 sm:p-3 flex items-center justify-between border-b border-zinc-800/50">
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: stage.color }}
                                            />
                                            <span className="text-xs font-medium text-white">{stage.label}</span>
                                        </div>
                                        <span className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">
                                            {apps[stage.id as keyof typeof apps].length}
                                        </span>
                                    </div>

                                    {/* Cards */}
                                    <div className="p-1.5 sm:p-2 space-y-2 min-h-[100px] sm:min-h-[120px]">
                                        <AnimatePresence mode="popLayout">
                                            {apps[stage.id as keyof typeof apps].map((app) => (
                                                <div
                                                    key={app.id}
                                                    draggable
                                                    onDragStart={() => handleDragStart(app, stage.id)}
                                                    onDragEnd={handleDragEnd}
                                                    className={`${selectedApp?.app.id === app.id ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
                                                >
                                                    <DemoCard
                                                        app={app}
                                                        isDragging={draggedApp?.id === app.id}
                                                        onTap={() => handleCardTap(app, stage.id)}
                                                    />
                                                </div>
                                            ))}
                                        </AnimatePresence>

                                        {apps[stage.id as keyof typeof apps].length === 0 && (
                                            <div className={`h-16 sm:h-20 flex items-center justify-center border-2 border-dashed rounded-lg transition-colors ${selectedApp ? 'border-blue-500/50 bg-blue-500/5' : 'border-zinc-800'
                                                }`}>
                                                <p className="text-xs text-zinc-600">
                                                    {selectedApp ? 'Tap to move here' : 'Drop here'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mobile selection indicator */}
                        <AnimatePresence>
                            {selectedApp && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="sm:hidden mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center"
                                >
                                    <p className="text-sm text-blue-400">
                                        <span className="font-semibold">{selectedApp.app.company}</span> selected — tap another column to move
                                    </p>
                                    <button
                                        onClick={() => setSelectedApp(null)}
                                        className="mt-2 text-xs text-zinc-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Success Toast */}
                        <AnimatePresence>
                            {showSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, x: '-50%' }}
                                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                                    exit={{ opacity: 0, y: 20, x: '-50%' }}
                                    className="absolute bottom-4 sm:bottom-6 left-1/2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-emerald-500 text-white text-sm sm:text-base font-medium flex items-center gap-2 shadow-lg"
                                >
                                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">🎉 Congrats! You landed an offer!</span>
                                    <span className="sm:hidden">🎉 Offer landed!</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* CTA Below Demo */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="text-center mt-6 sm:mt-8 px-2"
                    >
                        <Link
                            href="/home"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 sm:py-5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-base sm:text-lg transition-all hover:scale-105 active:scale-[0.98] shadow-lg shadow-blue-500/25 min-h-[56px]"
                        >
                            <Sparkles className="w-5 h-5" />
                            Try Free – No Signup Required
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <p className="text-xs sm:text-sm text-zinc-500 mt-3">
                            Free for up to 20 applications · No credit card required
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
