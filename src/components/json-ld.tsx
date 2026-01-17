export default function JsonLd() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "JobFlow",
        "description": "Track your job applications, manage your pipeline, and land your dream job faster. Free job search tracker with Kanban board, analytics, and gamification.",
        "url": "https://jobflow-app-nu.vercel.app",
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "100"
        },
        "featureList": [
            "Job Application Tracking",
            "Kanban Pipeline Board",
            "Analytics Dashboard",
            "Gamification with XP & Levels",
            "Follow-up Reminders",
            "Contact Management"
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}
