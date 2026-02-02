"use client";

import Link from "next/link";
import { Zap, Twitter } from "lucide-react";

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-zinc-900 py-8 sm:py-12 bg-black">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg sm:text-xl">JobFlow</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-zinc-400">
                        <Link href="/handler/sign-in" className="hover:text-white active:text-white transition-colors py-1">Sign In</Link>
                        <Link href="/#pricing" className="hover:text-white active:text-white transition-colors py-1">Pricing</Link>
                        <Link href="/blog" className="hover:text-white active:text-white transition-colors py-1">Blog</Link>
                    </div>

                    <div className="flex gap-4">
                        <a
                            href="https://twitter.com/joblowhq"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 sm:p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white active:text-white hover:bg-zinc-800 active:bg-zinc-800 transition-all"
                            aria-label="Follow us on Twitter"
                        >
                            <Twitter className="w-4 h-4 sm:w-4 sm:h-4" />
                        </a>
                    </div>
                </div>

                <div className="border-t border-zinc-900 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-xs text-zinc-600">
                    <p>&copy; {year} JobFlow. All rights reserved.</p>
                    <div className="flex gap-4 sm:gap-6">
                        <Link href="/privacy" className="hover:text-zinc-400 active:text-zinc-400 transition-colors py-1">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-zinc-400 active:text-zinc-400 transition-colors py-1">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
