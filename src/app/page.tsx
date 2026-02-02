import { Hero } from "@/components/landing-page/hero";
import { LiveActivity } from "@/components/landing-page/live-activity";
import { InteractiveDemo } from "@/components/landing-page/interactive-demo";
import { Features } from "@/components/landing-page/features";
import { Testimonials } from "@/components/landing-page/testimonials";
import { Pricing } from "@/components/landing-page/pricing";
import { FAQ } from "@/components/landing-page/faq";
import { Footer } from "@/components/landing-page/footer";
import { ExitPopup } from "@/components/landing-page/exit-popup";

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            <Hero />
            <LiveActivity />
            <div id="demo">
                <InteractiveDemo />
            </div>
            <Features />
            <Testimonials />
            <Pricing />
            <FAQ />
            <Footer />
            <ExitPopup />
        </main>
    );
}
