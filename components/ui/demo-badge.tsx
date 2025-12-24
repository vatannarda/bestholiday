"use client"

import { useTranslation } from "@/lib/store/language-store"

/**
 * Demo Mode Badge
 * Shows when NEXT_PUBLIC_DEMO_MODE=true and NODE_ENV=development
 */
export function DemoBadge() {
    const { t } = useTranslation()

    // Only show in demo mode (development only)
    if (typeof window === 'undefined') return null
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return null
    if (process.env.NODE_ENV === 'production') return null

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="bg-amber-500/90 text-amber-950 px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-950 rounded-full animate-pulse" />
                {t.masterPanel.demoMode}
            </div>
        </div>
    )
}
