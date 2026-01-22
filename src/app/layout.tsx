import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import { DataMigration } from "@/components/data-migration";
import { ToastProvider } from "@/components/toast";
import JsonLd from "@/components/json-ld";

const instrumentSans = Instrument_Sans({
    subsets: ["latin"],
    variable: "--font-geist-sans",
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "JobFlow | Free Job Application Tracker & Organizer",
    description: "Track your job applications, manage your pipeline, and land your dream job faster. Free job search tracker with Kanban board, analytics, and gamification.",
    keywords: ["job application tracker", "job search organizer", "application tracker", "job hunt tracker", "career tracker", "job pipeline", "job search app"],
    authors: [{ name: "JobFlow" }],
    creator: "JobFlow",
    publisher: "JobFlow",
    metadataBase: new URL("https://trackjobapplications.vercel.app"),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "JobFlow | Free Job Application Tracker",
        description: "Track your job applications, manage your pipeline, and land your dream job faster. Free with Kanban board & analytics.",
        url: "https://trackjobapplications.vercel.app",
        siteName: "JobFlow",
        locale: "en_US",
        type: "website",
        images: [
            {
                url: "/api/og",
                width: 1200,
                height: 630,
                alt: "JobFlow - Job Application Tracker",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "JobFlow | Free Job Application Tracker",
        description: "Track your job applications and land your dream job faster. Free with Kanban board & analytics.",
        images: ["/api/og"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/favicon.svg",
        shortcut: "/favicon.svg",
        apple: "/favicon.svg",
    },
    manifest: "/manifest.json",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
                <JsonLd />
            </head>
            <body
                className={`${instrumentSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-zinc-950 text-white`}
            ><StackProvider app={stackClientApp}><StackTheme>
                <Providers>
                    <ToastProvider>
                        <DataMigration />
                        {children}
                    </ToastProvider>
                </Providers>
                <Analytics />
            </StackTheme></StackProvider></body>
        </html>
    );
}


