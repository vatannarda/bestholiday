"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, Wallet, Users2, Clock, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/lib/store/language-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { getDueItems } from "@/lib/api/due"
import { getEntities } from "@/lib/api/entities"
import { getLedgerEntries } from "@/lib/api/ledger"
import { fetchDashboardData, type Transaction, type Currency } from "@/lib/actions/n8n"
import { calculateWeeklyStats, calculateExpenseDistribution } from "@/lib/utils/dashboard"
import { SkeletonKPICards } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/ui/page-header"
import { SectionHeader } from "@/components/ui/section-header"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts"

// Demo data for weekly flow
const WEEKLY_FLOW_DATA = [
    { day: "Pzt", income: 4500, expense: 2100 },
    { day: "Sal", income: 3200, expense: 1800 },
    { day: "Çar", income: 5100, expense: 3200 },
    { day: "Per", income: 2800, expense: 1500 },
    { day: "Cum", income: 6200, expense: 4100 },
    { day: "Cmt", income: 1500, expense: 800 },
    { day: "Paz", income: 900, expense: 400 },
]

// Expense category extraction with fallback logic
function extractCategory(reference?: string, description?: string): string {
    // 1. Check reference prefix
    if (reference) {
        const prefix = reference.split("-")[0]?.toUpperCase()
        const prefixMap: Record<string, string> = {
            "OTEL": "Otel",
            "YAKIT": "Yakıt",
            "FAT": "Fatura",
            "PERS": "Personel",
            "ARAC": "Araç",
        }
        if (prefixMap[prefix]) return prefixMap[prefix]
    }

    // 2. Check description keywords
    if (description) {
        const desc = description.toLowerCase()
        if (desc.includes("otel") || desc.includes("konaklama")) return "Otel"
        if (desc.includes("yakıt") || desc.includes("mazot") || desc.includes("benzin")) return "Yakıt"
        if (desc.includes("personel") || desc.includes("maaş")) return "Personel"
        if (desc.includes("araç") || desc.includes("kiralama")) return "Araç"
        if (desc.includes("fatura")) return "Fatura"
    }

    // 3. Fallback
    return "Diğer"
}

// Demo expense data for pie chart
const EXPENSE_DATA = [
    { name: "Otel", value: 8500 },
    { name: "Yakıt", value: 4200 },
    { name: "Personel", value: 3800 },
    { name: "Araç", value: 2100 },
    { name: "Diğer", value: 1400 },
]

// Enterprise chart colors (low saturation)
const CHART_COLORS = [
    "hsl(213, 50%, 35%)",  // Navy
    "hsl(160, 45%, 35%)",  // Teal
    "hsl(38, 70%, 45%)",   // Amber
    "hsl(280, 40%, 50%)",  // Purple
    "hsl(215, 16%, 47%)",  // Muted gray
]

// Weekly Flow Bar Chart Component
function WeeklyFlowChart({ data }: { data: { name: string; gelir: number; gider: number }[] }) {
    // Convert to WEEKLY_FLOW_DATA format for fallback
    const chartData = data.length > 0 ? data.map(d => ({ day: d.name, income: d.gelir, expense: d.gider })) : WEEKLY_FLOW_DATA
    return (
        <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="day" className="text-xs" tick={{ fill: "hsl(215, 16%, 47%)" }} />
                    <YAxis className="text-xs" tick={{ fill: "hsl(215, 16%, 47%)" }} tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                        formatter={(value) => [`₺${Number(value).toLocaleString("tr-TR")}`, ""]}
                        contentStyle={{
                            backgroundColor: "hsl(0, 0%, 100%)",
                            border: "1px solid hsl(214, 32%, 91%)",
                            borderRadius: "8px"
                        }}
                    />
                    <Bar dataKey="income" name="Gelir" fill="hsl(160, 45%, 35%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Gider" fill="hsl(0, 72%, 41%)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

// Expense Distribution Pie Chart Component
function ExpenseDistributionChart({ data }: { data: { name: string; value: number; color: string }[] }) {
    const chartData = data.length > 0 ? data : EXPENSE_DATA.map((d, i) => ({ ...d, color: CHART_COLORS[i] }))
    return (
        <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => [`₺${Number(value).toLocaleString("tr-TR")}`, "Tutar"]}
                        contentStyle={{
                            backgroundColor: "hsl(0, 0%, 100%)",
                            border: "1px solid hsl(214, 32%, 91%)",
                            borderRadius: "8px"
                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}


/**
 * Accounting Module Overview
 * /admin/modules/accounting - Financial Summary Dashboard
 */
export default function AccountingOverview() {
    const router = useRouter()
    const { t } = useTranslation()
    const { user } = useAuthStore()

    const isAdmin = user?.role === 'admin'

    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [weeklyData, setWeeklyData] = useState<{ name: string; gelir: number; gider: number }[]>([])
    const [expenseData, setExpenseData] = useState<{ name: string; value: number; color: string }[]>([])
    const [stats, setStats] = useState({
        totalEntities: 0,
        overdueCount: 0,
        upcomingDueCount: 0,
        balances: {
            TRY: { receivable: 0, payable: 0, net: 0 },
            USD: { receivable: 0, payable: 0, net: 0 },
            EUR: { receivable: 0, payable: 0, net: 0 },
        }
    })

    const loadData = useCallback(async (showRefresh = false) => {
        if (showRefresh) {
            setIsRefreshing(true)
        } else {
            setIsLoading(true)
        }
        try {
            const [entitiesRes, dueRes, ledgerRes, dashboardData] = await Promise.all([
                getEntities(),
                getDueItems({ days: 14 }),
                getLedgerEntries(),
                fetchDashboardData(),
            ])

            const entities = entitiesRes.data?.entities || []
            const due = dueRes.data

            // Start with dashboard stats (normal transactions)
            const balances = {
                TRY: { receivable: dashboardData.stats.TRY.income, payable: dashboardData.stats.TRY.expense, net: 0 },
                USD: { receivable: dashboardData.stats.USD.income, payable: dashboardData.stats.USD.expense, net: 0 },
                EUR: { receivable: dashboardData.stats.EUR.income, payable: dashboardData.stats.EUR.expense, net: 0 },
            }

            // Add ledger entries to balances
            if (ledgerRes.success && ledgerRes.data?.entries) {
                for (const entry of ledgerRes.data.entries) {
                    const curr = (entry.currency || 'TRY') as 'TRY' | 'USD' | 'EUR'
                    if (entry.movementType === 'receivable' || entry.movementType === 'income') {
                        balances[curr].receivable += entry.amount
                    } else {
                        balances[curr].payable += entry.amount
                    }
                }
            }

            // Calculate net for each currency
            balances.TRY.net = balances.TRY.receivable - balances.TRY.payable
            balances.USD.net = balances.USD.receivable - balances.USD.payable
            balances.EUR.net = balances.EUR.receivable - balances.EUR.payable

            // Combine all transactions for chart calculation
            const ledgerEntries = ledgerRes.success && ledgerRes.data?.entries ? ledgerRes.data.entries : []

            // Convert ledger entries to Transaction format
            const ledgerAsTransactions: Transaction[] = ledgerEntries.map(entry => ({
                id: `ledger_${entry.id}`,
                amount: entry.amount,
                type: (entry.movementType === 'receivable' || entry.movementType === 'income') ? 'INCOME' as const : 'EXPENSE' as const,
                category: entry.movementType === 'receivable' ? 'Alacak' :
                    entry.movementType === 'payable' ? 'Borç' :
                        entry.movementType === 'income' ? 'Gelir' : 'Gider',
                description: entry.description || '',
                currency: entry.currency as Currency,
                transaction_date: entry.date,
                created_at: entry.createdAt || entry.date,
            }))

            const allTransactions = [...dashboardData.transactions, ...ledgerAsTransactions]

            // Use same calculation functions as dashboard
            setWeeklyData(calculateWeeklyStats(allTransactions))
            setExpenseData(calculateExpenseDistribution(allTransactions))

            setStats({
                totalEntities: entities.length,
                overdueCount: due?.overdue?.length || 0,
                upcomingDueCount: due?.upcoming?.length || 0,
                balances
            })
        } catch (error) {
            console.error('Load data error:', error)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    const handleRefresh = () => {
        loadData(true)
    }

    useEffect(() => {
        loadData()
    }, [loadData])

    if (isLoading) {
        return (
            <div className="space-y-6">
                <SkeletonKPICards count={4} />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader
                    title={t.accounting.overview}
                    description={t.accounting.overviewDesc}
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {t.common.refresh}
                </Button>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Balance TRY */}
                <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t.accounting.netBalance} (TRY)
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.balances.TRY.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ₺{stats.balances.TRY.net.toLocaleString('tr-TR')}
                        </div>
                        <div className="flex gap-2 text-xs mt-1">
                            <span className="text-green-500">+₺{stats.balances.TRY.receivable.toLocaleString('tr-TR')}</span>
                            <span className="text-red-500">-₺{stats.balances.TRY.payable.toLocaleString('tr-TR')}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Entities Count - Admin Only */}
                {isAdmin && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t.accounting.entities}
                            </CardTitle>
                            <Users2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalEntities}</div>
                            <p className="text-xs text-muted-foreground">
                                Aktif cari hesap
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Upcoming Due - Admin Only */}
                {isAdmin && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t.accounting.upcomingDue}
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-500">{stats.upcomingDueCount}</div>
                            <p className="text-xs text-muted-foreground">
                                14 gün içinde
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Overdue - Admin Only */}
                {isAdmin && (
                    <Card className={stats.overdueCount > 0 ? "border-red-500/50" : ""}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t.accounting.overdueCount}
                            </CardTitle>
                            <AlertTriangle className={`h-4 w-4 ${stats.overdueCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stats.overdueCount > 0 ? 'text-red-500' : ''}`}>
                                {stats.overdueCount}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Gecikmiş ödeme
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Analytics Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Weekly Financial Flow - Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t.dashboard.weeklyStats}</CardTitle>
                        <CardDescription>{t.dashboard.weeklyDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <WeeklyFlowChart data={weeklyData} />
                    </CardContent>
                </Card>

                {/* Expense Distribution - Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t.dashboard.expenseDist}</CardTitle>
                        <CardDescription>{t.dashboard.expenseDistDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ExpenseDistributionChart data={expenseData} />
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t.accounting.quickLinks}</CardTitle>
                    <CardDescription>
                        Sık kullanılan işlemlere hızlı erişim
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {isAdmin && (
                            <Button
                                variant="outline"
                                className="justify-between h-auto py-4"
                                onClick={() => router.push('/admin/modules/accounting/entities')}
                            >
                                <div className="flex items-center gap-3">
                                    <Users2 className="h-5 w-5 text-primary" />
                                    <div className="text-left">
                                        <div className="font-medium">{t.accounting.entities}</div>
                                        <div className="text-xs text-muted-foreground">Müşteri ve tedarikçiler</div>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        )}

                        {isAdmin && (
                            <Button
                                variant="outline"
                                className="justify-between h-auto py-4"
                                onClick={() => router.push('/admin/modules/accounting/due')}
                            >
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-amber-500" />
                                    <div className="text-left">
                                        <div className="font-medium">{t.accounting.due}</div>
                                        <div className="text-xs text-muted-foreground">Ödeme takibi</div>
                                    </div>
                                </div>
                                {stats.overdueCount > 0 && (
                                    <Badge variant="destructive">{stats.overdueCount}</Badge>
                                )}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            className="justify-between h-auto py-4"
                            onClick={() => router.push('/admin/modules/accounting/transactions')}
                        >
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                <div className="text-left">
                                    <div className="font-medium">{t.nav.transactions}</div>
                                    <div className="text-xs text-muted-foreground">Tüm işlemler</div>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            className="justify-between h-auto py-4"
                            onClick={() => router.push('/admin/modules/accounting/ai')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-5 w-5 bg-gradient-to-br from-primary to-accent rounded flex items-center justify-center text-white text-xs font-bold">
                                    AI
                                </div>
                                <div className="text-left">
                                    <div className="font-medium">{t.nav.aiAnalyst}</div>
                                    <div className="text-xs text-muted-foreground">Doğal dil ile işlem</div>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Multi-Currency Summary - Admin Only */}
            {isAdmin && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Para Birimi Bazında Bakiye</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {/* TRY */}
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg font-bold">₺</span>
                                    <span className="text-sm text-muted-foreground">TRY</span>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t.accounting.totalReceivable}</span>
                                        <span className="text-green-500">+₺{stats.balances.TRY.receivable.toLocaleString('tr-TR')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t.accounting.totalPayable}</span>
                                        <span className="text-red-500">-₺{stats.balances.TRY.payable.toLocaleString('tr-TR')}</span>
                                    </div>
                                    <div className="flex justify-between font-medium border-t pt-1">
                                        <span>{t.accounting.netBalance}</span>
                                        <span className={stats.balances.TRY.net >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            ₺{stats.balances.TRY.net.toLocaleString('tr-TR')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* USD */}
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg font-bold">$</span>
                                    <span className="text-sm text-muted-foreground">USD</span>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t.accounting.totalReceivable}</span>
                                        <span className="text-green-500">+${stats.balances.USD.receivable.toLocaleString('en-US')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t.accounting.totalPayable}</span>
                                        <span className="text-red-500">-${stats.balances.USD.payable.toLocaleString('en-US')}</span>
                                    </div>
                                    <div className="flex justify-between font-medium border-t pt-1">
                                        <span>{t.accounting.netBalance}</span>
                                        <span className={stats.balances.USD.net >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            ${stats.balances.USD.net.toLocaleString('en-US')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* EUR */}
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg font-bold">€</span>
                                    <span className="text-sm text-muted-foreground">EUR</span>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t.accounting.totalReceivable}</span>
                                        <span className="text-green-500">+€{stats.balances.EUR.receivable.toLocaleString('de-DE')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t.accounting.totalPayable}</span>
                                        <span className="text-red-500">-€{stats.balances.EUR.payable.toLocaleString('de-DE')}</span>
                                    </div>
                                    <div className="flex justify-between font-medium border-t pt-1">
                                        <span>{t.accounting.netBalance}</span>
                                        <span className={stats.balances.EUR.net >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            €{stats.balances.EUR.net.toLocaleString('de-DE')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
