import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { notFound } from "next/navigation";
import { getBlogPost, getAllBlogPosts } from "@/lib/blog";
import { blogContent } from "./content";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const posts = getAllBlogPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = getBlogPost(slug);

    if (!post) {
        return { title: "Post Not Found" };
    }

    return {
        title: post.title,
        description: post.description,
        alternates: {
            canonical: `/blog/${slug}`,
        },
        openGraph: {
            title: post.title,
            description: post.description,
            type: "article",
            publishedTime: post.date,
            authors: [post.author],
            url: `https://trackjobflow.com/blog/${slug}`,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.description,
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = getBlogPost(slug);

    if (!post) {
        notFound();
    }

    const content = blogContent[slug as keyof typeof blogContent];

    if (!content) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <article className="max-w-3xl mx-auto px-4 py-16">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blog
                </Link>

                <header className="mb-12">
                    <span
                        className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-4 ${post.categoryColor === "blue"
                                ? "bg-blue-500/10 text-blue-400"
                                : post.categoryColor === "purple"
                                    ? "bg-purple-500/10 text-purple-400"
                                    : post.categoryColor === "emerald"
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-zinc-500/10 text-zinc-400"
                            }`}
                    >
                        {post.category}
                    </span>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                        {post.title}
                    </h1>

                    <p className="text-xl text-zinc-400 mb-6">{post.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                                {new Date(post.date).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime}</span>
                        </div>
                    </div>
                </header>

                <div className="prose prose-invert prose-zinc prose-lg max-w-none">
                    {content}
                </div>

                {/* CTA */}
                <div className="mt-16 rounded-2xl border border-zinc-800 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 text-center">
                    <h2 className="text-2xl font-bold mb-3">Ready to organize your job search?</h2>
                    <p className="text-zinc-400 mb-6">
                        Track all your applications in one place with JobFlow. Free to start.
                    </p>
                    <Link
                        href="/home"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
                    >
                        Start Tracking Free
                    </Link>
                </div>
            </article>
        </main>
    );
}
