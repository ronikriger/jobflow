import { Hero } from "@/components/landing-page/hero";
import { Features } from "@/components/landing-page/features";
import { Pricing } from "@/components/landing-page/pricing";
import { FAQ } from "@/components/landing-page/faq";
import { Footer } from "@/components/landing-page/footer";

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            <Hero />
            <Features />
            <Pricing />
            <FAQ />
            <Footer />
        </main>
    );
}
