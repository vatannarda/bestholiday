"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, Download, RefreshCw, Loader2, User, Clock } from "lucide-react"
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
import { useAuthStore, canSeeCreatedByColumn, canSeeAllLedger } from "@/lib/store/auth-store"
import { getUsers } from "@/lib/api/users"
import { getLedgerEntries } from "@/lib/api/ledger"
import { useTranslation } from "@/lib/store/language-store"
import { fetchDashboardData, type Transaction, type Currency } from "@/lib/actions/n8n"
import { getCurrencySymbol } from "@/lib/utils/dashboard"
import { toast } from "sonner"

// Refresh interval: 5 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000

// CSV Export function with UTF-8 BOM for Excel compatibility
function exportToCSV(transactions: Transaction[], language: string) {
    const BOM = '\uFEFF'

    const headers = language === 'tr'
        ? ['Tarih', 'Kategori', 'Alt Kategori', 'Açıklama', 'Para Birimi', 'Tutar', 'Tip', 'Vade Tarihi', 'İşlemi Giren']
        : ['Date', 'Category', 'Sub Category', 'Description', 'Currency', 'Amount', 'Type', 'Due Date', 'Created By']

    const rows = transactions.map(t => [
        t.transaction_date ? new Date(t.transaction_date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US') : '-',
        t.category,
        t.sub_category || '-',
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.currency,
        `${t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString('tr-TR')}`,
        t.type === 'INCOME' ? (language === 'tr' ? 'Gelir' : 'Income') : (language === 'tr' ? 'Gider' : 'Expense'),
        t.due_date ? new Date(t.due_date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US') : '-',
        `"${(t.created_by_name || '-').replace(/"/g, '""')}"`
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
    link.download = `${language === 'tr' ? 'islemler' : 'transactions'}-${today}.csv`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * Transactions Page (within Accounting Module)
 * /admin/modules/accounting/transactions
 */
export default function AccountingTransactionsPage() {
    const user = useAuthStore((state) => state.user)
    const isAdmin = user?.role === "admin"
    const canSeeCreatedBy = canSeeCreatedByColumn(user?.role ?? null)
    const canSeeAll = canSeeAllLedger(user?.role ?? null)  // admin & finance_admin see all
    const { t, language } = useTranslation()

    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [subCategories, setSubCategories] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState<"all" | "INCOME" | "EXPENSE">("all")
    const [filterCurrency, setFilterCurrency] = useState<"all" | Currency>("all")
    const [filterSubCategory, setFilterSubCategory] = useState<string>("all")



    // Load data from webhook
    const loadData = useCallback(async (showIndicator = false) => {
        try {
            if (showIndicator) setIsRefreshing(true)

            // Load transactions and ledger entries in parallel
            const [data, ledgerRes] = await Promise.all([
                fetchDashboardData(),
                getLedgerEntries()  // Fetch all ledger entries
            ])

            // Convert ledger entries to Transaction format
            let ledgerAsTransactions: Transaction[] = []
            if (ledgerRes.success && ledgerRes.data?.entries) {
                ledgerAsTransactions = ledgerRes.data.entries.map(entry => ({
                    id: `ledger_${entry.id}`,
                    amount: entry.amount,
                    type: (entry.movementType === 'receivable' || entry.movementType === 'income') ? 'INCOME' : 'EXPENSE',
                    category: entry.movementType === 'receivable' ? 'Alacak' :
                        entry.movementType === 'payable' ? 'Borç' :
                            entry.movementType === 'income' ? 'Gelir' : 'Gider',
                    sub_category: entry.entityName || undefined,
                    description: entry.description || `${entry.entityName || 'Cari'} - ${entry.reference || 'Vadeli İşlem'}`,
                    currency: entry.currency as Currency,
                    transaction_date: entry.date,
                    created_at: entry.createdAt || entry.date,
                    // Only show due_date for unpaid entries - paid items have no due date
                    due_date: entry.status !== 'paid' ? entry.dueDate : undefined,
                    is_from_ledger: true,
                    created_by_user_id: entry.createdBy?.id,
                    created_by_name: entry.createdBy?.name,
                }))
            }

            // Merge transactions with ledger entries and sort by date
            const allTransactions = [...data.transactions, ...ledgerAsTransactions]
                .sort((a, b) => {
                    const dateA = new Date(a.transaction_date || a.created_at || 0).getTime()
                    const dateB = new Date(b.transaction_date || b.created_at || 0).getTime()
                    return dateB - dateA  // Newest first
                })

            // Role-based filtering:
            // - admin & finance_admin: See ALL transactions
            // - finance_user: See ONLY their own transactions (by user ID or username match)
            let filteredByRole = allTransactions

            if (!canSeeAll && user) {
                filteredByRole = allTransactions.filter(t => {
                    // Match by user ID
                    if (t.created_by_user_id && user.id) {
                        return t.created_by_user_id === user.id
                    }
                    // Fallback: Match by username/displayName if user ID not available
                    if (t.created_by_name) {
                        return t.created_by_name === user.username ||
                            t.created_by_name === user.displayName
                    }
                    return false
                })
            }

            setTransactions(filteredByRole)
            setSubCategories(data.subCategories)

        } catch (error) {
            console.error('Data load error:', error)
            toast.error(t.toast.connectionError)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [t, canSeeAll, user])

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

    const filteredTransactions = transactions
        .filter((t) => {
            const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.sub_category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
            const matchesType = filterType === "all" || t.type === filterType
            const matchesCurrency = filterCurrency === "all" || t.currency === filterCurrency
            const matchesSubCategory = filterSubCategory === "all" || t.sub_category === filterSubCategory
            return matchesSearch && matchesType && matchesCurrency && matchesSubCategory
        })
        .sort((a, b) => {
            const dateA = new Date(a.transaction_date || a.created_at || 0).getTime()
            const dateB = new Date(b.transaction_date || b.created_at || 0).getTime()
            return dateB - dateA
        })

    const handleExport = () => {
        exportToCSV(filteredTransactions, language)
        toast.success('CSV dosyası indiriliyor')
    }

    const handleRefresh = () => {
        loadData(true)
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t.transactions.title}</CardTitle>
                    <CardDescription>
                        {isAdmin ? t.transactions.adminDesc : t.transactions.userDesc}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SkeletonTable rows={8} columns={7} />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>{t.transactions.title}</CardTitle>
                        <CardDescription>
                            {isAdmin ? t.transactions.adminDesc : t.transactions.userDesc}
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {t.common.refresh}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            {t.common.export}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Search */}
                    <div className="relative sm:col-span-2 lg:col-span-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t.common.search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Type Filter */}
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

                    {/* Currency Filter */}
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

                    {/* Sub-Category Filter */}
                    <Select value={filterSubCategory} onValueChange={setFilterSubCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder={t.common.subCategory} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t.common.all}</SelectItem>
                            {subCategories.map((subCat) => (
                                <SelectItem key={subCat} value={subCat}>
                                    {subCat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Results */}
                {filteredTransactions.length === 0 ? (
                    <EmptyState
                        title={t.transactions.noResults}
                        description="Filtrelerinizi değiştirmeyi veya aramayı temizlemeyi deneyin."
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
                                        <TableHead>{t.common.subCategory}</TableHead>
                                        <TableHead>{t.common.currency}</TableHead>
                                        <TableHead>{t.common.type}</TableHead>
                                        <TableHead>{language === 'tr' ? 'Vade' : 'Due'}</TableHead>
                                        {canSeeCreatedBy && <TableHead>{t.transactions.createdBy}</TableHead>}
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
                                                {transaction.sub_category && (
                                                    <Badge variant="secondary">{transaction.sub_category}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{transaction.currency}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={transaction.type === "INCOME" ? "success" : "destructive"}>
                                                    {transaction.type === "INCOME" ? t.common.income : t.common.expense}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {transaction.due_date ? (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                                        <span className={new Date(transaction.due_date) < new Date() ? 'text-red-500 font-medium' : ''}>
                                                            {new Date(transaction.due_date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            {canSeeCreatedBy && (
                                                <TableCell className="text-muted-foreground text-sm">
                                                    <div className="flex items-center gap-1.5">
                                                        <User className="h-3.5 w-3.5" />
                                                        <span>
                                                            {transaction.created_by_name || "-"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            )}
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
