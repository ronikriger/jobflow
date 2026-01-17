import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { stackServerApp } from "@/stack/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get or create user settings
        let userSettings = await prisma.userSettings.findUnique({
            where: { userId: user.id },
        });

        if (!userSettings) {
            userSettings = await prisma.userSettings.create({
                data: { userId: user.id },
            });
        }

        // Check if user already has a Stripe customer
        let customerId = userSettings.stripeCustomerId;

        if (!customerId) {
            // Create a new Stripe customer
            const customer = await stripe.customers.create({
                email: user.primaryEmail || undefined,
                metadata: { userId: user.id },
            });
            customerId = customer.id;

            // Save customer ID to database
            await prisma.userSettings.update({
                where: { userId: user.id },
                data: { stripeCustomerId: customerId },
            });
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ["card"],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID!,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://trackjobapplications.vercel.app"}/home?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://trackjobapplications.vercel.app"}/home?canceled=true`,
            metadata: {
                userId: user.id,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
