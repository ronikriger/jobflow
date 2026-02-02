import { Resend } from 'resend';

// Lazily initialize Resend to avoid build-time errors
let resendInstance: Resend | null = null;

function getResend(): Resend | null {
    if (!process.env.RESEND_API_KEY) {
        return null;
    }
    if (!resendInstance) {
        resendInstance = new Resend(process.env.RESEND_API_KEY);
    }
    return resendInstance;
}

const FROM_EMAIL = 'JobFlow <noreply@trackjobflow.com>';

// Email Templates
export const emailTemplates = {
    welcome: (userName: string) => ({
        subject: '🎉 Welcome to JobFlow - Your Job Search Command Center',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 16px; border-radius: 16px; margin-bottom: 20px;">
                <span style="font-size: 32px;">⚡</span>
            </div>
            <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px 0;">Welcome to JobFlow!</h1>
            <p style="color: #a1a1aa; font-size: 16px; margin: 0;">Your job search just got organized</p>
        </div>

        <!-- Main Content -->
        <div style="background-color: #18181b; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #27272a;">
            <p style="color: #e4e4e7; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hey ${userName || 'there'}! 👋
            </p>
            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thanks for creating your JobFlow account. You're now ready to track your job applications, stay organized, and land your dream job faster.
            </p>

            <!-- Features -->
            <div style="margin-bottom: 24px;">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <span style="color: #10b981; margin-right: 12px;">✓</span>
                    <span style="color: #e4e4e7;"><strong>Visual Pipeline</strong> - Drag-and-drop Kanban board</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <span style="color: #10b981; margin-right: 12px;">✓</span>
                    <span style="color: #e4e4e7;"><strong>Smart Reminders</strong> - Never miss a follow-up</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <span style="color: #10b981; margin-right: 12px;">✓</span>
                    <span style="color: #e4e4e7;"><strong>Analytics</strong> - Track your conversion rates</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="color: #10b981; margin-right: 12px;">✓</span>
                    <span style="color: #e4e4e7;"><strong>Gamification</strong> - XP, streaks & badges</span>
                </div>
            </div>

            <!-- CTA Button -->
            <a href="https://trackjobflow.com/home" style="display: block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; text-align: center;">
                Start Tracking Applications →
            </a>
        </div>

        <!-- Email Preferences Notice -->
        <div style="background-color: #18181b; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #27272a;">
            <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 12px 0;">
                📧 <strong style="color: #e4e4e7;">Want follow-up reminders via email?</strong>
            </p>
            <p style="color: #71717a; font-size: 14px; margin: 0 0 12px 0;">
                Enable email reminders in your settings to get notified when it's time to follow up on your applications.
            </p>
            <a href="https://trackjobflow.com/settings" style="color: #3b82f6; font-size: 14px; text-decoration: none;">
                Manage email preferences →
            </a>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #27272a;">
            <p style="color: #71717a; font-size: 12px; margin: 0 0 8px 0;">
                © ${new Date().getFullYear()} JobFlow. All rights reserved.
            </p>
            <p style="color: #52525b; font-size: 12px; margin: 0;">
                <a href="https://trackjobflow.com" style="color: #52525b; text-decoration: none;">trackjobflow.com</a>
            </p>
        </div>
    </div>
</body>
</html>
        `,
    }),

    followUpReminder: (userName: string, applications: { company: string; role: string; daysSince: number }[]) => ({
        subject: `⏰ ${applications.length} application${applications.length > 1 ? 's' : ''} need${applications.length === 1 ? 's' : ''} follow-up`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #f97316); padding: 12px; border-radius: 12px; margin-bottom: 16px;">
                <span style="font-size: 24px;">⏰</span>
            </div>
            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Follow-up Reminder</h1>
        </div>

        <!-- Main Content -->
        <div style="background-color: #18181b; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #27272a;">
            <p style="color: #e4e4e7; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hey ${userName || 'there'}! 👋
            </p>
            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                You have <strong style="color: #f59e0b;">${applications.length} application${applications.length > 1 ? 's' : ''}</strong> that ${applications.length === 1 ? 'needs' : 'need'} a follow-up:
            </p>

            <!-- Applications List -->
            ${applications.map(app => `
            <div style="background-color: #27272a; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <p style="color: #ffffff; font-weight: 600; margin: 0 0 4px 0;">${app.company}</p>
                <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 8px 0;">${app.role}</p>
                <p style="color: #f59e0b; font-size: 13px; margin: 0;">
                    ⏱ ${app.daysSince} days since last activity
                </p>
            </div>
            `).join('')}

            <!-- CTA Button -->
            <a href="https://trackjobflow.com/home" style="display: block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; text-align: center; margin-top: 20px;">
                View in Dashboard →
            </a>
        </div>

        <!-- Tips -->
        <div style="background-color: #18181b; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #27272a;">
            <p style="color: #e4e4e7; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">💡 Follow-up Tips:</p>
            <ul style="color: #a1a1aa; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Keep it brief and professional</li>
                <li>Reference your original application</li>
                <li>Express continued interest</li>
                <li>Ask if there are any updates</li>
            </ul>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #27272a;">
            <p style="color: #71717a; font-size: 12px; margin: 0 0 8px 0;">
                You're receiving this because you enabled email reminders.
            </p>
            <a href="https://trackjobflow.com/settings" style="color: #52525b; font-size: 12px; text-decoration: none;">
                Manage email preferences
            </a>
        </div>
    </div>
</body>
</html>
        `,
    }),

    weeklyDigest: (userName: string, stats: { applied: number; interviews: number; offers: number; streak: number }, pendingFollowUps: number) => ({
        subject: `📊 Your weekly job search report`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 12px; border-radius: 12px; margin-bottom: 16px;">
                <span style="font-size: 24px;">📊</span>
            </div>
            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Weekly Report</h1>
            <p style="color: #a1a1aa; font-size: 14px; margin: 8px 0 0 0;">Your job search at a glance</p>
        </div>

        <!-- Stats Grid -->
        <div style="background-color: #18181b; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #27272a;">
            <p style="color: #e4e4e7; font-size: 16px; margin: 0 0 20px 0;">Hey ${userName || 'there'}! Here's your week:</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div style="background-color: #27272a; border-radius: 12px; padding: 16px; text-align: center;">
                    <p style="color: #3b82f6; font-size: 28px; font-weight: bold; margin: 0;">${stats.applied}</p>
                    <p style="color: #a1a1aa; font-size: 13px; margin: 4px 0 0 0;">Applications</p>
                </div>
                <div style="background-color: #27272a; border-radius: 12px; padding: 16px; text-align: center;">
                    <p style="color: #8b5cf6; font-size: 28px; font-weight: bold; margin: 0;">${stats.interviews}</p>
                    <p style="color: #a1a1aa; font-size: 13px; margin: 4px 0 0 0;">Interviews</p>
                </div>
                <div style="background-color: #27272a; border-radius: 12px; padding: 16px; text-align: center;">
                    <p style="color: #10b981; font-size: 28px; font-weight: bold; margin: 0;">${stats.offers}</p>
                    <p style="color: #a1a1aa; font-size: 13px; margin: 4px 0 0 0;">Offers</p>
                </div>
                <div style="background-color: #27272a; border-radius: 12px; padding: 16px; text-align: center;">
                    <p style="color: #f97316; font-size: 28px; font-weight: bold; margin: 0;">${stats.streak}🔥</p>
                    <p style="color: #a1a1aa; font-size: 13px; margin: 4px 0 0 0;">Day Streak</p>
                </div>
            </div>

            ${pendingFollowUps > 0 ? `
            <div style="background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 16px; margin-top: 20px;">
                <p style="color: #f59e0b; font-size: 14px; margin: 0;">
                    ⏰ You have <strong>${pendingFollowUps}</strong> application${pendingFollowUps > 1 ? 's' : ''} waiting for follow-up
                </p>
            </div>
            ` : `
            <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px; margin-top: 20px;">
                <p style="color: #10b981; font-size: 14px; margin: 0;">
                    ✓ All caught up! No pending follow-ups.
                </p>
            </div>
            `}

            <!-- CTA Button -->
            <a href="https://trackjobflow.com/analytics" style="display: block; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; text-align: center; margin-top: 20px;">
                View Full Analytics →
            </a>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #27272a;">
            <p style="color: #71717a; font-size: 12px; margin: 0 0 8px 0;">
                You're receiving this weekly digest because you enabled email reminders.
            </p>
            <a href="https://trackjobflow.com/settings" style="color: #52525b; font-size: 12px; text-decoration: none;">
                Manage email preferences
            </a>
        </div>
    </div>
</body>
</html>
        `,
    }),
};

// Send welcome email
export async function sendWelcomeEmail(to: string, userName?: string) {
    const resend = getResend();
    if (!resend) {
        console.log('RESEND_API_KEY not configured, skipping email');
        return { success: false, error: 'Email not configured' };
    }

    try {
        const template = emailTemplates.welcome(userName || '');
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: template.subject,
            html: template.html,
        });

        if (error) {
            console.error('Failed to send welcome email:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error };
    }
}

// Send follow-up reminder email
export async function sendFollowUpReminderEmail(
    to: string,
    userName: string,
    applications: { company: string; role: string; daysSince: number }[]
) {
    const resend = getResend();
    if (!resend) {
        console.log('RESEND_API_KEY not configured, skipping email');
        return { success: false, error: 'Email not configured' };
    }

    if (applications.length === 0) {
        return { success: false, error: 'No applications to remind about' };
    }

    try {
        const template = emailTemplates.followUpReminder(userName, applications);
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: template.subject,
            html: template.html,
        });

        if (error) {
            console.error('Failed to send follow-up reminder:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error sending follow-up reminder:', error);
        return { success: false, error };
    }
}

// Send weekly digest email
export async function sendWeeklyDigestEmail(
    to: string,
    userName: string,
    stats: { applied: number; interviews: number; offers: number; streak: number },
    pendingFollowUps: number
) {
    const resend = getResend();
    if (!resend) {
        console.log('RESEND_API_KEY not configured, skipping email');
        return { success: false, error: 'Email not configured' };
    }

    try {
        const template = emailTemplates.weeklyDigest(userName, stats, pendingFollowUps);
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: template.subject,
            html: template.html,
        });

        if (error) {
            console.error('Failed to send weekly digest:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error sending weekly digest:', error);
        return { success: false, error };
    }
}
