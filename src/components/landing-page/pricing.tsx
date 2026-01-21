"use client";

import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "Everything you need to organize your search.",
        features: [
            "Track up to 15 active applications",
            "Kanban board workflow",
            "Basic job search analytics",
            "Goal tracking & streaks",
            "Chrome extension access"
        ],
        cta: "Get Started Free",
        href: "/home",
        popular: false
    },
    {
        name: "Pro",
        price: "$0.99",
        period: "/month",
        description: "Power tools for serious job seekers.",
        features: [
            "Unlimited applications",
            "Advanced Funnel Analysis",
            "Platform Performance Stats",
            "Export to CSV & PDF",
            "Priority Support Badge",
            "Resume Keyword Matcher (Soon)"
        ],
        cta: "Upgrade to Pro",
        href: "/home", // Redirects to app where they can upgrade
        popular: true
    }
];

export function Pricing() {
    return (
        <section id="pricing" className="py-24">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
                    <p className="text-zinc-400">Start for free, upgrade when you need more power.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`relative p-8 rounded-3xl border ${plan.popular ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-800 bg-zinc-900/50'}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-blue-500 text-white text-sm font-medium">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-zinc-400 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    {plan.period && <span className="text-zinc-500">{plan.period}</span>}
                                </div>
                                <p className="mt-4 text-zinc-400 text-sm">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, j) => (
                                    <li key={j} className="flex items-center gap-3">
                                        <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                        <span className="text-zinc-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                className={`block w-full py-3 rounded-xl text-center font-semibold transition-all ${plan.popular
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                    : 'bg-white text-black hover:bg-zinc-200'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
