"use client";

import { useEffect, useState } from "react";
import { initializeDefaults } from "@/lib/db";

export function Providers({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function init() {
            await initializeDefaults();
            // No demo data - users start fresh and their data persists in IndexedDB
            setIsReady(true);
        }
        init();
    }, []);

    if (!isReady) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-white font-semibold text-lg">JobFlow</h2>
                        <p className="text-zinc-500 text-sm mt-1">Loading your workspace...</p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
