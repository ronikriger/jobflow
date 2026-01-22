import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const streak = searchParams.get('streak') || '0';
        const applications = searchParams.get('apps') || '0';
        const level = searchParams.get('level') || '1';
        const name = searchParams.get('name') || 'Job Seeker';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundImage: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
                        fontFamily: 'sans-serif',
                    }}
                >
                    {/* Background glow */}
                    <div
                        style={{
                            position: 'absolute',
                            width: '600px',
                            height: '600px',
                            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                            top: '-100px',
                            right: '-100px',
                        }}
                    />

                    {/* Main content */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '40px',
                            padding: '60px',
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                            }}
                        >
                            <div
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <span style={{ fontSize: '28px', color: '#888', fontWeight: 500 }}>
                                {name}&apos;s Job Hunt
                            </span>
                        </div>

                        {/* Stats Grid */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '40px',
                            }}
                        >
                            {/* Streak */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '30px 50px',
                                    background: 'rgba(249, 115, 22, 0.1)',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(249, 115, 22, 0.2)',
                                }}
                            >
                                <span style={{ fontSize: '64px', fontWeight: 800, color: '#f97316' }}>
                                    {streak}
                                </span>
                                <span style={{ fontSize: '20px', color: '#f97316', opacity: 0.8 }}>
                                    Day Streak 🔥
                                </span>
                            </div>

                            {/* Applications */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '30px 50px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                }}
                            >
                                <span style={{ fontSize: '64px', fontWeight: 800, color: '#3b82f6' }}>
                                    {applications}
                                </span>
                                <span style={{ fontSize: '20px', color: '#3b82f6', opacity: 0.8 }}>
                                    Applications 📝
                                </span>
                            </div>

                            {/* Level */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '30px 50px',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                }}
                            >
                                <span style={{ fontSize: '64px', fontWeight: 800, color: '#8b5cf6' }}>
                                    {level}
                                </span>
                                <span style={{ fontSize: '20px', color: '#8b5cf6', opacity: 0.8 }}>
                                    Level ⚡
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#666',
                                fontSize: '18px',
                            }}
                        >
                            <span>Track your job search at</span>
                            <span style={{ color: '#3b82f6', fontWeight: 600 }}>trackjobapplications.vercel.app</span>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, { status: 500 });
    }
}
