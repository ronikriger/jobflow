"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, getSettings, getUserProgress, addXP, checkAndAwardBadge, updateStreak } from "./db";
import type { Application, ApplicationEvent, Contact, Settings, UserProgress, ApplicationStatus, BadgeType } from "./types";
import { getNextActions, isStale } from "./utils";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

// Hook to get all applications
export function useApplications() {
    return useLiveQuery(() =>
        db.applications.orderBy("updatedAt").reverse().toArray()
        , []);
}

// Hook to get active applications (not archived)
export function useActiveApplications() {
    return useLiveQuery(() =>
        db.applications
            .filter(app => !app.archived)
            .toArray()
        , []);
}

// Hook to get a single application with related data
export function useApplication(id: number) {
    const application = useLiveQuery(() =>
        db.applications.get(id)
        , [id]);

    const events = useLiveQuery(() =>
        db.events.where("applicationId").equals(id).toArray()
        , [id]);

    const contacts = useLiveQuery(() =>
        db.contacts.where("applicationId").equals(id).toArray()
        , [id]);

    const reminders = useLiveQuery(() =>
        db.reminders.where("applicationId").equals(id).toArray()
        , [id]);

    return { application, events, contacts, reminders };
}

// Hook to get applications by status
export function useApplicationsByStatus(status: ApplicationStatus) {
    return useLiveQuery(() =>
        db.applications
            .where("status")
            .equals(status)
            .filter(app => !app.archived)
            .toArray()
        , [status]);
}

// Hook to get settings
export function useSettings() {
    return useLiveQuery(() => getSettings(), []);
}

// Hook to get user progress
export function useUserProgress() {
    return useLiveQuery(() => getUserProgress(), []);
}

// Hook to get stale applications
export function useStaleApplications() {
    const apps = useActiveApplications();
    const settings = useSettings();

    if (!apps || !settings) return [];

    return apps.filter(app => isStale(app, settings.followUpDays));
}

// Hook to get next actions
export function useNextActions() {
    const apps = useActiveApplications();
    const settings = useSettings();

    if (!apps || !settings) return [];

    return getNextActions(apps, settings);
}

// Hook to get weekly stats
export function useWeeklyStats() {
    const apps = useApplications();
    const settings = useSettings();

    if (!apps || !settings) return { applied: 0, goal: 8, percentage: 0 };

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const thisWeekApps = apps.filter(app => {
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
    const apps = useApplications();
    const settings = useSettings();

    if (!apps || !settings) return { applied: 0, goal: 2, percentage: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayApps = apps.filter(app => {
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

// Actions

// Add a new application
export async function addApplication(data: Omit<Application, "id" | "createdAt" | "updatedAt" | "lastTouchAt">) {
    const now = new Date();
    const app: Omit<Application, "id"> = {
        ...data,
        createdAt: now,
        updatedAt: now,
        lastTouchAt: now,
        appliedAt: data.status !== "saved" ? now : undefined,
    };

    const id = await db.applications.add(app) as number;

    // Add XP for applying
    if (data.status !== "saved") {
        await addXP(10);
        await updateStreak();

        // Check for badges
        const progress = await getUserProgress();
        if (progress.totalApplications === 0) {
            await checkAndAwardBadge("first-application" as BadgeType);
        }

        const totalApps = await db.applications.count();
        if (totalApps >= 10) await checkAndAwardBadge("ten-apps" as BadgeType);
        if (totalApps >= 50) await checkAndAwardBadge("fifty-apps" as BadgeType);
        if (totalApps >= 100) await checkAndAwardBadge("hundred-apps" as BadgeType);

        // Update total applications
        await db.userProgress.update(progress.id!, {
            totalApplications: progress.totalApplications + 1,
            updatedAt: now,
        });
    }

    // Add initial event
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

// Update application status
export async function updateApplicationStatus(id: number, newStatus: ApplicationStatus) {
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

    // Add status change event
    await db.events.add({
        applicationId: id,
        type: "status-change",
        title: `Moved to ${newStatus}`,
        date: now,
        createdAt: now,
        completed: true,
    });

    // XP and badge logic
    if (oldStatus === "saved" && newStatus !== "saved") {
        await addXP(10);
        await updateStreak();
    }

    if (["screen", "interview1", "interview2", "final"].includes(newStatus)) {
        await addXP(25);

        const progress = await getUserProgress();
        if (progress.totalInterviews === 0) {
            await checkAndAwardBadge("first-interview" as BadgeType);
        }

        await db.userProgress.update(progress.id!, {
            totalInterviews: progress.totalInterviews + 1,
            updatedAt: now,
        });
    }

    if (newStatus === "offer") {
        await addXP(100);

        const progress = await getUserProgress();
        await checkAndAwardBadge("first-offer" as BadgeType);

        await db.userProgress.update(progress.id!, {
            totalOffers: progress.totalOffers + 1,
            updatedAt: now,
        });
    }
}

// Update application
export async function updateApplication(id: number, data: Partial<Application>) {
    const now = new Date();
    await db.applications.update(id, {
        ...data,
        updatedAt: now,
        lastTouchAt: now,
    });
}

// Delete application
export async function deleteApplication(id: number) {
    await db.applications.delete(id);
    await db.events.where("applicationId").equals(id).delete();
    await db.contacts.where("applicationId").equals(id).delete();
    await db.reminders.where("applicationId").equals(id).delete();
}

// Add event
export async function addEvent(data: Omit<ApplicationEvent, "id" | "createdAt">) {
    const now = new Date();
    await db.events.add({
        ...data,
        createdAt: now,
    });

    // Update application last touch
    await db.applications.update(data.applicationId, {
        lastTouchAt: now,
        updatedAt: now,
    });

    // Add XP for follow-ups
    if (data.type === "follow-up") {
        await addXP(15);

        const progress = await getUserProgress();
        if (progress.totalFollowUps >= 9) {
            await checkAndAwardBadge("follow-up-pro" as BadgeType);
        }

        await db.userProgress.update(progress.id!, {
            totalFollowUps: progress.totalFollowUps + 1,
            updatedAt: now,
        });
    }
}

// Add contact
export async function addContact(data: Omit<Contact, "id" | "createdAt">) {
    const now = new Date();
    await db.contacts.add({
        ...data,
        createdAt: now,
    });

    // Check for networker badge
    const totalContacts = await db.contacts.count();
    if (totalContacts >= 10) {
        await checkAndAwardBadge("networker" as BadgeType);
    }
}

// Update settings
export async function updateSettings(data: Partial<Settings>) {
    const settings = await getSettings();
    await db.settings.update(settings.id!, {
        ...data,
        updatedAt: new Date(),
    });
}

// Mark follow-up as sent
export async function markFollowUpSent(applicationId: number) {
    const now = new Date();

    await db.events.add({
        applicationId,
        type: "follow-up",
        title: "Follow-up sent",
        date: now,
        createdAt: now,
        completed: true,
    });

    await db.applications.update(applicationId, {
        lastTouchAt: now,
        updatedAt: now,
    });

    await addXP(15);
    await updateStreak();
}

// Mark interview prep as done (adds a note event and XP)
export async function markPrepDone(applicationId: number) {
    const now = new Date();

    await db.events.add({
        applicationId,
        type: "note",
        title: "Prepared for interview",
        date: now,
        createdAt: now,
        completed: true,
    });

    await db.applications.update(applicationId, {
        lastTouchAt: now,
        updatedAt: now,
    });

    await addXP(5);
    await updateStreak();
}

