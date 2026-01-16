import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import { DataMigration } from "@/components/data-migration";

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
    title: "JobFlow | Track Your Job Search",
    description: "Premium job application tracker with gamification",
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
            <body
                className={`${instrumentSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-zinc-950 text-white`}
            ><StackProvider app={stackClientApp}><StackTheme>
                <Providers>
                    <DataMigration />
                    {children}
                </Providers>
                <Analytics />
            </StackTheme></StackProvider></body>
        </html>
    );
}


