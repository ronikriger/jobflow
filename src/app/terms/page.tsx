import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
    title: "Terms of Service | JobFlow",
    description: "JobFlow's terms of service. Read our terms and conditions for using the job application tracker.",
    alternates: {
        canonical: "/terms",
    },
};

export default function TermsOfService() {
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

                <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
                <p className="text-zinc-400 mb-12">Last updated: February 1, 2026</p>

                <div className="prose prose-invert prose-zinc max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            By accessing or using JobFlow (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of
                            Service. If you do not agree to these terms, please do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            JobFlow is a job application tracking platform that helps users organize and manage
                            their job search. The Service includes features such as application tracking, analytics,
                            goal setting, and progress tracking.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">
                            To use certain features of the Service, you must create an account. You agree to:
                        </p>
                        <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Notify us immediately of any unauthorized access</li>
                            <li>Be responsible for all activities under your account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Free and Paid Plans</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">
                            JobFlow offers both free and paid subscription plans:
                        </p>
                        <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                            <li><strong>Free Plan:</strong> Limited to 20 active applications with basic features</li>
                            <li><strong>Pro Plan:</strong> Unlimited applications with advanced analytics and features ($0.99/month)</li>
                        </ul>
                        <p className="text-zinc-300 leading-relaxed mt-4">
                            Paid subscriptions are billed monthly. You may cancel at any time, and your subscription
                            will remain active until the end of the current billing period.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            Payments are processed securely through Stripe. By subscribing to a paid plan, you
                            authorize us to charge your payment method on a recurring basis. All fees are
                            non-refundable except as required by law or at our sole discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. User Conduct</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">You agree not to:</p>
                        <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                            <li>Use the Service for any unlawful purpose</li>
                            <li>Attempt to gain unauthorized access to any part of the Service</li>
                            <li>Interfere with or disrupt the Service</li>
                            <li>Upload malicious code or content</li>
                            <li>Impersonate others or misrepresent your affiliation</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            The Service and its original content, features, and functionality are owned by
                            JobFlow and are protected by international copyright, trademark, and other
                            intellectual property laws. Your data remains yours—we claim no ownership over
                            the content you create or upload.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Data and Privacy</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            Your use of the Service is also governed by our{" "}
                            <Link href="/privacy" className="text-blue-400 hover:underline">
                                Privacy Policy
                            </Link>
                            . By using the Service, you consent to the collection and use of information as
                            described in the Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            The Service is provided &ldquo;as is&rdquo; without warranties of any kind, either express or
                            implied. We do not warrant that the Service will be uninterrupted, error-free, or
                            free of harmful components. We do not guarantee job placement or employment outcomes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            To the maximum extent permitted by law, JobFlow shall not be liable for any indirect,
                            incidental, special, consequential, or punitive damages, or any loss of profits or
                            revenues, whether incurred directly or indirectly.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            We may terminate or suspend your account and access to the Service immediately,
                            without prior notice, for conduct that we believe violates these Terms or is
                            harmful to other users, us, or third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            We reserve the right to modify these Terms at any time. We will notify users of
                            significant changes by posting a notice on the Service. Continued use of the
                            Service after changes constitutes acceptance of the new Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">13. Contact</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            If you have questions about these Terms, please contact us at{" "}
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
