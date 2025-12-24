import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, format, startOfWeek, parseISO, isValid } from "date-fns";
import type { Application, ApplicationStatus, Platform, NextAction } from "./types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Calculate days in current stage
export function getDaysInStage(app: Application): number {
    return differenceInDays(new Date(), new Date(app.updatedAt));
}

// Calculate days since last touch
export function getDaysSinceLastTouch(app: Application): number {
    return differenceInDays(new Date(), new Date(app.lastTouchAt));
}

// Check if application is stale based on settings
export function isStale(app: Application, followUpDays: number = 7): boolean {
    const daysSinceTouch = getDaysSinceLastTouch(app);

    // Don't consider completed statuses as stale
    if (["offer", "rejected", "ghosted"].includes(app.status)) {
        return false;
    }

    return daysSinceTouch >= followUpDays;
}

// Get suggested follow-up date based on status
export function getSuggestedFollowUpDate(app: Application, settings: { followUpDays: number; interviewFollowUpDays: number }): Date | null {
    const lastTouch = new Date(app.lastTouchAt);

    switch (app.status) {
        case "applied":
            return new Date(lastTouch.getTime() + settings.followUpDays * 24 * 60 * 60 * 1000);
        case "screen":
        case "interview1":
        case "interview2":
        case "final":
            return new Date(lastTouch.getTime() + settings.interviewFollowUpDays * 24 * 60 * 60 * 1000);
        default:
            return null;
    }
}

// Get next actions for an application
export function getNextActions(apps: Application[], settings: { followUpDays: number; interviewFollowUpDays: number }): NextAction[] {
    const actions: NextAction[] = [];

    for (const app of apps) {
        // Skip completed statuses
        if (["offer", "rejected", "ghosted"].includes(app.status)) continue;

        const daysSinceTouch = getDaysSinceLastTouch(app);

        // Saved → Apply
        if (app.status === "saved") {
            actions.push({
                id: `apply-${app.id}`,
                type: "apply",
                application: app,
                description: `Apply to ${app.company}`,
                priority: app.priority || "medium",
            });
        }

        // Applied → Follow up after X days
        if (app.status === "applied" && daysSinceTouch >= settings.followUpDays) {
            actions.push({
                id: `followup-${app.id}`,
                type: "follow-up",
                application: app,
                description: `Follow up with ${app.company} (${daysSinceTouch} days since applying)`,
                dueAt: new Date(),
                priority: "high",
            });
        }

        // Interview stages → Follow up after interview
        if (["screen", "interview1", "interview2", "final"].includes(app.status) && daysSinceTouch >= settings.interviewFollowUpDays) {
            actions.push({
                id: `followup-${app.id}`,
                type: "follow-up",
                application: app,
                description: `Follow up after ${app.status === "screen" ? "screening" : "interview"} with ${app.company}`,
                dueAt: new Date(),
                priority: "high",
            });
        }

        // Prep for upcoming interviews
        if (["screen", "interview1", "interview2", "final"].includes(app.status) && daysSinceTouch < 3) {
            actions.push({
                id: `prep-${app.id}`,
                type: "prep",
                application: app,
                description: `Prepare for ${app.company} ${app.status === "screen" ? "screening" : "interview"}`,
                priority: "high",
            });
        }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// Format date for display
export function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "Invalid date";
    return format(d, "MMM d, yyyy");
}

export function formatRelativeDate(date: Date | string): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "Invalid date";

    const days = differenceInDays(new Date(), d);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return format(d, "MMM d");
}

// Parse company name from URL
export function parseCompanyFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();

        // Common job board domains
        const jobBoards = ["linkedin.com", "indeed.com", "glassdoor.com", "lever.co", "greenhouse.io", "workday.com"];

        for (const board of jobBoards) {
            if (hostname.includes(board)) {
                // Try to extract company from path
                const pathParts = urlObj.pathname.split("/").filter(Boolean);
                if (pathParts.length > 0) {
                    // Lever: jobs.lever.co/company
                    if (hostname.includes("lever.co") && pathParts[0]) {
                        return formatCompanyName(pathParts[0]);
                    }
                    // Greenhouse: boards.greenhouse.io/company
                    if (hostname.includes("greenhouse.io") && pathParts[0]) {
                        return formatCompanyName(pathParts[0]);
                    }
                    // LinkedIn: linkedin.com/jobs/view/... or linkedin.com/company/...
                    if (hostname.includes("linkedin.com")) {
                        const companyIndex = pathParts.indexOf("company");
                        if (companyIndex !== -1 && pathParts[companyIndex + 1]) {
                            return formatCompanyName(pathParts[companyIndex + 1]);
                        }
                    }
                }
                return null;
            }
        }

        // For direct company sites, use the domain name
        const domain = hostname.replace("www.", "").split(".")[0];
        return formatCompanyName(domain);
    } catch {
        return null;
    }
}

// Detect platform from URL
export function detectPlatformFromUrl(url: string): Platform {
    try {
        const hostname = new URL(url).hostname.toLowerCase();

        if (hostname.includes("linkedin.com")) return "linkedin";
        if (hostname.includes("greenhouse.io")) return "greenhouse";
        if (hostname.includes("lever.co")) return "lever";
        if (hostname.includes("workday.com")) return "workday";
        if (hostname.includes("indeed.com")) return "indeed";
        if (hostname.includes("glassdoor.com")) return "glassdoor";

        return "company-site";
    } catch {
        return "other";
    }
}

// Format company name (capitalize, remove dashes)
function formatCompanyName(name: string): string {
    return name
        .replace(/-/g, " ")
        .replace(/_/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

// Get company logo URL
export function getCompanyLogo(company: string): string {
    const sanitized = company.toLowerCase().replace(/\s+/g, "");
    return `https://logo.clearbit.com/${sanitized}.com`;
}

// Generate heatmap data for the last 52 weeks
export function generateHeatmapData(applications: Application[]): { date: Date; count: number }[] {
    const today = new Date();
    const oneYearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Create a map of dates to application counts
    const dateMap = new Map<string, number>();

    for (const app of applications) {
        if (app.appliedAt) {
            const dateKey = format(new Date(app.appliedAt), "yyyy-MM-dd");
            dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
        }
    }

    // Generate data for each day
    const data: { date: Date; count: number }[] = [];
    const currentDate = new Date(oneYearAgo);

    while (currentDate <= today) {
        const dateKey = format(currentDate, "yyyy-MM-dd");
        data.push({
            date: new Date(currentDate),
            count: dateMap.get(dateKey) || 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
}

// Get week start date for grouping
export function getWeekStart(date: Date): Date {
    return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

// Calculate analytics
export function calculateAnalytics(applications: Application[]) {
    const total = applications.length;
    const applied = applications.filter(a => a.status !== "saved").length;
    const withResponse = applications.filter(a => !["saved", "applied", "ghosted"].includes(a.status)).length;
    const withInterview = applications.filter(a => ["screen", "interview1", "interview2", "final", "offer"].includes(a.status)).length;

    const responseRate = applied > 0 ? (withResponse / applied) * 100 : 0;
    const interviewRate = applied > 0 ? (withInterview / applied) * 100 : 0;

    // Calculate average time to first response
    const responseTimes: number[] = [];
    for (const app of applications) {
        if (app.appliedAt && app.status !== "applied" && app.status !== "ghosted") {
            // This is simplified - in a real app, you'd track the first response date separately
            const responseTime = differenceInDays(new Date(app.updatedAt), new Date(app.appliedAt));
            if (responseTime > 0) responseTimes.push(responseTime);
        }
    }
    const avgTimeToResponse = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;

    // Platform stats
    const platformStats = new Map<Platform, { total: number; responses: number; interviews: number }>();
    for (const app of applications) {
        const stats = platformStats.get(app.platform) || { total: 0, responses: 0, interviews: 0 };
        stats.total++;
        if (!["saved", "applied", "ghosted"].includes(app.status)) stats.responses++;
        if (["screen", "interview1", "interview2", "final", "offer"].includes(app.status)) stats.interviews++;
        platformStats.set(app.platform, stats);
    }

    return {
        total,
        applied,
        responseRate: Math.round(responseRate),
        interviewRate: Math.round(interviewRate),
        avgTimeToResponse,
        platformStats: Array.from(platformStats.entries()).map(([platform, stats]) => ({
            platform,
            total: stats.total,
            responseRate: stats.total > 0 ? Math.round((stats.responses / stats.total) * 100) : 0,
            interviewRate: stats.total > 0 ? Math.round((stats.interviews / stats.total) * 100) : 0,
        })),
    };
}

// Status order for Kanban
export const STATUS_ORDER: ApplicationStatus[] = [
    "saved",
    "applied",
    "screen",
    "interview1",
    "interview2",
    "final",
    "offer",
    "rejected",
    "ghosted",
];

// Get status color class
export function getStatusColorClass(status: ApplicationStatus): string {
    const colors: Record<ApplicationStatus, string> = {
        saved: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
        applied: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        screen: "bg-violet-500/20 text-violet-400 border-violet-500/30",
        interview1: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        interview2: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        final: "bg-pink-500/20 text-pink-400 border-pink-500/30",
        offer: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        rejected: "bg-red-500/20 text-red-400 border-red-500/30",
        ghosted: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return colors[status];
}

