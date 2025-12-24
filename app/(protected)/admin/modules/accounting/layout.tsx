"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Calculator, Users2, Receipt, Clock, MessageSquareText, ChevronRight, Home } from "lucide-react"
import { useTranslation } from "@/lib/store/language-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface AccountingLayoutProps {
    children: React.ReactNode
}

/**
 * Accounting Module Layout
 * Provides module-specific navigation and breadcrumb
 */
export default function AccountingLayout({ children }: AccountingLayoutProps) {
    const pathname = usePathname()
    const { t } = useTranslation()
    const { user } = useAuthStore()

    const isAdmin = user?.role === 'admin'

    // Module navigation items
    const navItems = [
        {
            href: '/admin/modules/accounting',
            label: t.accounting.overview,
            icon: Calculator,
            exact: true,
            adminOnly: false,
        },
        {
            href: '/admin/modules/accounting/entities',
            label: t.accounting.entities,
            icon: Users2,
            exact: false,
            adminOnly: true,
        },
        {
            href: '/admin/modules/accounting/due',
            label: t.accounting.due,
            icon: Clock,
            exact: false,
            adminOnly: true,
        },
        {
            href: '/admin/modules/accounting/transactions',
            label: t.nav.transactions,
            icon: Receipt,
            exact: false,
            adminOnly: false,
        },
        {
            href: '/admin/modules/accounting/ai',
            label: t.nav.aiAnalyst,
            icon: MessageSquareText,
            exact: false,
            adminOnly: false,
        },
    ]

    // Filter items based on role
    const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin)

    // Check if item is active
    const isActive = (href: string, exact: boolean) => {
        if (exact) return pathname === href
        return pathname.startsWith(href)
    }

    // Get current page title for breadcrumb
    const currentPage = navItems.find(item => isActive(item.href, item.exact))

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                <Link
                    href="/admin"
                    className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.masterPanel.modules}</span>
                </Link>
                <ChevronRight className="h-4 w-4" />
                <Link
                    href="/admin/modules/accounting"
                    className="hover:text-foreground transition-colors"
                >
                    {t.masterPanel.accountingModule}
                </Link>
                {currentPage && currentPage.href !== '/admin/modules/accounting' && (
                    <>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">
                            {currentPage.label}
                        </span>
                    </>
                )}
            </nav>

            {/* Module Header with Active Badge */}
            <div className="flex items-center gap-3 pb-2 border-b">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                    <h1 className="text-xl font-semibold">{t.accounting.title}</h1>
                </div>
                <Badge variant="success" className="gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    {t.masterPanel.active}
                </Badge>
            </div>

            {/* Module Navigation Tabs */}
            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
                    {visibleItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href, item.exact)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                                    active
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Page Content */}
            <main>
                {children}
            </main>
        </div>
    )
}
