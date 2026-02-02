"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getSubscriptionStatus } from "@/lib/actions";
import { useUser } from "@stackframe/stack";

export type SubscriptionStatus = {
    tier: "free" | "pro";
    appCount: number;
    limit: number;
    canAddMore: boolean;
};

type SubscriptionContextType = {
    subscription: SubscriptionStatus | null;
    loading: boolean;
    isPro: boolean;
    refresh: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

// Cache subscription status in memory
const subscriptionCache: {
    data: SubscriptionStatus | null;
    timestamp: number;
    userId: string | null;
} = {
    data: null,
    timestamp: 0,
    userId: null
};
const CACHE_TTL = 60000; // 1 minute cache (subscription doesn't change often)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const user = useUser();
    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(() => {
        // Initialize from cache if valid and same user
        if (subscriptionCache.data &&
            subscriptionCache.userId === user?.id &&
            Date.now() - subscriptionCache.timestamp < CACHE_TTL) {
            return subscriptionCache.data;
        }
        return null;
    });
    const [loading, setLoading] = useState(!subscriptionCache.data);

    const refresh = useCallback(async () => {
        if (!user) {
            setSubscription({ tier: "free", appCount: 0, limit: 20, canAddMore: true });
            setLoading(false);
            return;
        }

        // Check cache validity
        const now = Date.now();
        if (subscriptionCache.data &&
            subscriptionCache.userId === user.id &&
            now - subscriptionCache.timestamp < CACHE_TTL) {
            setSubscription(subscriptionCache.data);
            setLoading(false);
            return;
        }

        try {
            const status = await getSubscriptionStatus();
            subscriptionCache.data = status;
            subscriptionCache.timestamp = now;
            subscriptionCache.userId = user.id;
            setSubscription(status);
        } catch (error) {
            console.error("Failed to fetch subscription status:", error);
            // Fallback to free tier on error
            setSubscription({ tier: "free", appCount: 0, limit: 20, canAddMore: true });
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // Clear cache on user change
    useEffect(() => {
        if (subscriptionCache.userId !== user?.id) {
            subscriptionCache.data = null;
            subscriptionCache.timestamp = 0;
            subscriptionCache.userId = user?.id ?? null;
        }
    }, [user?.id]);

    return (
        <SubscriptionContext.Provider
            value={{
                subscription,
                loading,
                isPro: subscription?.tier === "pro",
                refresh
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error("useSubscription must be used within a SubscriptionProvider");
    }
    return context;
}

// Utility to invalidate the cache (call after upgrade/purchase)
export function invalidateSubscriptionCache() {
    subscriptionCache.data = null;
    subscriptionCache.timestamp = 0;
}
