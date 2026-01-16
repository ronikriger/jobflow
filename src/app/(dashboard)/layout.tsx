import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { CommandPalette } from "@/components/command-palette";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen" style={{ backgroundColor: '#09090b' }}>
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-screen sticky top-0">
                <Sidebar />
            </div>

            <main className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: '#09090b' }}>
                {/* Mobile Header */}
                <div className="md:hidden p-4 border-b border-zinc-800 flex items-center gap-4 bg-[#0f0f10] sticky top-0 z-30">
                    <MobileNav />
                    <span className="font-bold text-lg text-white">JobFlow</span>
                </div>

                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </main>
            <CommandPalette />
        </div>
    );
}
