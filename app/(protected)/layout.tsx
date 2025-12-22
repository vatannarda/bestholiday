"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
    LayoutDashboard,
    Receipt,
    MessageSquareText,
    LogOut,
    Menu,
    ChevronLeft,
    TrendingUp,
    TrendingDown,
    Wallet,
    RefreshCw,
    DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { Logo } from "@/components/best-holiday-ui/logo"
import { useAuthStore } from "@/lib/store/auth-store"
import { useTranslation } from "@/lib/store/language-store"
import { cn } from "@/lib/utils"
import { fetchDashboardData, type DashboardStats, type Transaction } from "@/lib/actions/n8n"

// Refresh interval: 5 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, isAuthenticated, logout } = useAuthStore()
    const { t, language } = useTranslation()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mounted, setMounted] = useState(false)

    // Sidebar data state
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
        TRY: { income: 0, expense: 0, balance: 0 },
        USD: { income: 0, expense: 0, balance: 0 },
        EUR: { income: 0, expense: 0, balance: 0 },
    })
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [dataError, setDataError] = useState(false)

    // Dynamic nav items based on language
    const adminNavItems = [
        { title: t.nav.overview, href: "/admin/dashboard", icon: LayoutDashboard },
        { title: t.nav.transactions, href: "/transactions", icon: Receipt },
        { title: t.nav.aiAnalyst, href: "/admin/query", icon: MessageSquareText },
    ]

    const workerNavItems = [
        { title: t.nav.myPanel, href: "/worker/dashboard", icon: LayoutDashboard },
        { title: t.nav.addTransaction, href: "/transactions", icon: Receipt },
    ]

    // Load sidebar data from webhook
    const loadSidebarData = useCallback(async () => {
        try {
            setDataError(false)
            const data = await fetchDashboardData()
            setDashboardStats(data.stats)
            setRecentTransactions(data.transactions.slice(0, 5))
        } catch (error) {
            console.error('Sidebar data load error:', error)
            setDataError(true)
        } finally {
            setIsLoadingData(false)
        }
    }, [])

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push('/login')
        }
    }, [mounted, isAuthenticated, router])

    useEffect(() => {
        // Role-based route protection
        if (mounted && user) {
            if (user.role === 'worker' && pathname.startsWith('/admin')) {
                router.push('/worker/dashboard')
            }
        }
    }, [mounted, user, pathname, router])

    // Load sidebar data on mount and periodically
    useEffect(() => {
        if (mounted && isAuthenticated) {
            loadSidebarData()

            const interval = setInterval(() => {
                loadSidebarData()
            }, REFRESH_INTERVAL)

            return () => clearInterval(interval)
        }
    }, [mounted, isAuthenticated, loadSidebarData])

    if (!mounted || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <Logo size="lg" />
                    <p className="text-muted-foreground">{t.common.loading}</p>
                </div>
            </div>
        )
    }

    const navItems = user?.role === 'admin' ? adminNavItems : workerNavItems

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await loadSidebarData()
        setIsRefreshing(false)
    }

    const formatCurrency = (amount: number, currency: 'TRY' | 'USD' | 'EUR' = 'TRY') => {
        const symbols = { TRY: '₺', USD: '$', EUR: '€' }
        return `${symbols[currency]}${amount.toLocaleString('tr-TR')}`
    }

    return (
        <div className="min-h-screen flex bg-background">
            {/* Mobile Menu Button */}
            <Button
                variant="outline"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden min-h-[44px] min-w-[44px]"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen bg-sidebar-background border-r border-sidebar-border transition-all duration-300 flex flex-col",
                    sidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full md:translate-x-0"
                )}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
                    {sidebarOpen ? (
                        <Logo size="sm" />
                    ) : (
                        <Logo size="sm" showText={false} />
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="h-8 w-8 hidden md:flex"
                    >
                        {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 py-4">
                    <nav className="space-y-1 px-3">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => {
                                        // Close sidebar on mobile after click
                                        if (window.innerWidth < 768) setSidebarOpen(false)
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                                        isActive
                                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    {sidebarOpen && <span>{item.title}</span>}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Quick Stats for Admin - Multi-Currency */}
                    {user?.role === 'admin' && sidebarOpen && (
                        <>
                            <Separator className="my-4 mx-3" />
                            <div className="px-3 space-y-2">
                                <div className="flex items-center justify-between px-3">
                                    <p className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                                        {t.sidebar.quickLook}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={handleRefresh}
                                        disabled={isRefreshing}
                                    >
                                        <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
                                    </Button>
                                </div>

                                {/* TRY Stats */}
                                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10">
                                    <span className="text-lg">₺</span>
                                    <div className="flex-1">
                                        <p className="text-xs text-sidebar-foreground/60">TRY</p>
                                        <p className={cn("text-sm font-semibold",
                                            dashboardStats.TRY.balance >= 0 ? "text-green-500" : "text-red-500"
                                        )}>
                                            {formatCurrency(dashboardStats.TRY.balance, 'TRY')}
                                        </p>
                                    </div>
                                </div>

                                {/* USD Stats */}
                                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-500/10">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <div className="flex-1">
                                        <p className="text-xs text-sidebar-foreground/60">USD</p>
                                        <p className={cn("text-sm font-semibold",
                                            dashboardStats.USD.balance >= 0 ? "text-green-500" : "text-red-500"
                                        )}>
                                            {formatCurrency(dashboardStats.USD.balance, 'USD')}
                                        </p>
                                    </div>
                                </div>

                                {/* EUR Stats */}
                                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-500/10">
                                    <span className="text-lg">€</span>
                                    <div className="flex-1">
                                        <p className="text-xs text-sidebar-foreground/60">EUR</p>
                                        <p className={cn("text-sm font-semibold",
                                            dashboardStats.EUR.balance >= 0 ? "text-green-500" : "text-red-500"
                                        )}>
                                            {formatCurrency(dashboardStats.EUR.balance, 'EUR')}
                                        </p>
                                    </div>
                                </div>

                                {/* Recent Transactions */}
                                <Separator className="my-3" />
                                <p className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-3">
                                    {t.sidebar.recentActivity}
                                </p>
                                <div className="space-y-1">
                                    {recentTransactions.length === 0 ? (
                                        <p className="text-xs text-muted-foreground px-3 py-2">
                                            {t.sidebar.noActivity}
                                        </p>
                                    ) : (
                                        recentTransactions.map((tx) => (
                                            <div
                                                key={tx.id}
                                                className="flex items-center justify-between px-3 py-1.5 rounded text-xs"
                                            >
                                                <span className="truncate max-w-[100px]" title={tx.description}>
                                                    {tx.category}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "font-medium",
                                                        tx.type === 'INCOME' ? "text-green-500" : "text-red-500"
                                                    )}
                                                >
                                                    {tx.type === 'INCOME' ? '+' : '-'}
                                                    {formatCurrency(tx.amount, tx.currency)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </ScrollArea>

                {/* User Section */}
                <div className="p-4 border-t border-sidebar-border">
                    <div className={cn(
                        "flex items-center gap-3",
                        !sidebarOpen && "justify-center"
                    )}>
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {user?.displayName?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.displayName}</p>
                                <p className="text-xs text-sidebar-foreground/60 truncate">
                                    {user?.role === 'admin'
                                        ? (language === 'tr' ? 'Yönetici' : 'Admin')
                                        : (language === 'tr' ? 'Personel' : 'Staff')}
                                </p>
                            </div>
                        )}
                        {sidebarOpen && (
                            <Button variant="ghost" size="icon" onClick={handleLogout} className="min-h-[44px] min-w-[44px]">
                                <LogOut className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    {!sidebarOpen && (
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="mt-2 w-full min-h-[44px]">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    "flex-1 transition-all duration-300",
                    sidebarOpen ? "md:ml-64" : "md:ml-20",
                    "ml-0" // Always start from left on mobile
                )}
            >
                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center justify-between h-full px-6 md:px-6 pl-16 md:pl-6">
                        <div>
                            <h1 className="text-lg font-semibold">
                                {navItems.find((item) => item.href === pathname)?.title || 'Panel'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-1">
                            <LanguageToggle />
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
