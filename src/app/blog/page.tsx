import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Job Search Insights & Tips | JobFlow Blog",
    description: "Expert advice on job hunting, resume optimization, and interview preparation.",
};

export default function BlogIndex() {
    return (
        <main className="min-h-screen bg-black text-white p-8 md:p-12">
            <div className="max-w-4xl mx-auto space-y-12">
                <header className="space-y-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Job Search Insights</h1>
                    <p className="text-xl text-zinc-400">Tips, tricks, and strategies to land your next role.</p>
                </header>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Placeholder for actual blog posts */}
                    <article className="group cursor-pointer space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:bg-zinc-900/50 hover:border-zinc-700">
                        <div className="space-y-2">
                            <span className="text-xs font-medium text-blue-400">Guide</span>
                            <h2 className="text-2xl font-bold group-hover:text-blue-400 transition-colors">How to Track Applications Effectively</h2>
                        </div>
                        <p className="text-zinc-400">Stop using spreadsheets. Learn how a dedicated tracker improves your response rate.</p>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <span>5 min read</span>
                            <span>•</span>
                            <span>Coming Soon</span>
                        </div>
                    </article>

                    <article className="group cursor-pointer space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:bg-zinc-900/50 hover:border-zinc-700">
                        <div className="space-y-2">
                            <span className="text-xs font-medium text-emerald-400">Interview Prep</span>
                            <h2 className="text-2xl font-bold group-hover:text-emerald-400 transition-colors">The Art of the Follow-up</h2>
                        </div>
                        <p className="text-zinc-400">When and how to follow up without being annoying. Templates included.</p>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <span>7 min read</span>
                            <span>•</span>
                            <span>Coming Soon</span>
                        </div>
                    </article>
                </div>
            </div>
        </main>
    );
}
