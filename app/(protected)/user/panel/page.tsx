"use client"

import { useState, useEffect, useCallback } from "react"
import { RefreshCw, Receipt, MessageSquareText, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuthStore } from "@/lib/store/auth-store"
import { useTranslation } from "@/lib/store/language-store"
import { fetchDashboardData, type Transaction } from "@/lib/actions/n8n"
import { getCurrencySymbol } from "@/lib/utils/dashboard"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { toast } from "sonner"

/**
 * User Panel - Personal Dashboard for finance_user
 * Shows only their own transactions and quick actions
 */
export default function UserPanelPage() {
    const user = useAuthStore((state) => state.user)
    const { t, language } = useTranslation()

    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Load user's transactions
    const loadData = useCallback(async (showToast = false) => {
        try {
            if (showToast) setIsRefreshing(true)
            const data = await fetchDashboardData()
            // In production, this would be filtered by user ID on the backend
            // For now, we show all transactions as demo
            setTransactions(data.transactions.slice(0, 5))
        } catch (error) {
            console.error('Data load error:', error)
            toast.error(t.toast.connectionError)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [t])

    useEffect(() => {
        loadData()
    }, [loadData])

    // Calculate user stats (demo: from all transactions)
    const myStats = {
        totalTransactions: transactions.length,
        totalIncome: transactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0),
        totalExpense: transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + t.amount, 0),
    }

    const formatCurrency = (amount: number) => {
        return `₺${amount.toLocaleString('tr-TR')}`
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            {language === 'tr' ? 'Hoş Geldin' : 'Welcome'}, {user?.displayName || 'User'}
                        </h1>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            {language === 'tr'
                                ? "Kişisel finans paneliniz. İşlemlerinizi takip edin ve hızlı aksiyonlar alın."
                                : "Your personal finance panel. Track your transactions and take quick actions."
                            }
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadData(true)}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {t.common.refresh}
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title={language === 'tr' ? 'İşlem Sayısı' : 'Transactions'}
                    value={myStats.totalTransactions.toString()}
                    icon={Receipt}
                    variant="default"
                />
                <StatCard
                    title={language === 'tr' ? 'Toplam Gelir' : 'Total Income'}
                    value={formatCurrency(myStats.totalIncome)}
                    icon={ArrowUpRight}
                    variant="success"
                />
                <StatCard
                    title={language === 'tr' ? 'Toplam Gider' : 'Total Expense'}
                    value={formatCurrency(myStats.totalExpense)}
                    icon={ArrowDownRight}
                    variant="destructive"
                />
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        {language === 'tr' ? 'Hızlı İşlemler' : 'Quick Actions'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link href="/user/transactions">
                            <Button variant="outline" className="w-full justify-start h-12">
                                <Receipt className="h-4 w-4 mr-3" />
                                {language === 'tr' ? 'İşlemlerimi Görüntüle' : 'View My Transactions'}
                            </Button>
                        </Link>
                        <Link href="/user/ai">
                            <Button variant="outline" className="w-full justify-start h-12">
                                <MessageSquareText className="h-4 w-4 mr-3" />
                                {language === 'tr' ? 'AI Asistan' : 'AI Assistant'}
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">
                                {language === 'tr' ? 'Son İşlemlerim' : 'My Recent Transactions'}
                            </CardTitle>
                            <CardDescription>
                                {language === 'tr' ? 'En son girdiğiniz 5 işlem' : 'Last 5 transactions you entered'}
                            </CardDescription>
                        </div>
                        <Link href="/user/transactions">
                            <Button variant="ghost" size="sm">
                                {language === 'tr' ? 'Tümünü Gör' : 'View All'}
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {language === 'tr' ? 'Henüz işlem yok.' : 'No transactions yet.'}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${tx.type === 'INCOME'
                                            ? 'bg-green-100 dark:bg-green-900/30'
                                            : 'bg-red-100 dark:bg-red-900/30'
                                            }`}>
                                            {tx.type === 'INCOME'
                                                ? <ArrowUpRight className="h-4 w-4 text-green-600" />
                                                : <ArrowDownRight className="h-4 w-4 text-red-600" />
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium truncate max-w-[200px]">
                                                {tx.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {tx.transaction_date
                                                    ? new Date(tx.transaction_date).toLocaleDateString(
                                                        language === 'tr' ? 'tr-TR' : 'en-US'
                                                    )
                                                    : '-'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-semibold tabular-nums ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {tx.type === 'INCOME' ? '+' : '-'}
                                            {getCurrencySymbol(tx.currency)}
                                            {tx.amount.toLocaleString('tr-TR')}
                                        </p>
                                        <Badge variant="outline" className="text-xs">
                                            {tx.currency}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
