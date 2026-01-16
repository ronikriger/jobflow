"use client";

import { useUser, useStackApp } from "@stackframe/stack";
import { LogIn, LogOut, User } from "lucide-react";

export function AuthButton() {
    const user = useUser();
    const app = useStackApp();

    if (user) {
        return (
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        {user.displayName ? (
                            <span className="text-sm font-semibold text-white">
                                {user.displayName.charAt(0).toUpperCase()}
                            </span>
                        ) : (
                            <User className="w-4 h-4 text-white" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user.displayName || "User"}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">
                            {user.primaryEmail}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => user.signOut()}
                    className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-md bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 hover:text-white text-sm transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign out
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
            <p className="text-xs text-zinc-400 text-center mb-1">
                Sign in to sync your data across devices
            </p>
            <button
                onClick={() => app.redirectToSignIn()}
                className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
                <LogIn className="w-4 h-4" />
                Sign in
            </button>
        </div>
    );
}
