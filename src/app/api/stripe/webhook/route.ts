import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const subscriptionId = session.subscription as string;

                if (userId) {
                    await prisma.userSettings.update({
                        where: { userId },
                        data: {
                            subscriptionTier: "pro",
                            stripeSubscriptionId: subscriptionId,
                            stripeCustomerId: session.customer as string,
                        },
                    });
                    console.log(`User ${userId} upgraded to Pro`);
                }
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const customer = await stripe.customers.retrieve(subscription.customer as string);

                if (customer && !customer.deleted) {
                    const userId = customer.metadata?.userId;
                    if (userId) {
                        const status = subscription.status === "active" ? "pro" : "free";
                        const periodEnd = (subscription as any).current_period_end;
                        await prisma.userSettings.update({
                            where: { userId },
                            data: {
                                subscriptionTier: status,
                                subscriptionExpiry: periodEnd
                                    ? new Date(periodEnd * 1000)
                                    : null,
                            },
                        });
                    }
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const customer = await stripe.customers.retrieve(subscription.customer as string);

                if (customer && !customer.deleted) {
                    const userId = customer.metadata?.userId;
                    if (userId) {
                        await prisma.userSettings.update({
                            where: { userId },
                            data: {
                                subscriptionTier: "free",
                                stripeSubscriptionId: null,
                                subscriptionExpiry: null,
                            },
                        });
                        console.log(`User ${userId} downgraded to Free`);
                    }
                }
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                const customer = await stripe.customers.retrieve(invoice.customer as string);

                if (customer && !customer.deleted) {
                    const userId = customer.metadata?.userId;
                    if (userId) {
                        // Optionally downgrade on payment failure
                        console.log(`Payment failed for user ${userId}`);
                    }
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook handler error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
