"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
    title: string
    value: string | number
    description?: string
    icon?: LucideIcon
    trend?: {
        value: string
        isPositive: boolean
    }
    variant?: "default" | "success" | "warning" | "destructive"
    className?: string
}

const variantStyles = {
    default: "bg-card",
    success: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900",
    warning: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900",
    destructive: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
}

const iconVariantStyles = {
    default: "text-muted-foreground",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    destructive: "text-red-600 dark:text-red-400",
}

/**
 * StatCard - Professional KPI/metric card
 * Displays key statistics with optional icon, trend, and semantic coloring
 */
export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    variant = "default",
    className,
}: StatCardProps) {
    return (
        <Card className={cn(
            "border shadow-sm hover:shadow-md transition-shadow duration-200",
            variantStyles[variant],
            className
        )}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            {title}
                        </p>
                        <p className="text-2xl font-semibold tracking-tight">
                            {value}
                        </p>
                        {description && (
                            <p className="text-xs text-muted-foreground">
                                {description}
                            </p>
                        )}
                        {trend && (
                            <p className={cn(
                                "text-xs font-medium",
                                trend.isPositive ? "text-emerald-600" : "text-red-600"
                            )}>
                                {trend.isPositive ? "↑" : "↓"} {trend.value}
                            </p>
                        )}
                    </div>
                    {Icon && (
                        <div className={cn(
                            "p-2 rounded-lg bg-muted/50",
                            iconVariantStyles[variant]
                        )}>
                            <Icon className="h-5 w-5" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
