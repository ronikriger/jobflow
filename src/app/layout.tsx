import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";
import { CommandPalette } from "@/components/command-palette";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: '#09090b' }}>
      <body
        className={`${instrumentSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        style={{ backgroundColor: '#09090b', color: '#fafafa', minHeight: '100vh' }}
      >
        <Providers>
          <div className="flex min-h-screen" style={{ backgroundColor: '#09090b' }}>
            <Sidebar />
            <main className="flex-1 overflow-auto" style={{ backgroundColor: '#09090b' }}>
              {children}
            </main>
          </div>
          <CommandPalette />
        </Providers>
      </body>
    </html>
  );
}
