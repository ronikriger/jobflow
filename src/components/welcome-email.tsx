"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@stackframe/stack";

/**
 * This component checks if a user is newly signed up and sends them a welcome email.
 * It uses localStorage to track whether the welcome email has been sent.
 */
export function WelcomeEmailSender() {
    const user = useUser();
    const hasSentEmail = useRef(false);

    useEffect(() => {
        if (!user || hasSentEmail.current) return;

        const sendWelcomeEmail = async () => {
            // Check if we already sent a welcome email to this user
            const welcomeEmailKey = `welcome_email_sent_${user.id}`;
            if (localStorage.getItem(welcomeEmailKey)) return;

            hasSentEmail.current = true;

            // Get user's email
            const email = user.primaryEmail;
            if (!email) return;

            try {
                const response = await fetch("/api/email/welcome", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        name: user.displayName || undefined,
                    }),
                });

                if (response.ok) {
                    // Mark welcome email as sent
                    localStorage.setItem(welcomeEmailKey, "true");
                    console.log("Welcome email sent successfully");
                }
            } catch (error) {
                console.error("Failed to send welcome email:", error);
                // Allow retry on next load if it fails
                hasSentEmail.current = false;
            }
        };

        // Small delay to ensure user data is fully loaded
        const timeout = setTimeout(sendWelcomeEmail, 1000);
        return () => clearTimeout(timeout);
    }, [user]);

    // This component doesn't render anything
    return null;
}
