"use client";

import { useEffect, useState } from "react";
import { initializeDefaults } from "@/lib/db";

export function Providers({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await initializeDefaults();
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize database:", error);
        // Still set ready to true to show the app
        setIsReady(true);
      }
    }
    init();
  }, []);

  if (!isReady) {
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

  return <>{children}</>;
}
