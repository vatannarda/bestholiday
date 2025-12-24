"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ShieldX, Home } from "lucide-react"
import Link from "next/link"

interface AccessDeniedProps {
    title?: string
    description?: string
    redirectTo?: string
    redirectLabel?: string
    className?: string
}

/**
 * AccessDenied - Role-based access restriction display
 * Shows professional access denied message with visual cue (shield icon)
 */
export function AccessDenied({
    title = "Erişim Kısıtlı",
    description = "Bu alana erişim yetkiniz bulunmamaktadır. Farklı bir modüle yönlendirilmek için aşağıdaki butonu kullanabilirsiniz.",
    redirectTo = "/admin",
    redirectLabel = "Ana Sayfaya Dön",
    className,
}: AccessDeniedProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-20 px-4 text-center",
            className
        )}>
            {/* Visual Cue - Shield Icon */}
            <div className="mb-6">
                <ShieldX className="h-16 w-16 text-muted-foreground/40" />
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-2">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mb-8">
                {description}
            </p>

            <Button asChild>
                <Link href={redirectTo}>
                    <Home className="mr-2 h-4 w-4" />
                    {redirectLabel}
                </Link>
            </Button>
        </div>
    )
}
