"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const questions = [
    {
        q: "Is JobFlow really free?",
        a: "Yes! The core features including the Kanban board, basic analytics, and application tracking are free forever for up to 15 active applications. You can archive old applications to free up space."
    },
    {
        q: "What does the Pro plan include?",
        a: "The Pro plan ($0.99/mo) unlocks unlimited active applications, advanced analytics (funnel chart, platform breakdown), PDF/CSV exports, and priority support features."
    },
    {
        q: "Can I import my existing applications?",
        a: "Absolutely. You can import applications from a CSV file directly in the settings page."
    },
    {
        q: "Is my data safe?",
        a: "Your privacy is our top priority. We do not sell your data to recruiters or third parties. Your job search is your business."
    },
    {
        q: "How does the browser extension work?",
        a: "The JobFlow extension (coming soon) lets you save jobs from LinkedIn, Indeed, and other major job boards with a single click, automatically populating the company and role details."
    }
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24 bg-zinc-900/50">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-zinc-400">Have a question? We&apos;re here to help.</p>
                </div>

                <div className="space-y-4">
                    {questions.map((item, i) => (
                        <div
                            key={i}
                            className="border border-zinc-800 rounded-2xl bg-zinc-900 overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className="font-medium text-lg">{item.q}</span>
                                {openIndex === i ? (
                                    <Minus className="w-5 h-5 text-zinc-400" />
                                ) : (
                                    <Plus className="w-5 h-5 text-zinc-400" />
                                )}
                            </button>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 text-zinc-400">
                                            {item.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
