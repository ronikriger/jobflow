// Application status flow (Kanban columns)
export type ApplicationStatus =
    | "saved"
    | "applied"
    | "screen"
    | "interview1"
    | "interview2"
    | "final"
    | "offer"
    | "rejected"
    | "ghosted";

// Platform tags for tracking source
export type Platform =
    | "linkedin"
    | "greenhouse"
    | "lever"
    | "workday"
    | "indeed"
    | "glassdoor"
    | "company-site"
    | "referral"
    | "other";

// Event types for timeline
export type EventType =
    | "applied"
    | "phone-screen"
    | "technical"
    | "take-home"
    | "onsite"
    | "offer"
    | "rejection"
    | "follow-up"
    | "note"
    | "status-change";

// Badge types for gamification
export type BadgeType =
    | "first-application"
    | "application-streak-3"
    | "application-streak-7"
    | "application-streak-14"
    | "first-interview"
    | "interview-pro"
    | "follow-up-pro"
    | "first-offer"
    | "networker"
    | "consistent-week"
    | "ten-apps"
    | "fifty-apps"
    | "hundred-apps";

// Milestone types
export type MilestoneType =
    | "first-10-apps"
    | "first-interview"
    | "first-offer"
    | "first-follow-up"
    | "week-streak"
    | "month-streak";

// Core application model
export interface Application {
    id?: number;
    company: string;
    role: string;
    location?: string;
    salary?: string;
    url?: string;
    platform: Platform;
    status: ApplicationStatus;
    createdAt: Date;
    updatedAt: Date;
    appliedAt?: Date;
    lastTouchAt: Date;
    suggestedFollowUpAt?: Date;
    notes?: string;
    priority?: "low" | "medium" | "high";
    archived?: boolean;
}

// Event/Activity model for timeline
export interface ApplicationEvent {
    id?: number;
    applicationId: number;
    type: EventType;
    title: string;
    description?: string;
    date: Date;
    createdAt: Date;
    completed?: boolean;
    scheduledAt?: Date;
}

// Contact model for networking
export interface Contact {
    id?: number;
    applicationId: number;
    name: string;
    role?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    notes?: string;
    createdAt: Date;
}

// Reminder model
export interface Reminder {
    id?: number;
    applicationId: number;
    title: string;
    description?: string;
    dueAt: Date;
    completed: boolean;
    createdAt: Date;
}

// User settings
export interface Settings {
    id?: number;
    weeklyGoal: number;
    dailyGoal: number;
    followUpDays: number; // Days after application to suggest follow-up
    interviewFollowUpDays: number; // Days after interview to suggest follow-up
    ghostedDays: number; // Days without response to mark as ghosted candidate
    streakGraceDays: number; // Grace days before streak breaks
    darkMode: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// User progress/gamification
export interface UserProgress {
    id?: number;
    xp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: Date;
    streakGraceUsed: boolean;
    totalApplications: number;
    totalInterviews: number;
    totalOffers: number;
    totalFollowUps: number;
    badges: BadgeType[];
    milestones: MilestoneType[];
    weeklyStats: WeeklyStats[];
    createdAt: Date;
    updatedAt: Date;
}

// Weekly statistics for analytics
export interface WeeklyStats {
    weekStart: Date;
    applications: number;
    interviews: number;
    followUps: number;
    offers: number;
    rejections: number;
}

// Derived types for UI
export interface ApplicationWithEvents extends Application {
    events: ApplicationEvent[];
    contacts: Contact[];
    reminders: Reminder[];
}

export interface KanbanColumn {
    id: ApplicationStatus;
    title: string;
    color: string;
    applications: Application[];
}

export interface DashboardStats {
    weeklyProgress: number;
    weeklyGoal: number;
    dailyProgress: number;
    dailyGoal: number;
    totalActive: number;
    staleApplications: Application[];
    nextActions: NextAction[];
    recentActivity: ApplicationEvent[];
}

export interface NextAction {
    id: string;
    type: "follow-up" | "prep" | "apply" | "log-outcome";
    application: Application;
    description: string;
    dueAt?: Date;
    priority: "low" | "medium" | "high";
}

export interface AnalyticsData {
    responseRate: number;
    interviewRate: number;
    avgTimeToResponse: number;
    funnelData: FunnelData[];
    platformStats: PlatformStats[];
    weeklyTrends: WeeklyTrend[];
}

export interface FunnelData {
    stage: ApplicationStatus;
    count: number;
    percentage: number;
}

export interface PlatformStats {
    platform: Platform;
    total: number;
    responseRate: number;
    interviewRate: number;
}

export interface WeeklyTrend {
    week: string;
    applications: number;
    interviews: number;
    responses: number;
}

// XP rewards
export const XP_REWARDS = {
    apply: 10,
    "follow-up": 15,
    prep: 5,
    interview: 25,
    offer: 100,
    "log-outcome": 5,
} as const;

// Level thresholds
export const LEVEL_THRESHOLDS = [
    0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000,
];

// Status configuration
export const STATUS_CONFIG: Record<
    ApplicationStatus,
    { label: string; color: string; order: number }
> = {
    saved: { label: "Saved", color: "status-saved", order: 0 },
    applied: { label: "Applied", color: "status-applied", order: 1 },
    screen: { label: "Screen", color: "status-screen", order: 2 },
    interview1: { label: "Interview 1", color: "status-interview1", order: 3 },
    interview2: { label: "Interview 2", color: "status-interview2", order: 4 },
    final: { label: "Final", color: "status-final", order: 5 },
    offer: { label: "Offer", color: "status-offer", order: 6 },
    rejected: { label: "Rejected", color: "status-rejected", order: 7 },
    ghosted: { label: "Ghosted", color: "status-ghosted", order: 8 },
};

// Platform configuration
export const PLATFORM_CONFIG: Record<Platform, { label: string; icon: string }> =
{
    linkedin: { label: "LinkedIn", icon: "linkedin" },
    greenhouse: { label: "Greenhouse", icon: "leaf" },
    lever: { label: "Lever", icon: "move" },
    workday: { label: "Workday", icon: "building" },
    indeed: { label: "Indeed", icon: "search" },
    glassdoor: { label: "Glassdoor", icon: "door-open" },
    "company-site": { label: "Company Site", icon: "globe" },
    referral: { label: "Referral", icon: "users" },
    other: { label: "Other", icon: "link" },
};

// Badge configuration
export const BADGE_CONFIG: Record<
    BadgeType,
    { label: string; description: string; icon: string }
> = {
    "first-application": {
        label: "First Steps",
        description: "Submitted your first application",
        icon: "rocket",
    },
    "application-streak-3": {
        label: "On a Roll",
        description: "3-day application streak",
        icon: "flame",
    },
    "application-streak-7": {
        label: "Unstoppable",
        description: "7-day application streak",
        icon: "zap",
    },
    "application-streak-14": {
        label: "Machine Mode",
        description: "14-day application streak",
        icon: "trophy",
    },
    "first-interview": {
        label: "First Interview",
        description: "Landed your first interview",
        icon: "phone",
    },
    "interview-pro": {
        label: "Interview Pro",
        description: "Completed 10 interviews",
        icon: "star",
    },
    "follow-up-pro": {
        label: "Follow-up Pro",
        description: "Sent 10 follow-ups",
        icon: "mail",
    },
    "first-offer": {
        label: "Winner",
        description: "Received your first offer",
        icon: "award",
    },
    networker: {
        label: "Networker",
        description: "Added 10 contacts",
        icon: "users",
    },
    "consistent-week": {
        label: "Consistent",
        description: "Met weekly goal 4 weeks in a row",
        icon: "target",
    },
    "ten-apps": {
        label: "Getting Started",
        description: "Applied to 10 positions",
        icon: "briefcase",
    },
    "fifty-apps": {
        label: "Serious Searcher",
        description: "Applied to 50 positions",
        icon: "trending-up",
    },
    "hundred-apps": {
        label: "Veteran",
        description: "Applied to 100 positions",
        icon: "medal",
    },
};

