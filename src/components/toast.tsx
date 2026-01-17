"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        // Return a no-op if not in provider (graceful fallback)
        return { showToast: () => { } };
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const iconMap = {
        success: Check,
        error: X,
        warning: AlertCircle,
        info: Info,
    };

    const colorMap = {
        success: { bg: "rgba(16, 185, 129, 0.15)", border: "#10b981", icon: "#10b981" },
        error: { bg: "rgba(239, 68, 68, 0.15)", border: "#ef4444", icon: "#ef4444" },
        warning: { bg: "rgba(245, 158, 11, 0.15)", border: "#f59e0b", icon: "#f59e0b" },
        info: { bg: "rgba(59, 130, 246, 0.15)", border: "#3b82f6", icon: "#3b82f6" },
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => {
                        const Icon = iconMap[toast.type];
                        const colors = colorMap[toast.type];

                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md cursor-pointer"
                                style={{
                                    backgroundColor: colors.bg,
                                    border: `1px solid ${colors.border}`,
                                    minWidth: "280px",
                                }}
                                onClick={() => dismissToast(toast.id)}
                            >
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${colors.border}20` }}
                                >
                                    <Icon className="w-3.5 h-3.5" style={{ color: colors.icon }} />
                                </div>
                                <span className="text-sm font-medium text-white flex-1">
                                    {toast.message}
                                </span>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
