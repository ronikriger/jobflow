"use server";

import { prisma } from "./prisma";
import { stackServerApp } from "@/stack/server";
import type { Application, ApplicationEvent, Contact, UserProgress, Settings } from "./types";

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
    const user = await stackServerApp.getUser();
    return user?.id ?? null;
}

// Helper to ensure user is authenticated
async function requireAuth(): Promise<string> {
    const userId = await getCurrentUserId();
    if (!userId) {
        throw new Error("Authentication required");
    }
    return userId;
}

// ============ APPLICATIONS ============

export async function getApplications(): Promise<Application[]> {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const apps = await prisma.application.findMany({
        where: { userId },
        include: {
            events: true,
            contacts: true,
        },
        orderBy: { updatedAt: "desc" },
    });

    return apps.map((app: typeof apps[number]) => ({
        id: app.id,
        company: app.company,
        role: app.role,
        location: app.location ?? undefined,
        salary: app.salary ?? undefined,
        url: app.url ?? undefined,
        platform: app.platform as Application["platform"],
        status: app.status as Application["status"],
        priority: (app.priority as Application["priority"]) ?? "medium",
        notes: app.notes ?? undefined,
        appliedAt: app.appliedAt ?? undefined,
        lastTouchAt: app.lastTouchAt,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
    }));
}

export async function getApplication(id: string): Promise<Application | null> {
    const userId = await requireAuth();

    const app = await prisma.application.findFirst({
        where: { id, userId },
    });

    if (!app) return null;

    return {
        id: app.id,
        company: app.company,
        role: app.role,
        location: app.location ?? undefined,
        salary: app.salary ?? undefined,
        url: app.url ?? undefined,
        platform: app.platform as Application["platform"],
        status: app.status as Application["status"],
        priority: (app.priority as Application["priority"]) ?? "medium",
        notes: app.notes ?? undefined,
        appliedAt: app.appliedAt ?? undefined,
        lastTouchAt: app.lastTouchAt,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
    };
}

// Migrate guest data when user logs in
export async function migrateGuestData(
    applications: Omit<Application, "id" | "createdAt" | "updatedAt">[]
): Promise<{ migrated: number }> {
    const userId = await requireAuth();

    if (applications.length === 0) {
        return { migrated: 0 };
    }

    // Create all applications in a transaction
    const result = await prisma.$transaction(
        applications.map((data) =>
            prisma.application.create({
                data: {
                    userId,
                    company: data.company,
                    role: data.role,
                    location: data.location,
                    salary: data.salary,
                    url: data.url,
                    platform: data.platform,
                    status: data.status,
                    priority: data.priority ?? "medium",
                    notes: data.notes,
                    appliedAt: data.appliedAt,
                    lastTouchAt: data.lastTouchAt ?? new Date(),
                },
            })
        )
    );

    // Update user progress for each application
    for (let i = 0; i < result.length; i++) {
        await updateProgressStats("application");
    }

    return { migrated: result.length };
}

export async function createApplication(
    data: Omit<Application, "id" | "createdAt" | "updatedAt">
): Promise<Application> {
    const userId = await requireAuth();

    const app = await prisma.application.create({
        data: {
            userId,
            company: data.company,
            role: data.role,
            location: data.location,
            salary: data.salary,
            url: data.url,
            platform: data.platform,
            status: data.status,
            priority: data.priority ?? "medium",
            notes: data.notes,
            appliedAt: data.appliedAt,
            lastTouchAt: data.lastTouchAt ?? new Date(),
        },
    });

    // Update user progress
    await updateProgressStats("application");

    return {
        id: app.id,
        company: app.company,
        role: app.role,
        location: app.location ?? undefined,
        salary: app.salary ?? undefined,
        url: app.url ?? undefined,
        platform: app.platform as Application["platform"],
        status: app.status as Application["status"],
        priority: (app.priority as Application["priority"]) ?? "medium",
        notes: app.notes ?? undefined,
        appliedAt: app.appliedAt ?? undefined,
        lastTouchAt: app.lastTouchAt,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
    };
}

export async function updateApplication(
    id: string,
    data: Partial<Omit<Application, "id" | "createdAt" | "updatedAt">>
): Promise<Application | null> {
    const userId = await requireAuth();

    // Verify ownership
    const existing = await prisma.application.findFirst({
        where: { id, userId },
    });

    if (!existing) return null;

    const app = await prisma.application.update({
        where: { id },
        data: {
            company: data.company,
            role: data.role,
            location: data.location,
            salary: data.salary,
            url: data.url,
            platform: data.platform,
            status: data.status,
            priority: data.priority,
            notes: data.notes,
            appliedAt: data.appliedAt,
            lastTouchAt: data.lastTouchAt ?? new Date(),
        },
    });

    // Check for status changes that affect progress
    if (data.status && data.status !== existing.status) {
        if (data.status === "offer") {
            await updateProgressStats("offer");
        } else if (["interview1", "interview2", "final"].includes(data.status)) {
            await updateProgressStats("interview");
        }
    }

    return {
        id: app.id,
        company: app.company,
        role: app.role,
        location: app.location ?? undefined,
        salary: app.salary ?? undefined,
        url: app.url ?? undefined,
        platform: app.platform as Application["platform"],
        status: app.status as Application["status"],
        priority: (app.priority as Application["priority"]) ?? "medium",
        notes: app.notes ?? undefined,
        appliedAt: app.appliedAt ?? undefined,
        lastTouchAt: app.lastTouchAt,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
    };
}

export async function deleteApplication(id: string): Promise<boolean> {
    const userId = await requireAuth();

    // Verify ownership
    const existing = await prisma.application.findFirst({
        where: { id, userId },
    });

    if (!existing) return false;

    await prisma.application.delete({ where: { id } });
    return true;
}

// ============ EVENTS ============

export async function getApplicationEvents(applicationId: string): Promise<ApplicationEvent[]> {
    const userId = await requireAuth();

    // Verify ownership of the application
    const app = await prisma.application.findFirst({
        where: { id: applicationId, userId },
    });

    if (!app) return [];

    const events = await prisma.applicationEvent.findMany({
        where: { applicationId },
        orderBy: { date: "desc" },
    });

    return events.map((event: typeof events[number]) => ({
        id: event.id,
        applicationId: event.applicationId,
        type: event.type as ApplicationEvent["type"],
        title: event.title,
        description: event.description ?? undefined,
        date: event.date,
        completed: event.completed,
        scheduledAt: event.scheduledAt ?? undefined,
        createdAt: event.createdAt,
    }));
}

export async function createApplicationEvent(
    applicationId: string,
    data: Omit<ApplicationEvent, "id" | "applicationId" | "createdAt">
): Promise<ApplicationEvent | null> {
    const userId = await requireAuth();

    // Verify ownership
    const app = await prisma.application.findFirst({
        where: { id: applicationId, userId },
    });

    if (!app) return null;

    const event = await prisma.applicationEvent.create({
        data: {
            applicationId,
            type: data.type,
            title: data.title,
            description: data.description,
            date: data.date,
            completed: data.completed ?? false,
            scheduledAt: data.scheduledAt,
        },
    });

    // Update lastTouchAt on application
    await prisma.application.update({
        where: { id: applicationId },
        data: { lastTouchAt: new Date() },
    });

    return {
        id: event.id,
        applicationId: event.applicationId,
        type: event.type as ApplicationEvent["type"],
        title: event.title,
        description: event.description ?? undefined,
        date: event.date,
        completed: event.completed,
        scheduledAt: event.scheduledAt ?? undefined,
        createdAt: event.createdAt,
    };
}

// ============ CONTACTS ============

export async function createContact(
    applicationId: string,
    data: Omit<Contact, "id" | "applicationId" | "createdAt">
): Promise<Contact | null> {
    const userId = await requireAuth();

    // Verify ownership
    const app = await prisma.application.findFirst({
        where: { id: applicationId, userId },
    });

    if (!app) return null;

    const contact = await prisma.contact.create({
        data: {
            applicationId,
            name: data.name,
            role: data.role,
            email: data.email,
            phone: data.phone,
            linkedin: data.linkedin,
            notes: data.notes,
        },
    });

    return {
        id: contact.id,
        applicationId: contact.applicationId,
        name: contact.name,
        role: contact.role ?? undefined,
        email: contact.email ?? undefined,
        phone: contact.phone ?? undefined,
        linkedin: contact.linkedin ?? undefined,
        notes: contact.notes ?? undefined,
        createdAt: contact.createdAt,
    };
}

export async function getApplicationContacts(applicationId: string): Promise<Contact[]> {
    const userId = await requireAuth();

    const app = await prisma.application.findFirst({
        where: { id: applicationId, userId },
    });

    if (!app) return [];

    const contacts = await prisma.contact.findMany({
        where: { applicationId },
        orderBy: { createdAt: "desc" },
    });

    return contacts.map((contact: typeof contacts[number]) => ({
        id: contact.id,
        applicationId: contact.applicationId,
        name: contact.name,
        role: contact.role ?? undefined,
        email: contact.email ?? undefined,
        phone: contact.phone ?? undefined,
        linkedin: contact.linkedin ?? undefined,
        notes: contact.notes ?? undefined,
        createdAt: contact.createdAt,
    }));
}

// ============ USER PROGRESS ============

export async function getUserProgressFromDB(): Promise<UserProgress | null> {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    let progress = await prisma.userProgress.findUnique({
        where: { userId },
    });

    // Create default progress if doesn't exist
    if (!progress) {
        progress = await prisma.userProgress.create({
            data: {
                userId,
                xp: 0,
                level: 1,
                currentStreak: 0,
                longestStreak: 0,
                totalApplied: 0,
                totalOffers: 0,
                totalInterviews: 0,
                totalFollowUps: 0,
                badges: [],
            },
        });
    }

    return {
        id: progress.id,
        xp: progress.xp,
        level: progress.level,
        currentStreak: progress.currentStreak,
        longestStreak: progress.longestStreak,
        lastActiveDate: progress.lastActiveAt,
        streakGraceUsed: false,
        totalApplications: progress.totalApplied,
        totalInterviews: progress.totalInterviews,
        totalOffers: progress.totalOffers,
        totalFollowUps: progress.totalFollowUps,
        badges: progress.badges as UserProgress["badges"],
        milestones: [],
        weeklyStats: [],
        createdAt: progress.createdAt,
        updatedAt: progress.updatedAt,
    };
}

async function updateProgressStats(type: "application" | "interview" | "offer" | "followup") {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const progress = await prisma.userProgress.findUnique({
        where: { userId },
    });

    if (!progress) {
        await prisma.userProgress.create({
            data: {
                userId,
                totalApplied: type === "application" ? 1 : 0,
                totalInterviews: type === "interview" ? 1 : 0,
                totalOffers: type === "offer" ? 1 : 0,
                totalFollowUps: type === "followup" ? 1 : 0,
                xp: type === "application" ? 10 : type === "interview" ? 25 : type === "offer" ? 100 : 15,
            },
        });
        return;
    }

    const xpReward = type === "application" ? 10 : type === "interview" ? 25 : type === "offer" ? 100 : 15;
    const newXp = progress.xp + xpReward;

    // Calculate new level
    const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000];
    let newLevel = 1;
    for (let i = thresholds.length - 1; i >= 0; i--) {
        if (newXp >= thresholds[i]) {
            newLevel = i + 1;
            break;
        }
    }

    await prisma.userProgress.update({
        where: { userId },
        data: {
            xp: newXp,
            level: newLevel,
            totalApplied: type === "application" ? progress.totalApplied + 1 : progress.totalApplied,
            totalInterviews: type === "interview" ? progress.totalInterviews + 1 : progress.totalInterviews,
            totalOffers: type === "offer" ? progress.totalOffers + 1 : progress.totalOffers,
            totalFollowUps: type === "followup" ? progress.totalFollowUps + 1 : progress.totalFollowUps,
            lastActiveAt: new Date(),
        },
    });
}

// ============ SETTINGS ============

export async function getUserSettingsFromDB(): Promise<Settings | null> {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    let settings = await prisma.userSettings.findUnique({
        where: { userId },
    });

    // Create default settings if doesn't exist
    if (!settings) {
        settings = await prisma.userSettings.create({
            data: {
                userId,
                weeklyGoal: 8,
                dailyGoal: 2,
                followUpDays: 7,
                interviewFollowUpDays: 2,
                ghostedDays: 21,
                streakGraceDays: 2,
                darkMode: true,
                emailReminders: false,
                emailFrequency: "daily",
            },
        });
    }

    return {
        id: settings.id,
        weeklyGoal: settings.weeklyGoal,
        dailyGoal: settings.dailyGoal,
        followUpDays: settings.followUpDays,
        interviewFollowUpDays: settings.interviewFollowUpDays,
        ghostedDays: settings.ghostedDays,
        streakGraceDays: settings.streakGraceDays,
        darkMode: settings.darkMode,
        emailReminders: settings.emailReminders,
        emailFrequency: settings.emailFrequency as "daily" | "weekly",
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
    };
}

export async function updateUserSettings(
    data: Partial<Omit<Settings, "id" | "createdAt" | "updatedAt">>
): Promise<Settings | null> {
    const userId = await requireAuth();

    const settings = await prisma.userSettings.upsert({
        where: { userId },
        update: {
            weeklyGoal: data.weeklyGoal,
            dailyGoal: data.dailyGoal,
            followUpDays: data.followUpDays,
            interviewFollowUpDays: data.interviewFollowUpDays,
            ghostedDays: data.ghostedDays,
            streakGraceDays: data.streakGraceDays,
            darkMode: data.darkMode,
            emailReminders: data.emailReminders,
            emailFrequency: data.emailFrequency,
        },
        create: {
            userId,
            weeklyGoal: data.weeklyGoal ?? 8,
            dailyGoal: data.dailyGoal ?? 2,
            followUpDays: data.followUpDays ?? 7,
            interviewFollowUpDays: data.interviewFollowUpDays ?? 2,
            ghostedDays: data.ghostedDays ?? 21,
            streakGraceDays: data.streakGraceDays ?? 2,
            darkMode: data.darkMode ?? true,
            emailReminders: data.emailReminders ?? false,
            emailFrequency: data.emailFrequency ?? "daily",
        },
    });

    return {
        id: settings.id,
        weeklyGoal: settings.weeklyGoal,
        dailyGoal: settings.dailyGoal,
        followUpDays: settings.followUpDays,
        interviewFollowUpDays: settings.interviewFollowUpDays,
        ghostedDays: settings.ghostedDays,
        streakGraceDays: settings.streakGraceDays,
        darkMode: settings.darkMode,
        emailReminders: settings.emailReminders,
        emailFrequency: settings.emailFrequency as "daily" | "weekly",
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
    };
}

// ============ AUTH STATUS ============

export async function getAuthStatus(): Promise<{ isAuthenticated: boolean; user: { id: string; email: string | null; displayName: string | null } | null }> {
    const user = await stackServerApp.getUser();

    if (!user) {
        return { isAuthenticated: false, user: null };
    }

    return {
        isAuthenticated: true,
        user: {
            id: user.id,
            email: user.primaryEmail,
            displayName: user.displayName,
        },
    };
}

// ============ SUBSCRIPTION ============

const FREE_TIER_LIMIT = 20;

export async function getSubscriptionStatus(): Promise<{
    tier: "free" | "pro";
    appCount: number;
    limit: number;
    canAddMore: boolean;
}> {
    const userId = await getCurrentUserId();
    if (!userId) {
        return { tier: "free", appCount: 0, limit: FREE_TIER_LIMIT, canAddMore: true };
    }

    // Get app count
    const appCount = await prisma.application.count({
        where: { userId },
    });

    // Get subscription tier
    const settings = await prisma.userSettings.findUnique({
        where: { userId },
        select: { subscriptionTier: true },
    });

    const tier = (settings?.subscriptionTier === "pro" ? "pro" : "free") as "free" | "pro";
    const limit = tier === "pro" ? Infinity : FREE_TIER_LIMIT;
    const canAddMore = tier === "pro" || appCount < FREE_TIER_LIMIT;

    return { tier, appCount, limit, canAddMore };
}

export async function createBillingPortalSession(): Promise<{ url: string } | { error: string }> {
    const userId = await getCurrentUserId();
    if (!userId) {
        return { error: "Authentication required" };
    }

    // Get user's Stripe customer ID
    const settings = await prisma.userSettings.findUnique({
        where: { userId },
        select: { stripeCustomerId: true },
    });

    if (!settings?.stripeCustomerId) {
        return { error: "No billing information found" };
    }

    try {
        // Dynamic import to avoid issues at build time
        const { stripe } = await import("./stripe");

        if (!stripe) {
            return { error: "Billing system unavailable" };
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: settings.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://trackjobflow.com"}/settings`,
        });

        return { url: session.url };
    } catch (error) {
        console.error("Failed to create billing portal session:", error);
        return { error: "Failed to open billing portal" };
    }
}
