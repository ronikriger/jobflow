import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

// This endpoint is called by Stack Auth webhook or manually to send welcome email
export async function POST(req: NextRequest) {
    try {
        const { email, name } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const result = await sendWelcomeEmail(email, name);

        if (result.success) {
            return NextResponse.json({ success: true, message: 'Welcome email sent' });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in welcome email endpoint:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
