"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@stackframe/stack";
import { db } from "@/lib/db";
import { migrateGuestData, createApplicationEvent, createContact } from "@/lib/actions";
import type { Application } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, CheckCircle2 } from "lucide-react";

export function DataMigration() {
    const user = useUser();
    const [migrating, setMigrating] = useState(false);
    const [success, setSuccess] = useState(false);
    const [migratedCount, setMigratedCount] = useState(0);
    const hasChecked = useRef(false);

    useEffect(() => {
        if (!user || hasChecked.current) return;
        hasChecked.current = true;

        const checkAndMigrate = async () => {
            // Check if we already migrated for this user
            const migrationKey = `migration_done_${user.id}`;
            if (localStorage.getItem(migrationKey)) return;

            // Check if there's local data to migrate
            const count = await db.applications.count();
            if (count === 0) {
                localStorage.setItem(migrationKey, "true");
                return;
            }

            setMigrating(true);
            try {
                // Get all local applications
                const localApps = await db.applications.toArray();

                // Prepare apps for bulk migration (remove local IDs)
                const appsToMigrate = localApps.map(app => {
                    const { id, createdAt, updatedAt, ...appData } = app;
                    return appData as Omit<Application, "id" | "createdAt" | "updatedAt">;
                });

                // Migrate all applications at once
                const result = await migrateGuestData(appsToMigrate);
                setMigratedCount(result.migrated);

                // Mark migration as done for this user
                localStorage.setItem(migrationKey, "true");

                // Clear local IndexedDB data after successful migration
                await db.applications.clear();
                await db.events.clear();
                await db.contacts.clear();
                await db.reminders.clear();
                await db.settings.clear();
                await db.userProgress.clear();

                // Also clear the guest signup prompt preference
                localStorage.removeItem("hideGuestSignupPrompt");

                setSuccess(true);

                // Reload the page after a short delay to refresh all data
                setTimeout(() => {
                    window.location.reload();
                }, 1500);

            } catch (err) {
                console.error("Migration failed:", err);
                // Don't mark as done if it failed
            } finally {
                setMigrating(false);
            }
        };

        checkAndMigrate();
    }, [user]);

    return (
        <AnimatePresence>
            {(migrating || success) && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-[100] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 border"
                    style={{
                        background: success
                            ? "linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))"
                            : "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))",
                        borderColor: success ? "rgba(16, 185, 129, 0.3)" : "rgba(59, 130, 246, 0.3)",
                    }}
                >
                    {migrating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <div>
                                <p className="font-semibold text-white text-sm">Syncing your data...</p>
                                <p className="text-xs text-white/80">Moving applications to your account</p>
                            </div>
                        </>
                    ) : success ? (
                        <>
                            <CheckCircle2 className="w-5 h-5 text-white" />
                            <div>
                                <p className="font-semibold text-white text-sm">
                                    {migratedCount} application{migratedCount !== 1 ? 's' : ''} synced!
                                </p>
                                <p className="text-xs text-white/80">Refreshing page...</p>
                            </div>
                        </>
                    ) : null}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
