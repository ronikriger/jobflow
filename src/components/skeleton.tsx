"use client";

import { motion } from "framer-motion";

// Card skeleton for dashboard/board
export function CardSkeleton() {
    return (
        <div
            className="rounded-xl p-4 space-y-3 animate-pulse"
            style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 rounded-md" style={{ backgroundColor: '#27272a' }} />
                    <div className="h-3 w-24 rounded-md" style={{ backgroundColor: '#27272a' }} />
                </div>
            </div>
            <div className="flex gap-2">
                <div className="h-6 w-16 rounded-md" style={{ backgroundColor: '#27272a' }} />
                <div className="h-6 w-12 rounded-md" style={{ backgroundColor: '#27272a' }} />
            </div>
        </div>
    );
}

// Stats card skeleton
export function StatCardSkeleton() {
    return (
        <div
            className="rounded-2xl p-5 space-y-4 animate-pulse"
            style={{ backgroundColor: '#18181b' }}
        >
            <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: '#27272a' }} />
                <div className="h-8 w-16 rounded-md" style={{ backgroundColor: '#27272a' }} />
            </div>
            <div className="space-y-2">
                <div className="h-4 w-24 rounded-md" style={{ backgroundColor: '#27272a' }} />
                <div className="h-2 w-full rounded-full" style={{ backgroundColor: '#27272a' }} />
            </div>
        </div>
    );
}

// Action card skeleton
export function ActionCardSkeleton() {
    return (
        <div
            className="rounded-xl p-4 flex items-center gap-4 animate-pulse"
            style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
        >
            <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: '#27272a' }} />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded-md" style={{ backgroundColor: '#27272a' }} />
                <div className="h-3 w-32 rounded-md" style={{ backgroundColor: '#27272a' }} />
            </div>
            <div className="h-8 w-16 rounded-lg" style={{ backgroundColor: '#27272a' }} />
        </div>
    );
}

// Pipeline column skeleton
export function ColumnSkeleton() {
    return (
        <div
            className="flex-shrink-0 w-72 rounded-xl animate-pulse"
            style={{ backgroundColor: '#0f0f10', border: '1px solid #1f1f23' }}
        >
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #1f1f23' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#27272a' }} />
                    <div className="h-4 w-20 rounded-md" style={{ backgroundColor: '#27272a' }} />
                </div>
                <div className="h-5 w-6 rounded-md" style={{ backgroundColor: '#1f1f23' }} />
            </div>
            <div className="p-2 space-y-2">
                <CardSkeleton />
                <CardSkeleton />
            </div>
        </div>
    );
}

// Full dashboard skeleton
export function DashboardSkeleton() {
    return (
        <div className="min-h-screen p-6 md:p-8" style={{ backgroundColor: '#09090b' }}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-40 rounded-md animate-pulse" style={{ backgroundColor: '#27272a' }} />
                        <div className="h-4 w-48 rounded-md animate-pulse" style={{ backgroundColor: '#1f1f23' }} />
                    </div>
                    <div className="h-12 w-40 rounded-xl animate-pulse" style={{ backgroundColor: '#27272a' }} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-6 w-32 rounded-md animate-pulse" style={{ backgroundColor: '#27272a' }} />
                        <ActionCardSkeleton />
                        <ActionCardSkeleton />
                        <ActionCardSkeleton />
                    </div>
                    <div className="space-y-4">
                        <div className="h-6 w-32 rounded-md animate-pulse" style={{ backgroundColor: '#27272a' }} />
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Board/Pipeline skeleton
export function BoardSkeleton() {
    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#09090b' }}>
            {/* Header */}
            <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid #1f1f23' }}>
                <div className="space-y-2">
                    <div className="h-7 w-28 rounded-md animate-pulse" style={{ backgroundColor: '#27272a' }} />
                    <div className="h-4 w-56 rounded-md animate-pulse" style={{ backgroundColor: '#1f1f23' }} />
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-40 rounded-xl animate-pulse" style={{ backgroundColor: '#18181b' }} />
                    <div className="h-10 w-20 rounded-xl animate-pulse" style={{ backgroundColor: '#27272a' }} />
                </div>
            </div>

            {/* Funnel bar */}
            <div className="px-6 py-4" style={{ borderBottom: '1px solid #1f1f23' }}>
                <div className="flex gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-6 w-20 rounded-lg animate-pulse" style={{ backgroundColor: '#1f1f23' }} />
                    ))}
                </div>
            </div>

            {/* Columns */}
            <div className="flex-1 overflow-x-auto p-6">
                <div className="flex gap-4">
                    <ColumnSkeleton />
                    <ColumnSkeleton />
                    <ColumnSkeleton />
                    <ColumnSkeleton />
                </div>
            </div>
        </div>
    );
}
