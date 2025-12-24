"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface PageHeaderAction {
    label: string
    onClick?: () => void
    href?: string
    icon?: LucideIcon
    variant?: "default" | "outline" | "secondary"
}

interface PageHeaderProps {
    title: string
    description?: string
    actions?: PageHeaderAction[]
    badge?: React.ReactNode
    className?: string
}

/**
 * PageHeader - Enterprise-grade page header
 * Provides consistent structure: Title + Description + Actions
 */
export function PageHeader({
    title,
    description,
    actions,
    badge,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn("mb-8", className)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            {title}
                        </h1>
                        {badge}
                    </div>
                    {description && (
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            {description}
                        </p>
                    )}
                </div>
                {actions && actions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {actions.map((action, index) => {
                            const Icon = action.icon
                            return (
                                <Button
                                    key={index}
                                    variant={action.variant || "default"}
                                    onClick={action.onClick}
                                    className="whitespace-nowrap"
                                >
                                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                                    {action.label}
                                </Button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
