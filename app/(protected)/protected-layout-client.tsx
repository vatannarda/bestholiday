"use client"

import { useEffect, useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/best-holiday-ui/logo"
import { useAuthStore } from "@/lib/store/auth-store"
import { cn } from "@/lib/utils"
import type { DashboardStats, Transaction } from "@/lib/actions/db"

const adminNavItems = [
    {
        title: "Genel Bakış",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "İşlemler",
        href: "/transactions",
        icon: Receipt,
    },
    {
        title: "AI Analist",
        href: "/admin/query",
        icon: MessageSquareText,
    },
]

const workerNavItems = [
    {
        title: "Panelim",
        href: "/worker/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "İşlem Ekle",
        href: "/transactions",
        icon: Receipt,
    },
]

interface ProtectedLayoutClientProps {
    children: React.ReactNode
    dashboardStats: DashboardStats
    recentTransactions: Transaction[]
}

export function ProtectedLayoutClient({
    children,
    dashboardStats,
    recentTransactions,
}: ProtectedLayoutClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, isAuthenticated, logout } = useAuthStore()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mounted, setMounted] = useState(false)

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
            if (user.role === 'finance_user' && pathname.startsWith('/admin')) {
                router.push('/user/panel')
            }
        }
    }, [mounted, user, pathname, router])

    if (!mounted || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <Logo size="lg" />
                    <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
            </div>
        )
    }

    const navItems = user?.role === 'admin' ? adminNavItems : workerNavItems

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <div className="min-h-screen flex bg-background">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen bg-sidebar-background border-r border-sidebar-border transition-all duration-300 flex flex-col",
                    sidebarOpen ? "w-64" : "w-20"
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
                        className="h-8 w-8"
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
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
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

                    {/* Quick Stats for Admin - Real Data */}
                    {user?.role === 'admin' && sidebarOpen && (
                        <>
                            <Separator className="my-4 mx-3" />
                            <div className="px-3 space-y-2">
                                <p className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-3">
                                    Hızlı Bakış
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-500/10">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <div>
                                            <p className="text-xs text-sidebar-foreground/60">Gelir</p>
                                            <p className="text-sm font-semibold text-green-500">
                                                {formatCurrency(dashboardStats.income)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-500/10">
                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                        <div>
                                            <p className="text-xs text-sidebar-foreground/60">Gider</p>
                                            <p className="text-sm font-semibold text-red-500">
                                                {formatCurrency(dashboardStats.expense)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10">
                                        <Wallet className="h-4 w-4 text-primary" />
                                        <div>
                                            <p className="text-xs text-sidebar-foreground/60">Net</p>
                                            <p className="text-sm font-semibold text-primary">
                                                {formatCurrency(dashboardStats.balance)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Transactions */}
                                <Separator className="my-3" />
                                <p className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-3">
                                    Son İşlemler
                                </p>
                                <div className="space-y-1">
                                    {recentTransactions.length === 0 ? (
                                        <p className="text-xs text-muted-foreground px-3 py-2">
                                            Henüz işlem yok
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
                                                    {formatCurrency(tx.amount)}
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
                                    {user?.role === 'admin' ? 'Yönetici' : 'Personel'}
                                </p>
                            </div>
                        )}
                        {sidebarOpen && (
                            <Button variant="ghost" size="icon" onClick={handleLogout}>
                                <LogOut className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    {!sidebarOpen && (
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="mt-2 w-full">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    "flex-1 transition-all duration-300",
                    sidebarOpen ? "ml-64" : "ml-20"
                )}
            >
                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center justify-between h-full px-6">
                        <div>
                            <h1 className="text-lg font-semibold">
                                {navItems.find((item) => item.href === pathname)?.title || 'Panel'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
