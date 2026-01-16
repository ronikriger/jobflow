"use client";

import { useEffect, useState } from "react";
import { useUser } from "@stackframe/stack";
import { db } from "@/lib/db";
import { createApplication, createApplicationEvent, createContact } from "@/lib/actions";
import type { Application, ApplicationEvent, Contact } from "@/lib/types";

export function DataMigration() {
    const user = useUser();
    const [migrating, setMigrating] = useState(false);

    useEffect(() => {
        if (!user) return;

        const checkMigration = async () => {
            if (localStorage.getItem("migration_done")) return;

            const count = await db.applications.count();
            if (count === 0) {
                localStorage.setItem("migration_done", "true");
                return;
            }

            setMigrating(true);
            try {
                const apps = await db.applications.toArray();
                for (const app of apps) {
                    const { id, createdAt, updatedAt, ...appData } = app;

                    // Create app on server
                    const newApp = await createApplication(appData);

                    // Migrate events
                    if (app.id) {
                        const events = await db.events.where("applicationId").equals(app.id).toArray();
                        for (const ev of events) {
                            const { id: evId, applicationId, createdAt: evCreatedAt, ...evData } = ev;
                            await createApplicationEvent(newApp.id as string, evData);
                        }

                        // Migrate contacts
                        const contacts = await db.contacts.where("applicationId").equals(app.id).toArray();
                        for (const c of contacts) {
                            const { id: cId, applicationId, createdAt: cCreatedAt, ...cData } = c;
                            await createContact(newApp.id as string, cData);
                        }
                    }
                }

                // Mark migration as done
                localStorage.setItem("migration_done", "true");

                // Optional: Clear local DB after successful migration
                // await db.applications.clear();
                // await db.events.clear();
                // await db.contacts.clear();
                // await db.reminders.clear();

            } catch (err) {
                console.error("Migration failed:", err);
            } finally {
                setMigrating(false);
            }
        };

        checkMigration();
    }, [user]);

    if (migrating) {
        return (
            <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-6 py-4 rounded-xl shadow-xl z-50 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <p className="font-medium">Syncing local data to account...</p>
            </div>
        );
    }

    return null;
}
