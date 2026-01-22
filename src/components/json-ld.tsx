export default function JsonLd() {
    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": "JobFlow",
                "applicationCategory": "ProductivityApplication",
                "operatingSystem": "Web",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                },
                "description": "Track your job applications, manage your pipeline, and land your dream job faster.",
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "ratingCount": "120"
                },
                "screenshot": "https://trackjobapplications.vercel.app/api/og",
                "featureList": [
                    "Job Application Tracking",
                    "Kanban Pipeline Board",
                    "Analytics Dashboard",
                    "Gamification"
                ]
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Is JobFlow free?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, JobFlow has a generous free tier that lets you track up to 15 active applications."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Is my data private?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Absolutely. Your data is stored securely and we do not sell your personal information."
                        }
                    }
                ]
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}
