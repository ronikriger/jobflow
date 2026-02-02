import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllBlogPosts } from "@/lib/blog";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Job Search Tips & Insights | JobFlow Blog",
    description: "Expert advice on job hunting, application tracking, resume optimization, and interview preparation. Learn how to land your dream job faster.",
    alternates: {
        canonical: "/blog",
    },
    openGraph: {
        title: "Job Search Tips & Insights | JobFlow Blog",
        description: "Expert advice on job hunting, application tracking, and landing your dream job.",
        url: "https://trackjobflow.com/blog",
    },
};

export default function BlogIndex() {
    const posts = getAllBlogPosts();

    return (
        <main className="min-h-screen bg-black text-white p-8 md:p-12">
            <div className="max-w-4xl mx-auto space-y-12">
                <header className="space-y-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Job Search Insights
                    </h1>
                    <p className="text-xl text-zinc-400">
                        Tips, strategies, and guides to help you land your next role.
                    </p>
                </header>

                <div className="grid gap-8 md:grid-cols-2">
                    {posts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="group space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:bg-zinc-900/50 hover:border-zinc-700 hover:-translate-y-1"
                        >
                            <div className="space-y-2">
                                <span
                                    className={`text-xs font-medium ${post.categoryColor === "blue"
                                            ? "text-blue-400"
                                            : post.categoryColor === "purple"
                                                ? "text-purple-400"
                                                : post.categoryColor === "emerald"
                                                    ? "text-emerald-400"
                                                    : "text-zinc-400"
                                        }`}
                                >
                                    {post.category}
                                </span>
                                <h2 className="text-2xl font-bold group-hover:text-blue-400 transition-colors">
                                    {post.title}
                                </h2>
                            </div>
                            <p className="text-zinc-400">{post.description}</p>
                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                <span>{post.readTime}</span>
                                <span>•</span>
                                <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 text-center">
                    <h2 className="text-2xl font-bold mb-3">Ready to organize your job search?</h2>
                    <p className="text-zinc-400 mb-6">
                        Stop using messy spreadsheets. Track applications, set goals, and land your dream job faster.
                    </p>
                    <Link
                        href="/home"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
                    >
                        Start Tracking Free
                    </Link>
                </div>
            </div>
        </main>
    );
}
