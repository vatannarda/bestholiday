import { cn } from "@/lib/utils"

interface SkeletonTableProps {
    rows?: number
    columns?: number
    className?: string
}

/**
 * Skeleton Table for loading states
 */
export function SkeletonTable({
    rows = 5,
    columns = 5,
    className,
}: SkeletonTableProps) {
    return (
        <div className={cn("w-full space-y-3", className)}>
            {/* Header */}
            <div className="flex gap-4 pb-2 border-b">
                {Array.from({ length: columns }).map((_, i) => (
                    <div
                        key={`header-${i}`}
                        className="h-4 bg-muted rounded animate-pulse"
                        style={{ width: `${100 / columns}%` }}
                    />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex gap-4 py-2">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div
                            key={`cell-${rowIndex}-${colIndex}`}
                            className="h-4 bg-muted rounded animate-pulse"
                            style={{
                                width: `${100 / columns}%`,
                                animationDelay: `${(rowIndex * columns + colIndex) * 50}ms`,
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

interface SkeletonCardProps {
    className?: string
}

/**
 * Skeleton Card for loading states
 */
export function SkeletonCard({ className }: SkeletonCardProps) {
    return (
        <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
            <div className="flex items-center justify-between">
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="space-y-2">
                <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                <div className="h-4 w-40 bg-muted rounded animate-pulse" />
            </div>
        </div>
    )
}

interface SkeletonKPICardsProps {
    count?: number
}

/**
 * Skeleton for KPI Cards grid
 */
export function SkeletonKPICards({ count = 3 }: SkeletonKPICardsProps) {
    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    )
}
