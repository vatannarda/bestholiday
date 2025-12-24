"use client"

import { cn } from "@/lib/utils"

interface SectionHeaderProps {
    title: string
    description?: string
    action?: React.ReactNode
    className?: string
}

/**
 * SectionHeader - Section divider with title and optional description
 * Used within pages to separate logical content areas
 */
export function SectionHeader({
    title,
    description,
    action,
    className,
}: SectionHeaderProps) {
    return (
        <div className={cn("mb-4", className)}>
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <h2 className="text-lg font-medium text-foreground">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {action}
            </div>
        </div>
    )
}
