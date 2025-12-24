"use client";

import { useEffect, useState } from "react";
import { initializeDefaults, seedDemoData } from "@/lib/db";

export function Providers({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function init() {
            await initializeDefaults();
            await seedDemoData();
            setIsReady(true);
        }
        init();
    }, []);

    if (!isReady) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground text-sm">Loading JobFlow...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

