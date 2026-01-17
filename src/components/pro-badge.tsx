"use client";

import { Crown, Sparkles } from "lucide-react";

interface ProBadgeProps {
    size?: "sm" | "md" | "lg";
    showText?: boolean;
}

export function ProBadge({ size = "md", showText = true }: ProBadgeProps) {
    const sizeClasses = {
        sm: "text-xs px-2 py-0.5 gap-1",
        md: "text-sm px-3 py-1 gap-1.5",
        lg: "text-base px-4 py-1.5 gap-2"
    };

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5"
    };

    return (
        <div
            className={`inline-flex items-center rounded-full font-semibold ${sizeClasses[size]}`}
            style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%)",
                color: "white",
                boxShadow: "0 2px 8px rgba(139, 92, 246, 0.4)"
            }}
        >
            <Crown className={iconSizes[size]} />
            {showText && <span>PRO</span>}
        </div>
    );
}

export function ProBadgeAnimated({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "text-xs px-2 py-0.5 gap-1",
        md: "text-sm px-3 py-1 gap-1.5",
        lg: "text-base px-4 py-1.5 gap-2"
    };

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5"
    };

    return (
        <div
            className={`inline-flex items-center rounded-full font-semibold animate-pulse ${sizeClasses[size]}`}
            style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%)",
                color: "white",
                boxShadow: "0 2px 12px rgba(139, 92, 246, 0.5)"
            }}
        >
            <Sparkles className={iconSizes[size]} />
            <span>PRO</span>
        </div>
    );
}

export function UpgradeToPro({ onClick }: { onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                color: "#a78bfa"
            }}
        >
            <Crown className="w-4 h-4" />
            <span>Upgrade to Pro</span>
        </button>
    );
}
