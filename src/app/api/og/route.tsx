import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // ?title=<title>
        const hasTitle = searchParams.has('title');
        const title = hasTitle
            ? searchParams.get('title')?.slice(0, 100)
            : 'JobFlow | Track Your Job Search';

        // ?description=<description>
        const hasDescription = searchParams.has('description');
        const description = hasDescription
            ? searchParams.get('description')?.slice(0, 200)
            : 'Organize your applications, track your progress, and land your dream job.';

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
                        backgroundImage: 'linear-gradient(to bottom right, #000000, #111111)',
                        color: 'white',
                        fontFamily: 'sans-serif',
                        position: 'relative',
                    }}
                >
                    {/* Background Pattern */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: 'radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)',
                            backgroundSize: '100px 100px',
                            opacity: 0.2,
                        }}
                    />

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '40px',
                            textAlign: 'center',
                            zIndex: 10,
                        }}
                    >
                        {/* Logo/Icon */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '80px',
                                height: '80px',
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                marginBottom: '40px',
                                boxShadow: '0 0 50px -10px rgba(59, 130, 246, 0.5)',
                            }}
                        >
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>

                        <div
                            style={{
                                fontSize: 60,
                                fontWeight: 900,
                                background: 'linear-gradient(90deg, #fff, #aaa)',
                                backgroundClip: 'text',
                                color: 'transparent',
                                lineHeight: 1.1,
                                marginBottom: '20px',
                                letterSpacing: '-2px',
                            }}
                        >
                            {title}
                        </div>

                        <div
                            style={{
                                fontSize: 30,
                                color: '#888',
                                maxWidth: '800px',
                                lineHeight: 1.4,
                            }}
                        >
                            {description}
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
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
