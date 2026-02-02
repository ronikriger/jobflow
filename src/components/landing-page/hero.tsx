"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Play, Users, Sparkles } from "lucide-react";

export function Hero() {
    return (
        <section className="relative pt-24 pb-12 md:pt-40 md:pb-24 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/20 blur-[120px] rounded-full mix-blend-screen opacity-50" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen opacity-50" />

            <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
                {/* Social Proof Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-medium border border-emerald-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>876 people tracking right now</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs sm:text-sm font-medium border border-amber-500/20">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Free while in beta</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">Stop Guessing.</span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Start Getting Hired.</span>
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
                        The visual job tracker that helps you stay organized, motivated, and on top of every application.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2"
                >
                    <Link
                        href="/home"
                        className="group w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-base sm:text-lg transition-all hover:scale-105 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 min-h-[56px]"
                    >
                        <Sparkles className="w-5 h-5" />
                        Try Free – No Signup Required
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="#demo"
                        className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-white font-semibold text-base sm:text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 min-h-[56px]"
                    >
                        <Play className="w-5 h-5" />
                        See Demo
                    </Link>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-8 sm:mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-x-8 sm:gap-y-4 text-xs sm:text-sm text-zinc-500"
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        No credit card required
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        20 applications free
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Works on any device
                    </span>
                </motion.div>
            </div>
        </section>
    );
}
