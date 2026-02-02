import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy | JobFlow",
    description: "JobFlow's privacy policy. Learn how we collect, use, and protect your personal information.",
    alternates: {
        canonical: "/privacy",
    },
};

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-black text-white">
            <div className="max-w-3xl mx-auto px-4 py-16">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-zinc-400 mb-12">Last updated: February 1, 2026</p>

                <div className="prose prose-invert prose-zinc max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">
                            When you use JobFlow, we collect information you provide directly to us:
                        </p>
                        <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                            <li>Account information (email address, name) when you sign up</li>
                            <li>Job application data you enter (company names, roles, statuses, notes)</li>
                            <li>Settings and preferences you configure</li>
                            <li>Payment information (processed securely by Stripe)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                            <li>Provide, maintain, and improve JobFlow</li>
                            <li>Process transactions and send related information</li>
                            <li>Send technical notices, updates, and support messages</li>
                            <li>Respond to your comments and questions</li>
                            <li>Analyze usage patterns to improve user experience</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            We implement appropriate security measures to protect your personal information.
                            Your data is encrypted in transit and at rest. We use industry-standard security
                            practices and regularly review our security procedures.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">
                            We do not sell, trade, or rent your personal information to third parties.
                            We may share your information only in the following circumstances:
                        </p>
                        <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                            <li>With your consent</li>
                            <li>With service providers who assist in our operations (e.g., Stripe for payments)</li>
                            <li>To comply with legal obligations</li>
                            <li>To protect our rights and prevent fraud</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">You have the right to:</p>
                        <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                            <li>Access the personal data we hold about you</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Export your data in a portable format</li>
                            <li>Withdraw consent at any time</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Cookies and Analytics</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            We use Vercel Analytics to understand how users interact with JobFlow.
                            This helps us improve the service. You can disable cookies in your browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            We retain your data for as long as your account is active or as needed to provide
                            services. You can delete your account and associated data at any time from the settings page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            We may update this privacy policy from time to time. We will notify you of any
                            changes by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            If you have questions about this Privacy Policy, please contact us at{" "}
                            <a href="mailto:support@trackjobflow.com" className="text-blue-400 hover:underline">
                                support@trackjobflow.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
