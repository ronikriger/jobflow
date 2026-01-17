"use client";

import { StackHandler } from "@stackframe/stack";
import { stackClientApp } from "@/stack/client";

export default function Handler() {
    return <StackHandler fullPage app={stackClientApp} />;
}
