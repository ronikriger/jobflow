export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    date: string;
    category: string;
    categoryColor: string;
    readTime: string;
    author: string;
}

export const blogPosts: BlogPost[] = [
    {
        slug: "how-to-track-job-applications",
        title: "How to Track Job Applications in 2026: Complete Guide",
        description: "Learn the best methods for organizing your job search, from spreadsheets to dedicated trackers. Stop losing track of where you applied.",
        date: "2026-01-28",
        category: "Guide",
        categoryColor: "blue",
        readTime: "8 min read",
        author: "JobFlow Team",
    },
    {
        slug: "job-application-tracker-comparison",
        title: "Best Job Application Trackers 2026: Comparison & Reviews",
        description: "We compared the top job tracking tools including Notion, spreadsheets, Huntr, and JobFlow. See which one fits your workflow.",
        date: "2026-01-30",
        category: "Comparison",
        categoryColor: "purple",
        readTime: "10 min read",
        author: "JobFlow Team",
    },
    {
        slug: "follow-up-email-after-application",
        title: "How to Write a Follow-Up Email After a Job Application",
        description: "Templates and tips for following up on job applications without being annoying. When to send, what to say, and common mistakes.",
        date: "2026-02-01",
        category: "Templates",
        categoryColor: "emerald",
        readTime: "6 min read",
        author: "JobFlow Team",
    },
    {
        slug: "how-many-jobs-should-i-apply-to-per-day",
        title: "How Many Jobs Should I Apply to Per Day? The Data-Backed Answer",
        description: "Is 10 applications a day too many? Too few? We analyzed real job search data to find the optimal number of daily applications for success.",
        date: "2026-02-02",
        category: "Strategy",
        categoryColor: "amber",
        readTime: "7 min read",
        author: "JobFlow Team",
    },
];

export function getBlogPost(slug: string): BlogPost | undefined {
    return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
    return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
