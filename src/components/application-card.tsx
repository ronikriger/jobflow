"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    Clock,
    MapPin,
    ExternalLink,
    MoreHorizontal,
    Trash2,
    X,
    CheckCircle2,
    Ghost
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn, getDaysInStage, getCompanyLogo, getStatusColorClass, formatRelativeDate } from "@/lib/utils";
import { updateApplicationStatus, deleteApplication } from "@/lib/hooks";
import { useUser } from "@stackframe/stack";
import type { Application, ApplicationStatus } from "@/lib/types";
import { PLATFORM_CONFIG, STATUS_CONFIG } from "@/lib/types";

interface ApplicationCardProps {
    application: Application;
    isDraggable?: boolean;
}

export function ApplicationCard({ application, isDraggable = true }: ApplicationCardProps) {
    const user = useUser();
    const [showMenu, setShowMenu] = useState(false);
    const [imageError, setImageError] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: application.id!,
        disabled: !isDraggable,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const daysInStage = getDaysInStage(application);
    const platformConfig = PLATFORM_CONFIG[application.platform];

    const handleQuickAction = async (action: "rejected" | "ghosted" | "offer") => {
        await updateApplicationStatus(application.id!, action, !!user);
        setShowMenu(false);
    };

    const handleDelete = async () => {
        if (confirm(`Delete application for ${application.company}?`)) {
            await deleteApplication(application.id!, !!user);
        }
        setShowMenu(false);
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
                "group relative bg-card border border-border rounded-xl p-4 cursor-grab active:cursor-grabbing",
                "hover:border-border/80 hover:shadow-lg transition-all duration-200",
                isDragging && "opacity-50 scale-105 shadow-2xl z-50"
            )}
            {...attributes}
            {...listeners}
        >
            {/* Quick actions menu */}
            <div className="absolute top-3 right-3 z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all"
                >
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>

                {showMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowMenu(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 top-8 w-40 bg-card border border-border rounded-lg shadow-xl z-20 overflow-hidden"
                        >
                            <button
                                onClick={() => handleQuickAction("offer")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-emerald-500/10 text-emerald-400 transition-colors"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Got Offer
                            </button>
                            <button
                                onClick={() => handleQuickAction("rejected")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-500/10 text-red-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Rejected
                            </button>
                            <button
                                onClick={() => handleQuickAction("ghosted")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-500/10 text-gray-400 transition-colors"
                            >
                                <Ghost className="w-4 h-4" />
                                Ghosted
                            </button>
                            <div className="border-t border-border" />
                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-500/10 text-red-400 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </motion.div>
                    </>
                )}
            </div>

            <Link href={`/app/${application.id}`} className="block">
                {/* Header with logo and company */}
                <div className="flex items-start gap-3 mb-3">
                    <div className="relative w-10 h-10 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                        {!imageError ? (
                            <Image
                                src={getCompanyLogo(application.company)}
                                alt={application.company}
                                fill
                                className="object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                                {application.company.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                        <h3 className="font-semibold text-sm truncate">{application.company}</h3>
                        <p className="text-xs text-muted-foreground truncate">{application.role}</p>
                    </div>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    {application.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {application.location}
                        </span>
                    )}
                    {application.url && (
                        <a
                            href={application.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" />
                            View
                        </a>
                    )}
                </div>

                {/* Footer with platform and days */}
                <div className="flex items-center justify-between">
                    <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium border",
                        getStatusColorClass(application.status)
                    )}>
                        {platformConfig.label}
                    </span>

                    <span className={cn(
                        "flex items-center gap-1 text-xs",
                        daysInStage > 7 ? "text-amber-400" : "text-muted-foreground"
                    )}>
                        <Clock className="w-3 h-3" />
                        {daysInStage}d in stage
                    </span>
                </div>

                {/* Priority indicator */}
                {application.priority === "high" && (
                    <div className="absolute top-0 left-4 w-8 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-b" />
                )}
            </Link>
        </motion.div>
    );
}

// Compact version for lists
export function ApplicationCardCompact({ application }: { application: Application }) {
    const [imageError, setImageError] = useState(false);
    const daysInStage = getDaysInStage(application);

    return (
        <Link
            href={`/app/${application.id}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-border/80 hover:shadow-md transition-all"
        >
            <div className="relative w-8 h-8 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                {!imageError ? (
                    <Image
                        src={getCompanyLogo(application.company)}
                        alt={application.company}
                        fill
                        className="object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {application.company.charAt(0)}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{application.company}</p>
                <p className="text-xs text-muted-foreground truncate">{application.role}</p>
            </div>

            <div className="flex items-center gap-2">
                <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium border",
                    getStatusColorClass(application.status)
                )}>
                    {STATUS_CONFIG[application.status].label}
                </span>
                <span className="text-xs text-muted-foreground">{daysInStage}d</span>
            </div>
        </Link>
    );
}

