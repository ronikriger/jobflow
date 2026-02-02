export default function JsonLd() {
    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "name": "JobFlow",
                "url": "https://trackjobflow.com",
                "description": "Free job application tracker with Kanban board, analytics, and gamification to help you land your dream job faster."
            },
            {
                "@type": "SoftwareApplication",
                "name": "JobFlow",
                "applicationCategory": "ProductivityApplication",
                "operatingSystem": "Web",
                "url": "https://trackjobflow.com",
                "offers": [
                    {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD",
                        "name": "Free Plan",
                        "description": "Track up to 20 job applications"
                    },
                    {
                        "@type": "Offer",
                        "price": "0.99",
                        "priceCurrency": "USD",
                        "priceSpecification": {
                            "@type": "UnitPriceSpecification",
                            "price": "0.99",
                            "priceCurrency": "USD",
                            "billingDuration": "P1M"
                        },
                        "name": "Pro Plan",
                        "description": "Unlimited applications with advanced analytics"
                    }
                ],
                "description": "Track your job applications, manage your pipeline, and land your dream job faster.",
                "screenshot": "https://trackjobflow.com/api/og",
                "featureList": [
                    "Job Application Tracking",
                    "Kanban Pipeline Board",
                    "Analytics Dashboard",
                    "Goal Setting & Streaks",
                    "Export to CSV & PDF"
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
                            "text": "Yes, JobFlow has a generous free tier that lets you track up to 20 active applications with basic analytics and goal tracking."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "What does the Pro plan include?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "The Pro plan ($0.99/month) includes unlimited applications, advanced funnel analytics, platform performance stats, CSV and PDF exports, and priority support."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Is my data private and secure?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Absolutely. Your data is encrypted and stored securely. We do not sell your personal information to recruiters or third parties."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Can I import existing job applications?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, you can import applications from a CSV file directly in the settings page."
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
