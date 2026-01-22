"use client";

import { useState } from "react";
import { Share2, Download, Check, ExternalLink } from "lucide-react";
import { useUserProgress, useApplications } from "@/lib/hooks";

export function ShareProgress() {
    const [copied, setCopied] = useState(false);
    const progress = useUserProgress();
    const { apps } = useApplications();

    const streak = progress?.currentStreak ?? 0;
    const level = progress?.level ?? 1;
    const appCount = apps?.length ?? 0;

    const imageUrl = `https://trackjobapplications.vercel.app/api/stats-image?streak=${streak}&apps=${appCount}&level=${level}`;
    const shareUrl = "https://trackjobapplications.vercel.app";

    const shareText = `🔥 ${streak} day streak | 📝 ${appCount} applications tracked | ⚡ Level ${level}

I'm tracking my job search with JobFlow - a free app that makes the grind feel like a game.

${shareUrl}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleShareTwitter = () => {
        const tweetText = encodeURIComponent(shareText);
        window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
    };

    const handleShareLinkedIn = () => {
        const linkedInUrl = encodeURIComponent(shareUrl);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${linkedInUrl}`, '_blank');
    };

    const handleDownloadImage = () => {
        window.open(imageUrl, '_blank');
    };

    return (
        <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
            <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2" style={{ color: 'white' }}>
                    <Share2 className="w-5 h-5" style={{ color: '#3b82f6' }} />
                    Share Your Progress
                </h3>
            </div>

            <p className="text-sm" style={{ color: '#71717a' }}>
                Show off your commitment! Share your stats on social media.
            </p>

            {/* Preview */}
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#27272a' }}>
                <img
                    src={imageUrl}
                    alt="Your JobFlow Stats"
                    className="w-full"
                    style={{ aspectRatio: '1200/630' }}
                />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleShareTwitter}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all"
                    style={{ backgroundColor: '#1d9bf0', color: 'white' }}
                >
                    <ExternalLink className="w-4 h-4" />
                    Share on X
                </button>

                <button
                    onClick={handleShareLinkedIn}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all"
                    style={{ backgroundColor: '#0a66c2', color: 'white' }}
                >
                    <ExternalLink className="w-4 h-4" />
                    LinkedIn
                </button>

                <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all"
                    style={{ backgroundColor: '#27272a', color: 'white' }}
                >
                    {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy Text"}
                </button>

                <button
                    onClick={handleDownloadImage}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all"
                    style={{ backgroundColor: '#27272a', color: 'white' }}
                >
                    <Download className="w-4 h-4" />
                    Download
                </button>
            </div>
        </div>
    );
}
