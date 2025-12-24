"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Receipt, Sparkles, Loader2, RefreshCw, Clock, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { WeeklyChart } from "@/components/charts/weekly-chart"
import { ExpensePieChart } from "@/components/charts/expense-pie-chart"
import { TransactionCard } from "@/components/transaction-card"
import {
    fetchDashboardData,
    addTransaction,
    type Transaction,
    type DashboardStats,
    type Currency
} from "@/lib/actions/n8n"
import { getLedgerEntries } from "@/lib/api/ledger"
import { calculateWeeklyStats, calculateExpenseDistribution, getCurrencySymbol } from "@/lib/utils/dashboard"
import { useAuthStore } from "@/lib/store/auth-store"
import { useTranslation } from "@/lib/store/language-store"
import { toast } from "sonner"

// Refresh interval: 5 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000

const currencyIcons: Record<Currency, React.ReactNode> = {
    TRY: <span className="text-lg">₺</span>,
    USD: <DollarSign className="h-4 w-4" />,
    EUR: <span className="text-lg">€</span>,
}

export default function AdminDashboard() {
    const router = useRouter()
    const { t, language } = useTranslation()

    const [stats, setStats] = useState<DashboardStats>({
        TRY: { income: 0, expense: 0, balance: 0 },
        USD: { income: 0, expense: 0, balance: 0 },
        EUR: { income: 0, expense: 0, balance: 0 },
    })
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [weeklyData, setWeeklyData] = useState<{ name: string; gelir: number; gider: number }[]>([])
    const [expenseData, setExpenseData] = useState<{ name: string; value: number; color: string }[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    // AI Input state
    const [aiInput, setAiInput] = useState("")
    const [aiLoading, setAiLoading] = useState(false)

    // Fetch data from webhook
    const loadData = useCallback(async (showRefreshToast = false) => {
        try {
            if (showRefreshToast) setIsRefreshing(true)

            // Fetch both transactions and ledger entries
            const [data, ledgerRes] = await Promise.all([
                fetchDashboardData(),
                getLedgerEntries()
            ])

            // Calculate combined stats (transactions + ledger)
            const combinedStats: DashboardStats = { ...data.stats }

            // Add ledger entries to stats
            if (ledgerRes.success && ledgerRes.data?.entries) {
                for (const entry of ledgerRes.data.entries) {
                    const curr = (entry.currency || 'TRY') as Currency
                    if (entry.movementType === 'receivable' || entry.movementType === 'income') {
                        combinedStats[curr].income += entry.amount
                    } else {
                        combinedStats[curr].expense += entry.amount
                    }
                }
                // Recalculate balances
                combinedStats.TRY.balance = combinedStats.TRY.income - combinedStats.TRY.expense
                combinedStats.USD.balance = combinedStats.USD.income - combinedStats.USD.expense
                combinedStats.EUR.balance = combinedStats.EUR.income - combinedStats.EUR.expense
            }

            setStats(combinedStats)

            // Combine transactions with ledger entries for charts
            const ledgerAsTransactions = ledgerRes.success && ledgerRes.data?.entries
                ? ledgerRes.data.entries.map(entry => ({
                    id: `ledger_${entry.id}`,
                    amount: entry.amount,
                    type: (entry.movementType === 'receivable' || entry.movementType === 'income') ? 'INCOME' as const : 'EXPENSE' as const,
                    category: entry.movementType === 'receivable' ? 'Alacak' :
                        entry.movementType === 'payable' ? 'Borç' :
                            entry.movementType === 'income' ? 'Gelir' : 'Gider',
                    description: entry.description || entry.entityName || 'Cari İşlem',
                    currency: entry.currency as Currency,
                    transaction_date: entry.date,
                    created_at: entry.createdAt || entry.date,
                }))
                : []

            const allTransactions = [...data.transactions, ...ledgerAsTransactions] as typeof data.transactions

            setTransactions(data.transactions)
            setWeeklyData(calculateWeeklyStats(allTransactions))
            setExpenseData(calculateExpenseDistribution(allTransactions))
            setLastUpdated(new Date())

            if (showRefreshToast) {
                toast.success(t.toast.dataUpdated, {
                    description: `${data.transactions.length} ${t.toast.transactionsLoaded}`,
                })
            }
        } catch (error) {
            console.error('Data load error:', error)
            if (showRefreshToast) {
                toast.error(t.toast.dataLoadError, {
                    description: t.toast.dataLoadFailed,
                })
            }
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [t])

    // Initial load
    useEffect(() => {
        loadData()
    }, [loadData])

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            loadData()
        }, REFRESH_INTERVAL)

        return () => clearInterval(interval)
    }, [loadData])

    // Handle AI Submit
    const handleAISubmit = async () => {
        if (!aiInput.trim()) return

        setAiLoading(true)

        try {
            const user = useAuthStore.getState().user
            const response = await addTransaction(aiInput, user?.id)

            if (response.success) {
                toast.success(t.toast.success, {
                    description: t.toast.refreshing,
                })
                setAiInput("")
                setTimeout(() => {
                    loadData(false)
                    router.refresh()
                }, 1500)
            } else {
                toast.error(t.toast.error, {
                    description: response.error || t.toast.saveFailed,
                })
            }
        } catch {
            toast.error(t.toast.connectionError, {
                description: t.toast.serverError,
            })
        } finally {
            setAiLoading(false)
        }
    }

    // Manual refresh
    const handleRefresh = () => {
        loadData(true)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">{t.common.loading}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">{t.dashboard.title}</h2>
                    {lastUpdated && (
                        <p className="text-xs text-muted-foreground">
                            {t.dashboard.lastUpdate}: {lastUpdated.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US')}
                        </p>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="min-h-[44px] sm:min-h-0"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {t.common.refresh}
                </Button>
            </div>

            {/* AI Quick Add */}
            <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {t.dashboard.quickAdd}
                    </CardTitle>
                    <CardDescription>
                        {t.dashboard.quickAddDesc}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="admin-ai-input">{t.dashboard.writeNaturally}</Label>
                            <Textarea
                                id="admin-ai-input"
                                placeholder={t.dashboard.placeholder}
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                className="min-h-[100px] text-base"
                                disabled={aiLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                {t.dashboard.webhookNote}
                            </p>
                        </div>

                        <Button
                            onClick={handleAISubmit}
                            disabled={aiLoading || !aiInput.trim()}
                            className="w-full min-h-[48px]"
                        >
                            {aiLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t.dashboard.sending}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {t.dashboard.saveWithAI}
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Multi-Currency Stats Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {/* TRY Card */}
                <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            TRY {t.common.balance}
                        </CardTitle>
                        <div className="p-2 bg-primary/10 rounded-full">
                            {currencyIcons.TRY}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.TRY.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ₺{stats.TRY.balance.toLocaleString('tr-TR')}
                        </div>
                        <div className="flex items-center gap-4 text-xs mt-2">
                            <span className="text-green-500">+₺{stats.TRY.income.toLocaleString('tr-TR')}</span>
                            <span className="text-red-500">-₺{stats.TRY.expense.toLocaleString('tr-TR')}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* USD Card */}
                <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            USD {t.common.balance}
                        </CardTitle>
                        <div className="p-2 bg-green-500/10 rounded-full">
                            {currencyIcons.USD}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.USD.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${stats.USD.balance.toLocaleString('en-US')}
                        </div>
                        <div className="flex items-center gap-4 text-xs mt-2">
                            <span className="text-green-500">+${stats.USD.income.toLocaleString('en-US')}</span>
                            <span className="text-red-500">-${stats.USD.expense.toLocaleString('en-US')}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* EUR Card */}
                <Card className="relative overflow-hidden sm:col-span-2 lg:col-span-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            EUR {t.common.balance}
                        </CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-full">
                            {currencyIcons.EUR}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.EUR.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            €{stats.EUR.balance.toLocaleString('de-DE')}
                        </div>
                        <div className="flex items-center gap-4 text-xs mt-2">
                            <span className="text-green-500">+€{stats.EUR.income.toLocaleString('de-DE')}</span>
                            <span className="text-red-500">-€{stats.EUR.expense.toLocaleString('de-DE')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            {t.dashboard.weeklyStats}
                        </CardTitle>
                        <CardDescription>
                            {t.dashboard.weeklyDesc}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <WeeklyChart data={weeklyData} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5" />
                            {t.dashboard.expenseDist}
                        </CardTitle>
                        <CardDescription>
                            {t.dashboard.expenseDistDesc}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ExpensePieChart data={expenseData} />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {t.dashboard.recentTrans}
                    </CardTitle>
                    <CardDescription>
                        {t.dashboard.recentTransDesc}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {t.dashboard.noTransactions}
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="grid gap-4 md:hidden">
                                {transactions.slice(0, 10).map((transaction) => (
                                    <TransactionCard
                                        key={transaction.id}
                                        transaction={transaction}
                                        dateLabel={t.common.date}
                                        categoryLabel={t.common.category}
                                    />
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t.common.date}</TableHead>
                                            <TableHead>{t.common.description}</TableHead>
                                            <TableHead>{t.common.category}</TableHead>
                                            <TableHead>{t.common.currency}</TableHead>
                                            <TableHead>{t.common.type}</TableHead>
                                            <TableHead className="text-right">{t.common.amount}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.slice(0, 10).map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell className="font-medium">
                                                    {transaction.transaction_date
                                                        ? new Date(transaction.transaction_date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    {transaction.description}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{transaction.category}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{transaction.currency}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={transaction.type === "INCOME" ? "success" : "destructive"}>
                                                        {transaction.type === "INCOME" ? t.common.income : t.common.expense}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className={`text-right font-medium ${transaction.type === "INCOME" ? "text-green-500" : "text-red-500"
                                                    }`}>
                                                    {transaction.type === "INCOME" ? "+" : "-"}
                                                    {getCurrencySymbol(transaction.currency)}
                                                    {transaction.amount.toLocaleString('tr-TR')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
