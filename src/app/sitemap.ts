import { MetadataRoute } from "next";

const BASE_URL = "https://trackjobflow.com";

export default function sitemap(): MetadataRoute.Sitemap {
    const currentDate = new Date().toISOString().split("T")[0];

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: currentDate,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/blog`,
            lastModified: currentDate,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/privacy`,
            lastModified: currentDate,
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: currentDate,
            changeFrequency: "monthly",
            priority: 0.3,
        },
    ];

    // Blog posts - add here as you create them
    const blogPosts = [
        { slug: "how-to-track-job-applications", date: "2026-01-28" },
        { slug: "job-application-tracker-comparison", date: "2026-01-30" },
        { slug: "follow-up-email-after-application", date: "2026-02-01" },
        { slug: "how-many-jobs-should-i-apply-to-per-day", date: "2026-02-02" },
    ];

    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.date,
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    return [...staticPages, ...blogPages];
}
