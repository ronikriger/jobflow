"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, TrendingUp, Users, Sparkles } from "lucide-react";

const COMPANIES = [
    "Google", "Meta", "Amazon", "Apple", "Microsoft", "Netflix", "Stripe", "Shopify",
    "Airbnb", "Uber", "Spotify", "LinkedIn", "Twitter", "Figma", "Notion", "Vercel",
    "Coinbase", "Robinhood", "Square", "Twilio", "Slack", "Zoom", "Dropbox", "Atlassian"
];

const NAMES = [
    "Sarah", "James", "Emily", "Michael", "Jessica", "David", "Ashley", "Chris",
    "Amanda", "Josh", "Nicole", "Matt", "Rachel", "Alex", "Lauren", "Ryan",
    "Priya", "Marcus", "Lisa", "Kevin", "Emma", "Daniel", "Sofia", "Andrew"
];

const ACTIONS = [
    { text: "just added an application to", emoji: "📝" },
    { text: "moved to interview stage at", emoji: "🎯" },
    { text: "got a response from", emoji: "📬" },
    { text: "scheduled an interview with", emoji: "📅" },
    { text: "received an offer from", emoji: "🎉" },
];

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateActivity() {
    return {
        id: Math.random(),
        name: getRandomItem(NAMES),
        action: getRandomItem(ACTIONS),
        company: getRandomItem(COMPANIES),
        timeAgo: Math.floor(Math.random() * 5) + 1,
    };
}

export function LiveActivity() {
    const [activities, setActivities] = useState<ReturnType<typeof generateActivity>[]>([]);
    const [stats, setStats] = useState({
        usersToday: 18,
        appsTracked: 127,
        offersLanded: 3,
    });

    // Initialize with some activities
    useEffect(() => {
        setActivities([generateActivity(), generateActivity(), generateActivity()]);
    }, []);

    // Add new activity every few seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActivities(prev => {
                const newActivity = generateActivity();
                const updated = [newActivity, ...prev.slice(0, 4)];
                return updated;
            });

            // Occasionally bump stats
            if (Math.random() > 0.7) {
                setStats(prev => ({
                    ...prev,
                    appsTracked: prev.appsTracked + Math.floor(Math.random() * 3) + 1,
                }));
            }
        }, 4000 + Math.random() * 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-10 sm:py-16 bg-gradient-to-b from-black to-zinc-900/50">
            <div className="container mx-auto px-4 sm:px-6">
                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-16 mb-8 sm:mb-12"
                >
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold text-white">{stats.usersToday}+</p>
                            <p className="text-[10px] sm:text-xs text-zinc-500">Active today</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10">
                            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold text-white">{stats.appsTracked.toLocaleString()}</p>
                            <p className="text-[10px] sm:text-xs text-zinc-500">Apps tracked</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10">
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold text-white">{stats.offersLanded}</p>
                            <p className="text-[10px] sm:text-xs text-zinc-500">Offers this week</p>
                        </div>
                    </div>
                </motion.div>

                {/* Live Activity Feed */}
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs sm:text-sm text-zinc-400">Live activity</span>
                    </div>

                    <div className="space-y-2 sm:space-y-3 min-h-[180px] sm:min-h-[200px]">
                        <AnimatePresence mode="popLayout">
                            {activities.map((activity) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20, height: 0 }}
                                    animate={{ opacity: 1, x: 0, height: "auto" }}
                                    exit={{ opacity: 0, x: 20, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-zinc-900/50 border border-zinc-800/50"
                                >
                                    <span className="text-lg sm:text-xl">{activity.action.emoji}</span>
                                    <p className="text-xs sm:text-sm text-zinc-300 flex-1 min-w-0">
                                        <span className="font-medium text-white">{activity.name}</span>{" "}
                                        <span className="hidden sm:inline">{activity.action.text}</span>
                                        <span className="sm:hidden">→</span>{" "}
                                        <span className="font-medium text-white">{activity.company}</span>
                                    </p>
                                    <span className="text-[10px] sm:text-xs text-zinc-500 shrink-0">
                                        {activity.timeAgo}m
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
