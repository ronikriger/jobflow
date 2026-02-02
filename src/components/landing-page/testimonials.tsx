"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
    {
        name: "Sarah K.",
        role: "Software Engineer",
        company: "Landed at Stripe",
        content: "I was using a messy spreadsheet before JobFlow. Being able to see my pipeline visually and track which platforms got responses made a huge difference. Got my offer after 47 applications.",
        rating: 5,
    },
    {
        name: "Marcus T.",
        role: "Product Manager",
        company: "Landed at Shopify",
        content: "The gamification actually kept me motivated during a tough job search. Setting daily goals and maintaining my streak made applying feel less like a chore.",
        rating: 5,
    },
    {
        name: "Priya S.",
        role: "UX Designer",
        company: "Landed at Figma",
        content: "What I love is how simple it is. No bloat, no unnecessary features. Just a clean tracker that does exactly what I need. The analytics helped me realize LinkedIn wasn't working for me.",
        rating: 5,
    },
];

export function Testimonials() {
    return (
        <section className="py-16 sm:py-24 bg-black">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                        Loved by job seekers
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-400">
                        Join thousands of people who&apos;ve organized their job search with JobFlow.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
                    {testimonials.map((testimonial, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-zinc-900/50 border border-zinc-800"
                        >
                            {/* Stars */}
                            <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                                {Array.from({ length: testimonial.rating }).map((_, j) => (
                                    <Star
                                        key={j}
                                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-500 text-yellow-500"
                                    />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-sm sm:text-base text-zinc-300 mb-4 sm:mb-6 leading-relaxed">
                                &ldquo;{testimonial.content}&rdquo;
                            </p>

                            {/* Author */}
                            <div>
                                <p className="font-semibold text-white text-sm sm:text-base">{testimonial.name}</p>
                                <p className="text-xs sm:text-sm text-zinc-500">
                                    {testimonial.role} · {testimonial.company}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
