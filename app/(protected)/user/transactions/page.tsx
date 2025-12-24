"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, Download, RefreshCw, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { SkeletonTable } from "@/components/ui/skeleton"
import { TransactionCard } from "@/components/transaction-card"
import { useAuthStore } from "@/lib/store/auth-store"
import { useTranslation } from "@/lib/store/language-store"
import { fetchDashboardData, type Transaction, type Currency } from "@/lib/actions/n8n"
import { getCurrencySymbol } from "@/lib/utils/dashboard"
import { toast } from "sonner"

// Refresh interval: 5 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000

// CSV Export function
function exportToCSV(transactions: Transaction[], language: string) {
    const BOM = '\uFEFF'
    const headers = language === 'tr'
        ? ['Tarih', 'Kategori', 'Alt Kategori', 'Açıklama', 'Para Birimi', 'Tutar', 'Tip']
        : ['Date', 'Category', 'Sub Category', 'Description', 'Currency', 'Amount', 'Type']

    const rows = transactions.map(t => [
        t.transaction_date ? new Date(t.transaction_date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US') : '-',
        t.category,
        t.sub_category || '-',
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.currency,
        `${t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString('tr-TR')}`,
        t.type === 'INCOME' ? (language === 'tr' ? 'Gelir' : 'Income') : (language === 'tr' ? 'Gider' : 'Expense')
    ])

    const csvContent = BOM + [
        headers.join(';'),
        ...rows.map(row => row.join(';'))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const today = new Date().toISOString().split('T')[0]
    link.href = url
    link.download = `${language === 'tr' ? 'islemlerim' : 'my-transactions'}-${today}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * User Transactions Page
 * /user/transactions - Shows only user's own transactions
 */
export default function UserTransactionsPage() {
    const user = useAuthStore((state) => state.user)
    const { t, language } = useTranslation()

    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [subCategories, setSubCategories] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState<"all" | "INCOME" | "EXPENSE">("all")
    const [filterCurrency, setFilterCurrency] = useState<"all" | Currency>("all")

    // Load data from webhook
    const loadData = useCallback(async (showIndicator = false) => {
        try {
            if (showIndicator) setIsRefreshing(true)
            const data = await fetchDashboardData()

            // User panel: Always filter to show only user's own transactions
            let userTransactions = data.transactions

            if (user) {
                userTransactions = data.transactions.filter(t => {
                    // Match by user ID
                    if (t.created_by_user_id && user.id) {
                        return t.created_by_user_id === user.id
                    }
                    // Fallback: Match by username/displayName
                    if (t.created_by_name) {
                        return t.created_by_name === user.username ||
                            t.created_by_name === user.displayName
                    }
                    return false
                })
            }

            setTransactions(userTransactions)
            setSubCategories(data.subCategories)
        } catch (error) {
            console.error('Data load error:', error)
            toast.error(t.toast.connectionError)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [t, user])

    useEffect(() => {
        loadData()
    }, [loadData])

    // Auto-refresh
    useEffect(() => {
        const interval = setInterval(() => {
            loadData()
        }, REFRESH_INTERVAL)
        return () => clearInterval(interval)
    }, [loadData])

    const filteredTransactions = transactions
        .filter((t) => {
            const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesType = filterType === "all" || t.type === filterType
            const matchesCurrency = filterCurrency === "all" || t.currency === filterCurrency
            return matchesSearch && matchesType && matchesCurrency
        })
        .sort((a, b) => {
            const dateA = new Date(a.transaction_date || a.created_at || 0).getTime()
            const dateB = new Date(b.transaction_date || b.created_at || 0).getTime()
            return dateB - dateA
        })

    const handleExport = () => {
        exportToCSV(filteredTransactions, language)
        toast.success(language === 'tr' ? 'CSV indiriliyor' : 'Downloading CSV')
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{language === 'tr' ? 'İşlemlerim' : 'My Transactions'}</CardTitle>
                    <CardDescription>
                        {language === 'tr' ? 'Sisteme girdiğiniz işlemler' : 'Transactions you entered'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SkeletonTable rows={8} columns={6} />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>{language === 'tr' ? 'İşlemlerim' : 'My Transactions'}</CardTitle>
                        <CardDescription>
                            {language === 'tr' ? 'Sisteme girdiğiniz işlemler' : 'Transactions you entered'}
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadData(true)}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {t.common.refresh}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            {t.common.export}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t.common.search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={filterType} onValueChange={(value: "all" | "INCOME" | "EXPENSE") => setFilterType(value)}>
                        <SelectTrigger>
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t.common.all}</SelectItem>
                            <SelectItem value="INCOME">{t.transactions.incomes}</SelectItem>
                            <SelectItem value="EXPENSE">{t.transactions.expenses}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterCurrency} onValueChange={(value: "all" | Currency) => setFilterCurrency(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder={t.common.currency} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t.common.all}</SelectItem>
                            <SelectItem value="TRY">🇹🇷 TRY</SelectItem>
                            <SelectItem value="USD">🇺🇸 USD</SelectItem>
                            <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Results */}
                {filteredTransactions.length === 0 ? (
                    <EmptyState
                        title={t.transactions.noResults}
                        description={language === 'tr'
                            ? "Filtrelerinizi değiştirmeyi deneyin."
                            : "Try changing your filters."}
                    />
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="grid gap-4 md:hidden">
                            {filteredTransactions.map((transaction) => (
                                <TransactionCard
                                    key={transaction.id}
                                    transaction={transaction}
                                    dateLabel={t.common.date}
                                    categoryLabel={t.common.category}
                                />
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block rounded-md border">
                            <Table className="table-zebra">
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
                                    {filteredTransactions.map((transaction) => (
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
                                                <Badge variant="outline">{transaction.currency}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={transaction.type === "INCOME" ? "success" : "destructive"}>
                                                    {transaction.type === "INCOME" ? t.common.income : t.common.expense}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={`text-right font-medium tabular-nums ${transaction.type === "INCOME" ? "text-green-500" : "text-red-500"
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
    )
}
