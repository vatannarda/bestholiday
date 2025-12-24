import { Plane } from "lucide-react"

interface LogoProps {
    className?: string
    showText?: boolean
    size?: "sm" | "md" | "lg"
    onClick?: () => void
}

export function Logo({ className, showText = true, size = "md", onClick }: LogoProps) {
    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    }

    const textSizeClasses = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-3xl",
    }

    return (
        <div
            className={`flex items-center gap-2 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
            onClick={onClick}
        >
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-lg blur-sm opacity-50" />
                <div className="relative bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
                    <Plane className={`${sizeClasses[size]} text-white`} />
                </div>
            </div>
            {showText && (
                <div className="flex flex-col">
                    <span className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
                        BestHoliday
                    </span>
                    <span className="text-xs text-muted-foreground -mt-1">Yönetim Paneli</span>
                </div>
            )}
        </div>
    )
}
