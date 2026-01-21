"use client";

import { motion } from "framer-motion";
import { Kanban, BarChart3, Shield, Zap, Target, Sparkles } from "lucide-react";

const features = [
    {
        icon: Kanban,
        title: "Visual Pipeline",
        description: "Drag-and-drop Kanban board to manage applications from 'Saved' to 'Offer'.",
        color: "blue"
    },
    {
        icon: BarChart3,
        title: "Smart Analytics",
        description: "Visualize your conversion rates and find out which platforms work best.",
        color: "purple"
    },
    {
        icon: Target,
        title: "Goal Tracking",
        description: "Set daily and weekly application goals to maintain your momentum.",
        color: "emerald"
    },
    {
        icon: Zap,
        title: "Browser Extension",
        description: "Save jobs from LinkedIn and Indeed with a single click (Coming Soon).",
        color: "amber"
    },
    {
        icon: Sparkles,
        title: "AI Analysis",
        description: "Get insights on your resume match for specific job descriptions.",
        color: "pink"
    },
    {
        icon: Shield,
        title: "Private & Secure",
        description: "Your data is yours. We don't sell your personal information.",
        color: "indigo"
    }
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-zinc-900/50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to get hired</h2>
                    <p className="text-zinc-400">Stop using messy spreadsheets. JobFlow gives you a dedicated workspace to organize your entire job search.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${feature.color}-500/10 text-${feature.color}-500`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-zinc-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
