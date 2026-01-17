"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, getSettings, getUserProgress, addXP, updateStreak } from "./db";
import type { Application, ApplicationEvent, Contact, Settings, UserProgress, ApplicationStatus } from "./types";
import { getNextActions, isStale } from "./utils";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { useUser } from "@stackframe/stack";
import { useEffect, useState, useCallback, useRef } from "react";
import * as serverActions from "./actions";

// Simple in-memory cache for server data
const appCache: { data: Application[] | null; timestamp: number } = { data: null, timestamp: 0 };
const CACHE_TTL = 30000; // 30 seconds cache

// Hook to get all applications - hybrid with caching and optimistic updates
export function useApplications() {
    const user = useUser();
    const [serverApps, setServerApps] = useState<Application[]>(() => appCache.data ?? []);
    const [loading, setLoading] = useState(!appCache.data);
    const fetchingRef = useRef(false);

    const localApps = useLiveQuery(() =>
        db.applications.orderBy("updatedAt").reverse().toArray()
        , []);

    // Optimistic update function - updates local state immediately
    const optimisticUpdate = useCallback((updater: (apps: Application[]) => Application[]) => {
        setServerApps(prev => {
            const updated = updater(prev);
            appCache.data = updated;
            return updated;
        });
    }, []);

    const refresh = useCallback(async (force = false) => {
        if (!user || fetchingRef.current) return;

        // Check cache validity
        const now = Date.now();
        if (!force && appCache.data && (now - appCache.timestamp) < CACHE_TTL) {
            setServerApps(appCache.data);
            return;
        }

        fetchingRef.current = true;
        try {
            const apps = await serverActions.getApplications();
            appCache.data = apps;
            appCache.timestamp = now;
            setServerApps(apps);
        } finally {
            fetchingRef.current = false;
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            refresh();
        } else {
            setLoading(false);
        }
    }, [user, refresh]);

    // Return server data for authenticated users, local for guests
    if (user) {
        return { apps: serverApps, loading, refresh, optimisticUpdate };
    }
    return { apps: localApps ?? [], loading: false, refresh: async () => { }, optimisticUpdate: () => { } };
}

// Hook to get active applications (not archived)
export function useActiveApplications() {
    const { apps, loading, refresh, optimisticUpdate } = useApplications();
    const filtered = apps.filter((app: Application) => !app.archived);
    return { apps: filtered, loading, refresh, optimisticUpdate };
}

// Hook to get a single application with related data
export function useApplication(id: string | number) {
    const user = useUser();
    const [serverData, setServerData] = useState<{
        application: Application | null | undefined;
        events: ApplicationEvent[];
        contacts: Contact[];
        reminders: any[];
    } | null>(null);

    useEffect(() => {
        if (user && typeof id === 'string') {
            Promise.all([
                serverActions.getApplication(id),
                serverActions.getApplicationEvents(id),
                serverActions.getApplicationContacts(id)
            ]).then(([app, events, contacts]) => {
                setServerData({
                    application: app,
                    events: events,
                    contacts: contacts,
                    reminders: []
                });
            });
        }
    }, [user, id]);

    const localApp = useLiveQuery(() =>
        typeof id === 'number' ? db.applications.get(id) : undefined
        , [id]);

    const localEvents = useLiveQuery(() =>
        typeof id === 'number' ? db.events.where("applicationId").equals(id).toArray() : []
        , [id]);

    const localContacts = useLiveQuery(() =>
        typeof id === 'number' ? db.contacts.where("applicationId").equals(id).toArray() : []
        , [id]);

    const localReminders = useLiveQuery(() =>
        typeof id === 'number' ? db.reminders.where("applicationId").equals(id).toArray() : []
        , [id]);

    if (user && typeof id === 'string') {
        return serverData ?? {
            application: undefined,
            events: [],
            contacts: [],
            reminders: []
        };
    }

    return {
        application: localApp,
        events: localEvents ?? [],
        contacts: localContacts ?? [],
        reminders: localReminders ?? []
    };
}

// Hook to get applications by status
export function useApplicationsByStatus(status: ApplicationStatus) {
    const { apps, loading, refresh } = useActiveApplications();
    const filtered = apps.filter((app: Application) => app.status === status);
    return { apps: filtered, loading, refresh };
}

// Hook to get settings
export function useSettings() {
    const user = useUser();
    const [serverSettings, setServerSettings] = useState<Settings | null>(null);

    useEffect(() => {
        if (user) {
            serverActions.getUserSettingsFromDB().then(setServerSettings);
        }
    }, [user]);

    const localSettings = useLiveQuery(() => getSettings());

    const defaults: Settings = {
        id: "default",
        weeklyGoal: 8,
        dailyGoal: 2,
        followUpDays: 7,
        interviewFollowUpDays: 2,
        ghostedDays: 21,
        streakGraceDays: 2,
        darkMode: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    if (user) {
        return serverSettings ?? defaults;
    }

    return localSettings ?? defaults;
}

// Hook to get user progress
export function useUserProgress() {
    const user = useUser();
    const [serverProgress, setServerProgress] = useState<UserProgress | null>(null);

    useEffect(() => {
        if (user) {
            serverActions.getUserProgressFromDB().then(setServerProgress);
        }
    }, [user]);

    const localProgress = useLiveQuery(() => getUserProgress(), []);

    const defaults = {
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date(),
        streakGraceUsed: false,
        totalApplications: 0,
        totalInterviews: 0,
        totalOffers: 0,
        totalFollowUps: 0,
        badges: [],
        milestones: [],
        weeklyStats: [],
        createdAt: new Date(),
        updatedAt: new Date()
    } as UserProgress;

    if (user) {
        return serverProgress ?? defaults;
    }

    return localProgress ?? defaults;
}

// Hook to get stale applications
export function useStaleApplications() {
    const { apps } = useActiveApplications();
    const settings = useSettings();

    if (!apps || !settings) return [];

    return apps.filter((app: Application) => isStale(app, settings.followUpDays));
}

// Hook to get next actions
export function useNextActions() {
    const { apps } = useActiveApplications();
    const settings = useSettings();

    if (!apps || !settings) return [];

    return getNextActions(apps, settings);
}

// Hook to get weekly stats
export function useWeeklyStats() {
    const { apps } = useApplications();
    const settings = useSettings();

    if (!apps || !settings) return { applied: 0, goal: 8, percentage: 0 };

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const thisWeekApps = apps.filter((app: Application) => {
        if (!app.appliedAt) return false;
        const appliedDate = new Date(app.appliedAt);
        return isWithinInterval(appliedDate, { start: weekStart, end: weekEnd });
    });

    const applied = thisWeekApps.length;
    const goal = settings.weeklyGoal;
    const percentage = Math.min(100, Math.round((applied / goal) * 100));

    return { applied, goal, percentage };
}

// Hook to get daily stats
export function useDailyStats() {
    const { apps } = useApplications();
    const settings = useSettings();

    if (!apps || !settings) return { applied: 0, goal: 2, percentage: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayApps = apps.filter((app: Application) => {
        if (!app.appliedAt) return false;
        const appliedDate = new Date(app.appliedAt);
        appliedDate.setHours(0, 0, 0, 0);
        return appliedDate.getTime() === today.getTime();
    });

    const applied = todayApps.length;
    const goal = settings.dailyGoal;
    const percentage = Math.min(100, Math.round((applied / goal) * 100));

    return { applied, goal, percentage };
}

// --- Hybrid Action Functions with Optimistic Updates ---
// These update local state immediately, then sync with server

export async function addApplication(
    data: Omit<Application, "id" | "createdAt" | "updatedAt" | "lastTouchAt">,
    isAuthenticated: boolean = false,
    optimisticUpdate?: (updater: (apps: Application[]) => Application[]) => void
) {
    const now = new Date();
    const tempId = `temp-${Date.now()}`;

    // Create optimistic application
    const optimisticApp: Application = {
        id: tempId,
        ...data,
        createdAt: now,
        updatedAt: now,
        lastTouchAt: now,
        appliedAt: data.status !== "saved" ? now : undefined,
    };

    // Update UI immediately
    if (optimisticUpdate) {
        optimisticUpdate(apps => [optimisticApp, ...apps]);
    }

    if (isAuthenticated) {
        try {
            const result = await serverActions.createApplication({
                ...data,
                lastTouchAt: now,
            });

            // Replace temp with real data
            if (optimisticUpdate) {
                optimisticUpdate(apps =>
                    apps.map(app => app.id === tempId ? { ...optimisticApp, id: result.id } : app)
                );
            }
            appCache.timestamp = 0; // Invalidate cache
            return result.id;
        } catch (error) {
            console.error("Failed to save to server:", error);
            // Remove optimistic update on error
            if (optimisticUpdate) {
                optimisticUpdate(apps => apps.filter(app => app.id !== tempId));
            }
            throw error;
        }
    }

    // Local storage for guests
    const app: Omit<Application, "id"> = {
        ...data,
        createdAt: now,
        updatedAt: now,
        lastTouchAt: now,
        appliedAt: data.status !== "saved" ? now : undefined,
    };
    const id = await db.applications.add(app) as number;

    if (data.status !== "saved") {
        await addXP(10);
        await updateStreak();
    }
    await db.events.add({
        applicationId: id,
        type: data.status === "saved" ? "note" : "applied",
        title: data.status === "saved" ? `Saved ${data.company}` : `Applied to ${data.company}`,
        date: now,
        createdAt: now,
        completed: true,
    });
    return id;
}

export async function updateApplicationStatus(
    id: string | number,
    newStatus: ApplicationStatus,
    isAuthenticated: boolean = false,
    optimisticUpdate?: (updater: (apps: Application[]) => Application[]) => void
) {
    // Optimistic update
    if (optimisticUpdate) {
        optimisticUpdate(apps =>
            apps.map(app => app.id === id ? { ...app, status: newStatus, updatedAt: new Date() } : app)
        );
    }

    if (isAuthenticated && typeof id === 'string') {
        try {
            await serverActions.updateApplication(id, { status: newStatus });
            appCache.timestamp = 0; // Invalidate cache
            return;
        } catch (error) {
            console.error("Failed to update on server:", error);
            // Could revert optimistic update here
        }
    }

    if (typeof id === 'number') {
        const now = new Date();
        const app = await db.applications.get(id);
        if (!app) return;
        const oldStatus = app.status;
        await db.applications.update(id, {
            status: newStatus,
            updatedAt: now,
            lastTouchAt: now,
            appliedAt: oldStatus === "saved" && newStatus !== "saved" ? now : app.appliedAt,
        });
        await db.events.add({
            applicationId: id,
            type: "status-change",
            title: `Moved to ${newStatus}`,
            date: now,
            createdAt: now,
            completed: true,
        });
        if (oldStatus === "saved" && newStatus !== "saved") {
            await addXP(10);
            await updateStreak();
        }
    }
}

export async function updateApplication(
    id: string | number,
    data: Partial<Application>,
    isAuthenticated: boolean = false,
    optimisticUpdate?: (updater: (apps: Application[]) => Application[]) => void
) {
    // Optimistic update
    if (optimisticUpdate) {
        optimisticUpdate(apps =>
            apps.map(app => app.id === id ? { ...app, ...data, updatedAt: new Date() } : app)
        );
    }

    if (isAuthenticated && typeof id === 'string') {
        try {
            await serverActions.updateApplication(id, data);
            appCache.timestamp = 0;
            return;
        } catch (error) {
            console.error("Failed to update on server:", error);
        }
    }

    if (typeof id === 'number') {
        const now = new Date();
        await db.applications.update(id, {
            ...data,
            updatedAt: now,
            lastTouchAt: now,
        });
    }
}

export async function deleteApplication(
    id: string | number,
    isAuthenticated: boolean = false,
    optimisticUpdate?: (updater: (apps: Application[]) => Application[]) => void
) {
    // Optimistic update - remove immediately
    if (optimisticUpdate) {
        optimisticUpdate(apps => apps.filter(app => app.id !== id));
    }

    if (isAuthenticated && typeof id === 'string') {
        try {
            await serverActions.deleteApplication(id);
            appCache.timestamp = 0;
            return;
        } catch (error) {
            console.error("Failed to delete on server:", error);
        }
    }

    if (typeof id === 'number') {
        await db.applications.delete(id);
        await db.events.where("applicationId").equals(id).delete();
        await db.contacts.where("applicationId").equals(id).delete();
        await db.reminders.where("applicationId").equals(id).delete();
    }
}

export async function addEvent(
    data: Omit<ApplicationEvent, "id" | "createdAt"> & { applicationId: string | number },
    isAuthenticated: boolean = false
) {
    if (isAuthenticated && typeof data.applicationId === 'string') {
        const { applicationId, ...eventData } = data;
        try {
            await serverActions.createApplicationEvent(applicationId, eventData);
            return;
        } catch (error) {
            console.error("Failed to add event on server:", error);
        }
    }

    if (typeof data.applicationId === 'number') {
        const now = new Date();
        await db.events.add({ ...data, createdAt: now });
        await db.applications.update(data.applicationId, { lastTouchAt: now, updatedAt: now });
        if (data.type === "follow-up") await addXP(15);
    }
}

export async function addContact(
    data: Omit<Contact, "id" | "createdAt"> & { applicationId: string | number },
    isAuthenticated: boolean = false
) {
    if (isAuthenticated && typeof data.applicationId === 'string') {
        const { applicationId, ...contactData } = data;
        try {
            await serverActions.createContact(applicationId, contactData);
            return;
        } catch (error) {
            console.error("Failed to add contact on server:", error);
        }
    }

    if (typeof data.applicationId === 'number') {
        const now = new Date();
        await db.contacts.add({ ...data, createdAt: now });
    }
}

export async function updateSettings(data: Partial<Settings>, isAuthenticated: boolean = false) {
    if (isAuthenticated) {
        try {
            await serverActions.updateUserSettings(data);
            return;
        } catch (error) {
            console.error("Failed to update settings on server:", error);
        }
    }

    const settings = await getSettings();
    if (settings && settings.id) {
        await db.settings.update(settings.id, {
            ...data,
            updatedAt: new Date(),
        });
    }
}

export async function markFollowUpSent(applicationId: string | number, isAuthenticated: boolean = false) {
    if (isAuthenticated && typeof applicationId === 'string') {
        try {
            await serverActions.createApplicationEvent(applicationId, {
                type: "follow-up",
                title: "Follow-up sent",
                date: new Date(),
                completed: true
            });
            return;
        } catch (error) {
            console.error("Failed to mark follow-up on server:", error);
        }
    }

    if (typeof applicationId === 'number') {
        const now = new Date();
        await db.events.add({
            applicationId,
            type: "follow-up",
            title: "Follow-up sent",
            date: now,
            createdAt: now,
            completed: true,
        });
        await db.applications.update(applicationId, { lastTouchAt: now, updatedAt: now });
        await addXP(15);
        await updateStreak();
    }
}

export async function markPrepDone(applicationId: string | number, isAuthenticated: boolean = false) {
    if (isAuthenticated && typeof applicationId === 'string') {
        try {
            await serverActions.createApplicationEvent(applicationId, {
                type: "note",
                title: "Prepared for interview",
                date: new Date(),
                completed: true
            });
            return;
        } catch (error) {
            console.error("Failed to mark prep done on server:", error);
        }
    }

    if (typeof applicationId === 'number') {
        const now = new Date();
        await db.events.add({
            applicationId,
            type: "note",
            title: "Prepared for interview",
            date: now,
            createdAt: now,
            completed: true,
        });
        await db.applications.update(applicationId, { lastTouchAt: now, updatedAt: now });
        await addXP(5);
        await updateStreak();
    }
}
