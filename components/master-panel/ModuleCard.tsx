"use client"

import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ModuleCardProps {
    title: string
    description: string
    icon: LucideIcon
    status: "active" | "coming-soon"
    statusLabel: string
    onClick?: () => void
    disabled?: boolean
    className?: string
}

/**
 * Module Card for Master Panel
 * Shows module with icon, status badge, and click-to-navigate
 */
export function ModuleCard({
    title,
    description,
    icon: Icon,
    status,
    statusLabel,
    onClick,
    disabled = false,
    className,
}: ModuleCardProps) {
    const isActive = status === "active"

    const cardContent = (
        <Card
            className={cn(
                "relative overflow-hidden transition-all duration-200 group",
                isActive && "hover:shadow-lg hover:border-primary/50 cursor-pointer",
                disabled && "opacity-60 cursor-not-allowed",
                className
            )}
            onClick={disabled ? undefined : onClick}
        >
            {/* Background decoration */}
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110",
                isActive ? "bg-primary/10" : "bg-muted/50"
            )} />

            <CardHeader className="relative">
                <div className="flex items-start justify-between">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                        isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant={isActive ? "success" : "secondary"}>
                        {statusLabel}
                    </Badge>
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription className="line-clamp-2">
                    {description}
                </CardDescription>
            </CardHeader>

            <CardContent>
                {isActive && (
                    <div className="text-sm text-primary font-medium group-hover:underline">
                        Modüle Git →
                    </div>
                )}
            </CardContent>
        </Card>
    )

    if (disabled) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {cardContent}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{statusLabel}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return cardContent
}
