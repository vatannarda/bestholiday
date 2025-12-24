"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface ErrorStateProps {
    title?: string
    description?: string
    action?: {
        label: string
        onClick?: () => void
    }
    secondaryAction?: {
        label: string
        onClick?: () => void
    }
    className?: string
}

/**
 * ErrorState - Professional error display
 * Shows error with helpful message and recovery actions
 */
export function ErrorState({
    title = "Bir Hata Oluştu",
    description = "Veriler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.",
    action,
    secondaryAction,
    className,
}: ErrorStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-16 px-4 text-center",
            className
        )}>
            <div className="p-4 rounded-full bg-destructive/10 mb-6">
                <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
                {description}
            </p>
            <div className="flex items-center gap-3">
                {action && (
                    <Button onClick={action.onClick}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {action.label}
                    </Button>
                )}
                {secondaryAction && (
                    <Button variant="outline" onClick={secondaryAction.onClick}>
                        <Home className="mr-2 h-4 w-4" />
                        {secondaryAction.label}
                    </Button>
                )}
            </div>
        </div>
    )
}
