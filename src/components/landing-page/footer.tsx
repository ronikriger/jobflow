"use client";

import Link from "next/link";
import { Zap, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-zinc-900 py-12 bg-black">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-xl">JobFlow</span>
                    </div>

                    <div className="flex gap-6 text-sm text-zinc-400">
                        <Link href="/home" className="hover:text-white transition-colors">SignIn</Link>
                        <Link href="/home" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="/home" className="hover:text-white transition-colors">Blog</Link>
                    </div>

                    <div className="flex gap-4">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                            <Github className="w-4 h-4" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                            <Twitter className="w-4 h-4" />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                            <Linkedin className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
                    <p>&copy; {year} JobFlow Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
