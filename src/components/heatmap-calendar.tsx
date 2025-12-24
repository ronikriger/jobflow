"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { format, startOfWeek, addDays, subWeeks, getDay, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import type { Application } from "@/lib/types";

interface HeatmapCalendarProps {
    applications: Application[];
}

export function HeatmapCalendar({ applications }: HeatmapCalendarProps) {
    const today = new Date();
    const weeks = 52;

    // Generate heatmap data
    const heatmapData = useMemo(() => {
        // Create a map of dates to counts
        const dateMap = new Map<string, number>();

        for (const app of applications) {
            if (app.appliedAt) {
                const dateKey = format(new Date(app.appliedAt), "yyyy-MM-dd");
                dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
            }
        }

        // Generate all weeks/days
        const startDate = startOfWeek(subWeeks(today, weeks - 1), { weekStartsOn: 0 });
        const weeksData: { date: Date; count: number }[][] = [];

        for (let w = 0; w < weeks; w++) {
            const weekStart = addDays(startDate, w * 7);
            const week: { date: Date; count: number }[] = [];

            for (let d = 0; d < 7; d++) {
                const date = addDays(weekStart, d);
                const dateKey = format(date, "yyyy-MM-dd");
                week.push({
                    date,
                    count: dateMap.get(dateKey) || 0,
                });
            }

            weeksData.push(week);
        }

        return weeksData;
    }, [applications, today, weeks]);

    // Get intensity level (0-4)
    const getIntensity = (count: number): number => {
        if (count === 0) return 0;
        if (count === 1) return 1;
        if (count === 2) return 2;
        if (count <= 4) return 3;
        return 4;
    };

    // Month labels
    const months = useMemo(() => {
        const monthLabels: { name: string; col: number }[] = [];
        let currentMonth = -1;

        heatmapData.forEach((week, weekIndex) => {
            const firstDayOfWeek = week[0];
            const month = firstDayOfWeek.date.getMonth();

            if (month !== currentMonth) {
                monthLabels.push({
                    name: format(firstDayOfWeek.date, "MMM"),
                    col: weekIndex,
                });
                currentMonth = month;
            }
        });

        return monthLabels;
    }, [heatmapData]);

    const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

    return (
        <div className="glass-card rounded-2xl p-6 overflow-x-auto">
            <div className="inline-flex flex-col gap-1 min-w-fit">
                {/* Month labels */}
                <div className="flex ml-8 mb-1">
                    {months.map((month, i) => (
                        <div
                            key={i}
                            className="text-xs text-muted-foreground"
                            style={{
                                position: "relative",
                                left: `${month.col * 14}px`,
                                marginRight: i < months.length - 1
                                    ? `${(months[i + 1].col - month.col - 1) * 14}px`
                                    : 0
                            }}
                        >
                            {month.name}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="flex gap-1">
                    {/* Day labels */}
                    <div className="flex flex-col gap-[3px] pr-2">
                        {dayLabels.map((label, i) => (
                            <div
                                key={i}
                                className="h-[10px] text-[10px] text-muted-foreground leading-none flex items-center"
                            >
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Weeks */}
                    {heatmapData.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-[3px]">
                            {week.map((day, dayIndex) => {
                                const intensity = getIntensity(day.count);
                                const isToday = isSameDay(day.date, today);
                                const isFuture = day.date > today;

                                return (
                                    <motion.div
                                        key={dayIndex}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                            delay: (weekIndex * 7 + dayIndex) * 0.001,
                                            duration: 0.2
                                        }}
                                        className={cn(
                                            "w-[10px] h-[10px] rounded-sm transition-colors relative group",
                                            isFuture && "opacity-30",
                                            isToday && "ring-1 ring-primary ring-offset-1 ring-offset-background",
                                            intensity === 0 && "bg-secondary",
                                            intensity === 1 && "bg-primary/25",
                                            intensity === 2 && "bg-primary/50",
                                            intensity === 3 && "bg-primary/75",
                                            intensity === 4 && "bg-primary"
                                        )}
                                    >
                                        {/* Tooltip */}
                                        {!isFuture && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-card border border-border shadow-xl text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                <span className="font-medium">{day.count}</span>
                                                <span className="text-muted-foreground"> applications on </span>
                                                <span>{format(day.date, "MMM d, yyyy")}</span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="flex gap-[3px]">
                        {[0, 1, 2, 3, 4].map((level) => (
                            <div
                                key={level}
                                className={cn(
                                    "w-[10px] h-[10px] rounded-sm",
                                    level === 0 && "bg-secondary",
                                    level === 1 && "bg-primary/25",
                                    level === 2 && "bg-primary/50",
                                    level === 3 && "bg-primary/75",
                                    level === 4 && "bg-primary"
                                )}
                            />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}

