import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendFollowUpReminderEmail, sendWeeklyDigestEmail } from '@/lib/email';
import { stackServerApp } from '@/stack/server';

// Vercel Cron job to send reminder emails
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/send-reminders", "schedule": "0 9 * * *" }] }
export async function GET(req: NextRequest) {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();
        const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const isWeeklyDigestDay = today === 1; // Send weekly digest on Mondays

        // Get all users with email reminders enabled
        const usersWithEmailReminders = await prisma.userSettings.findMany({
            where: {
                emailReminders: true,
            },
        });

        let emailsSent = 0;
        let errors = 0;

        for (const settings of usersWithEmailReminders) {
            try {
                // Get user info from Stack Auth
                const user = await stackServerApp.getUser(settings.userId);
                if (!user?.primaryEmail) continue;

                const userEmail = user.primaryEmail;
                const userName = user.displayName || '';

                // Check if we should send based on frequency
                const lastEmailSent = settings.lastEmailSentAt;
                const hoursSinceLastEmail = lastEmailSent
                    ? (now.getTime() - lastEmailSent.getTime()) / (1000 * 60 * 60)
                    : Infinity;

                // Daily users: send if > 20 hours since last email
                // Weekly users: only send on Mondays
                const shouldSendDaily = settings.emailFrequency === 'daily' && hoursSinceLastEmail > 20;
                const shouldSendWeekly = settings.emailFrequency === 'weekly' && isWeeklyDigestDay && hoursSinceLastEmail > 144; // 6 days

                if (!shouldSendDaily && !shouldSendWeekly) continue;

                // Get user's applications that need follow-up
                const applications = await prisma.application.findMany({
                    where: {
                        userId: settings.userId,
                        status: {
                            notIn: ['offer', 'rejected', 'ghosted'],
                        },
                    },
                });

                // Calculate which applications need follow-up
                const followUpDays = settings.followUpDays;
                const interviewFollowUpDays = settings.interviewFollowUpDays;

                const staleApplications = applications
                    .map(app => {
                        const daysSince = Math.floor(
                            (now.getTime() - new Date(app.lastTouchAt).getTime()) / (1000 * 60 * 60 * 24)
                        );
                        const isInterviewStage = ['screen', 'interview1', 'interview2', 'final'].includes(app.status);
                        const threshold = isInterviewStage ? interviewFollowUpDays : followUpDays;

                        if (daysSince >= threshold) {
                            return {
                                company: app.company,
                                role: app.role,
                                daysSince,
                            };
                        }
                        return null;
                    })
                    .filter(Boolean) as { company: string; role: string; daysSince: number }[];

                // Send appropriate email based on frequency
                if (settings.emailFrequency === 'weekly' && isWeeklyDigestDay) {
                    // Get weekly stats
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    const weeklyApps = applications.filter(app => new Date(app.createdAt) >= weekAgo);

                    const progress = await prisma.userProgress.findUnique({
                        where: { userId: settings.userId },
                    });

                    const stats = {
                        applied: weeklyApps.filter(app => app.status !== 'saved').length,
                        interviews: weeklyApps.filter(app =>
                            ['screen', 'interview1', 'interview2', 'final'].includes(app.status)
                        ).length,
                        offers: weeklyApps.filter(app => app.status === 'offer').length,
                        streak: progress?.currentStreak || 0,
                    };

                    const result = await sendWeeklyDigestEmail(
                        userEmail,
                        userName,
                        stats,
                        staleApplications.length
                    );

                    if (result.success) emailsSent++;
                    else errors++;

                } else if (staleApplications.length > 0) {
                    // Send follow-up reminder for daily users
                    const result = await sendFollowUpReminderEmail(
                        userEmail,
                        userName,
                        staleApplications.slice(0, 5) // Limit to 5 apps per email
                    );

                    if (result.success) emailsSent++;
                    else errors++;
                }

                // Update last email sent timestamp
                await prisma.userSettings.update({
                    where: { id: settings.id },
                    data: { lastEmailSentAt: now },
                });

            } catch (userError) {
                console.error(`Error processing user ${settings.userId}:`, userError);
                errors++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${usersWithEmailReminders.length} users. Sent ${emailsSent} emails. ${errors} errors.`,
            stats: {
                usersProcessed: usersWithEmailReminders.length,
                emailsSent,
                errors,
            },
        });

    } catch (error) {
        console.error('Error in send-reminders cron:', error);
        return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 });
    }
}

// Also allow POST for manual triggering (for testing)
export async function POST(req: NextRequest) {
    // For testing, allow triggering without cron secret
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
    }

    return GET(req);
}
