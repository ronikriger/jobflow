import Dexie, { type EntityTable } from "dexie";
import type {
    Application,
    ApplicationEvent,
    Contact,
    Reminder,
    Settings,
    UserProgress,
    Platform,
    ApplicationStatus,
    BadgeType,
} from "./types";

// Database schema
class JobTrackerDB extends Dexie {
    applications!: EntityTable<Application, "id">;
    events!: EntityTable<ApplicationEvent, "id">;
    contacts!: EntityTable<Contact, "id">;
    reminders!: EntityTable<Reminder, "id">;
    settings!: EntityTable<Settings, "id">;
    userProgress!: EntityTable<UserProgress, "id">;

    constructor() {
        super("JobTrackerDB");

        this.version(1).stores({
            applications:
                "++id, company, role, status, platform, createdAt, updatedAt, appliedAt, lastTouchAt, archived",
            events: "++id, applicationId, type, date, createdAt",
            contacts: "++id, applicationId, name, createdAt",
            reminders: "++id, applicationId, dueAt, completed, createdAt",
            settings: "++id",
            userProgress: "++id",
        });
    }
}

export const db = new JobTrackerDB();

// Initialize default settings if not exists
export async function initializeDefaults() {
    const existingSettings = await db.settings.toArray();
    if (existingSettings.length === 0) {
        await db.settings.add({
            weeklyGoal: 8,
            dailyGoal: 2,
            followUpDays: 7,
            interviewFollowUpDays: 2,
            ghostedDays: 21,
            streakGraceDays: 2,
            darkMode: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    const existingProgress = await db.userProgress.toArray();
    if (existingProgress.length === 0) {
        await db.userProgress.add({
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
            updatedAt: new Date(),
        });
    }
}

// Seed demo data for first-time users
export async function seedDemoData() {
    const existingApps = await db.applications.count();
    if (existingApps > 0) return;

    const now = new Date();
    const demoApplications: Omit<Application, "id">[] = [
        {
            company: "Stripe",
            role: "Senior Frontend Engineer",
            location: "San Francisco, CA",
            salary: "$180k - $250k",
            url: "https://stripe.com/jobs/123",
            platform: "company-site" as Platform,
            status: "interview2" as ApplicationStatus,
            createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            appliedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            lastTouchAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            priority: "high",
        },
        {
            company: "Vercel",
            role: "Product Engineer",
            location: "Remote",
            salary: "$160k - $220k",
            url: "https://vercel.com/careers",
            platform: "company-site" as Platform,
            status: "screen" as ApplicationStatus,
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            appliedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            lastTouchAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            priority: "high",
        },
        {
            company: "Linear",
            role: "Full Stack Engineer",
            location: "Remote",
            url: "https://linear.app/jobs",
            platform: "lever" as Platform,
            status: "applied" as ApplicationStatus,
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            appliedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            lastTouchAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            priority: "medium",
        },
        {
            company: "Notion",
            role: "Software Engineer",
            location: "New York, NY",
            salary: "$150k - $200k",
            url: "https://notion.so/careers",
            platform: "greenhouse" as Platform,
            status: "applied" as ApplicationStatus,
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            appliedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            lastTouchAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
        {
            company: "Figma",
            role: "Frontend Engineer",
            location: "San Francisco, CA",
            url: "https://figma.com/careers",
            platform: "greenhouse" as Platform,
            status: "saved" as ApplicationStatus,
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            lastTouchAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
        {
            company: "Airbnb",
            role: "Staff Engineer",
            location: "San Francisco, CA",
            salary: "$200k - $300k",
            url: "https://airbnb.com/careers",
            platform: "linkedin" as Platform,
            status: "interview1" as ApplicationStatus,
            createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            appliedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
            lastTouchAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            priority: "high",
        },
        {
            company: "Shopify",
            role: "Senior Developer",
            location: "Remote",
            platform: "linkedin" as Platform,
            status: "rejected" as ApplicationStatus,
            createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
            appliedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
            lastTouchAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        },
        {
            company: "GitHub",
            role: "Software Engineer",
            location: "Remote",
            platform: "company-site" as Platform,
            status: "ghosted" as ApplicationStatus,
            createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            appliedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            lastTouchAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
        {
            company: "Datadog",
            role: "Full Stack Engineer",
            location: "New York, NY",
            platform: "lever" as Platform,
            status: "saved" as ApplicationStatus,
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            lastTouchAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        },
        {
            company: "Coinbase",
            role: "Blockchain Engineer",
            location: "Remote",
            salary: "$170k - $240k",
            platform: "greenhouse" as Platform,
            status: "offer" as ApplicationStatus,
            createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            appliedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
            lastTouchAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            priority: "high",
        },
    ];

    const appIds = await db.applications.bulkAdd(demoApplications, {
        allKeys: true,
    }) as number[];

    // Add demo events
    const demoEvents: Omit<ApplicationEvent, "id">[] = [
        {
            applicationId: appIds[0]!,
            type: "applied",
            title: "Applied to Stripe",
            date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            completed: true,
        },
        {
            applicationId: appIds[0]!,
            type: "phone-screen",
            title: "Phone screen with recruiter",
            description: "30 min call with Sarah",
            date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            completed: true,
        },
        {
            applicationId: appIds[0]!,
            type: "technical",
            title: "Technical interview",
            description: "1 hour coding session",
            date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            completed: true,
        },
        {
            applicationId: appIds[0]!,
            type: "onsite",
            title: "Onsite interview scheduled",
            date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            completed: false,
            scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        },
        {
            applicationId: appIds[5]!,
            type: "applied",
            title: "Applied to Airbnb",
            date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
            createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
            completed: true,
        },
        {
            applicationId: appIds[5]!,
            type: "phone-screen",
            title: "Initial screening call",
            date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            completed: true,
        },
    ];

    await db.events.bulkAdd(demoEvents);

    // Add demo contacts
    const demoContacts: Omit<Contact, "id">[] = [
        {
            applicationId: appIds[0]!,
            name: "Sarah Chen",
            role: "Technical Recruiter",
            email: "sarah@stripe.com",
            linkedin: "https://linkedin.com/in/sarahchen",
            createdAt: new Date(),
        },
        {
            applicationId: appIds[5]!,
            name: "Mike Johnson",
            role: "Engineering Manager",
            email: "mike@airbnb.com",
            createdAt: new Date(),
        },
    ];

    await db.contacts.bulkAdd(demoContacts);

    // Update user progress
    await db.userProgress.update(1, {
        xp: 285,
        level: 3,
        currentStreak: 5,
        longestStreak: 7,
        totalApplications: 10,
        totalInterviews: 3,
        totalOffers: 1,
        totalFollowUps: 4,
        badges: [
            "first-application" as BadgeType,
            "ten-apps" as BadgeType,
            "first-interview" as BadgeType,
        ],
        updatedAt: new Date(),
    });
}

// Helper functions
export async function getSettings(): Promise<Settings> {
    const settings = await db.settings.toArray();
    return (
        settings[0] || {
            weeklyGoal: 8,
            dailyGoal: 2,
            followUpDays: 7,
            interviewFollowUpDays: 2,
            ghostedDays: 21,
            streakGraceDays: 2,
            darkMode: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    );
}

export async function getUserProgress(): Promise<UserProgress> {
    const progress = await db.userProgress.toArray();
    return (
        progress[0] || {
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
            updatedAt: new Date(),
        }
    );
}

export async function addXP(amount: number): Promise<void> {
    const progress = await getUserProgress();
    const newXP = progress.xp + amount;

    // Calculate new level
    let newLevel = 1;
    const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000];
    for (let i = thresholds.length - 1; i >= 0; i--) {
        if (newXP >= thresholds[i]) {
            newLevel = i + 1;
            break;
        }
    }

    await db.userProgress.update(progress.id!, {
        xp: newXP,
        level: newLevel,
        updatedAt: new Date(),
    });
}

export async function checkAndAwardBadge(badge: BadgeType): Promise<boolean> {
    const progress = await getUserProgress();
    if (progress.badges.includes(badge)) return false;

    await db.userProgress.update(progress.id!, {
        badges: [...progress.badges, badge],
        updatedAt: new Date(),
    });
    return true;
}

export async function updateStreak(): Promise<void> {
    const progress = await getUserProgress();
    const today = new Date();
    const lastActive = new Date(progress.lastActiveDate);

    const daysDiff = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) return; // Same day, no update needed

    if (daysDiff === 1) {
        // Consecutive day
        const newStreak = progress.currentStreak + 1;
        await db.userProgress.update(progress.id!, {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, progress.longestStreak),
            lastActiveDate: today,
            streakGraceUsed: false,
            updatedAt: new Date(),
        });
    } else if (daysDiff <= 3 && !progress.streakGraceUsed) {
        // Within grace period
        await db.userProgress.update(progress.id!, {
            lastActiveDate: today,
            streakGraceUsed: true,
            updatedAt: new Date(),
        });
    } else {
        // Streak broken
        await db.userProgress.update(progress.id!, {
            currentStreak: 1,
            lastActiveDate: today,
            streakGraceUsed: false,
            updatedAt: new Date(),
        });
    }
}

// Export all data as CSV
export async function exportToCSV(): Promise<string> {
    const applications = await db.applications.toArray();

    const headers = [
        "Company",
        "Role",
        "Location",
        "Salary",
        "URL",
        "Platform",
        "Status",
        "Applied Date",
        "Last Touch",
        "Priority",
        "Notes",
    ];

    const rows = applications.map((app) => [
        app.company,
        app.role,
        app.location || "",
        app.salary || "",
        app.url || "",
        app.platform,
        app.status,
        app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "",
        new Date(app.lastTouchAt).toLocaleDateString(),
        app.priority || "",
        app.notes || "",
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
    ].join("\n");


    return csvContent;
}

// Import data from CSV
export async function importFromCSV(file: File): Promise<{ success: boolean; count: number; error?: string }> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                if (!text) throw new Error("Empty file");

                const lines = text.split("\n");
                if (lines.length < 2) throw new Error("Invalid CSV format");

                // Parse headers
                const headers = lines[0].split(",");

                let count = 0;
                const now = new Date();

                // Process rows
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    if (!line || line.trim() === "") continue;

                    // Simple CSV parser (handles quoted values)
                    const values: string[] = [];
                    let currentValue = "";
                    let inQuotes = false;

                    for (let j = 0; j < line.length; j++) {
                        const char = line[j];
                        if (char === '"') {
                            if (j + 1 < line.length && line[j + 1] === '"') {
                                currentValue += '"';
                                j++; // Skip escaped quote
                            } else {
                                inQuotes = !inQuotes;
                            }
                        } else if (char === ',' && !inQuotes) {
                            values.push(currentValue);
                            currentValue = "";
                        } else {
                            currentValue += char;
                        }
                    }
                    values.push(currentValue);

                    // Map values to Application object
                    // Headers: Company,Role,Location,Salary,URL,Platform,Status,Applied Date,Last Touch,Priority,Notes
                    const app: Omit<Application, "id"> = {
                        company: values[0] || "Unknown",
                        role: values[1] || "Unknown Role",
                        location: values[2],
                        salary: values[3],
                        url: values[4],
                        platform: (values[5] as Platform) || "other",
                        status: (values[6] as ApplicationStatus) || "saved",
                        appliedAt: values[7] ? new Date(values[7]) : undefined,
                        lastTouchAt: values[8] ? new Date(values[8]) : now,
                        priority: (values[9] as "high" | "medium" | "low") || "medium",
                        notes: values[10],
                        createdAt: now,
                        updatedAt: now,
                    };

                    await db.applications.add(app);
                    count++;
                }

                resolve({ success: true, count });
            } catch (error) {
                console.error("Import error:", error);
                resolve({ success: false, count: 0, error: "Failed to parse CSV" });
            }
        };

        reader.readAsText(file);
    });
}

