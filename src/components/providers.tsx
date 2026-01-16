"use client";

import { useEffect, useState } from "react";
import { initializeDefaults } from "@/lib/db";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
    const [isDbReady, setIsDbReady] = useState(false);

    useEffect(() => {
        async function init() {
            try {
                // Initialize local DB for fallback/migration
                await initializeDefaults();
                setIsDbReady(true);
            } catch (error) {
                console.error("Failed to initialize database:", error);
                setIsDbReady(true);
            }
        }
        init();
    }, []);

    if (!isDbReady) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: '#09090b' }}
            >
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div
                            className="w-16 h-16 rounded-full"
                            style={{ border: '4px solid rgba(59, 130, 246, 0.2)' }}
                        />
                        <div
                            className="absolute inset-0 w-16 h-16 rounded-full animate-spin"
                            style={{ border: '4px solid transparent', borderTopColor: '#3b82f6' }}
                        />
                    </div>
                    <div className="text-center">
                        <h2 className="font-semibold text-lg" style={{ color: 'white' }}>JobFlow</h2>
                        <p className="text-sm mt-1" style={{ color: '#71717a' }}>Loading your workspace...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
            {children}
        </ThemeProvider>
    );
}

