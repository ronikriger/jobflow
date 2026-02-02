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
        title: "Streaks & XP",
        description: "Stay motivated with gamification. Build streaks, earn XP, and level up.",
        color: "amber"
    },
    {
        icon: Sparkles,
        title: "Follow-up Reminders",
        description: "Never miss a follow-up opportunity. Get notified when applications go stale.",
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
        <section id="features" className="py-16 sm:py-24 bg-zinc-900/50">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Everything you need to get hired</h2>
                    <p className="text-sm sm:text-base text-zinc-400 px-2">Stop using messy spreadsheets. JobFlow gives you a dedicated workspace to organize your entire job search.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors active:scale-[0.98]"
                        >
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 bg-${feature.color}-500/10 text-${feature.color}-500`}>
                                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2">{feature.title}</h3>
                            <p className="text-sm sm:text-base text-zinc-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
