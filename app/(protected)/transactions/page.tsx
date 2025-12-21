"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, Download, RefreshCw, Loader2 } from "lucide-react"
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
import { useAuthStore } from "@/lib/store/auth-store"
import { fetchDashboardData, type Transaction } from "@/lib/actions/n8n"

// Refresh interval: 5 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000

// CSV Export function with UTF-8 BOM for Excel compatibility
function exportToCSV(transactions: Transaction[]) {
    // UTF-8 BOM for Excel to recognize Turkish characters
    const BOM = '\uFEFF'

    // CSV Header
    const headers = ['Tarih', 'Kategori', 'Açıklama', 'Tutar', 'Tip']

    // CSV Rows
    const rows = transactions.map(t => [
        t.date ? new Date(t.date).toLocaleDateString('tr-TR') : '-',
        t.category,
        // Escape quotes in description
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `${t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString('tr-TR')} TL`,
        t.type === 'INCOME' ? 'Gelir' : 'Gider'
    ])

    // Combine headers and rows
    const csvContent = BOM + [
        headers.join(';'),
        ...rows.map(row => row.join(';'))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    // Filename with date
    const today = new Date().toISOString().split('T')[0]
    link.href = url
    link.download = `islemler-${today}.csv`

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export default function TransactionsPage() {
    const user = useAuthStore((state) => state.user)
    const isAdmin = user?.role === "admin"

    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState<"all" | "INCOME" | "EXPENSE">("all")

    // Load data from webhook
    const loadData = useCallback(async (showIndicator = false) => {
        try {
            if (showIndicator) setIsRefreshing(true)
            const data = await fetchDashboardData()
            setTransactions(data.transactions)
        } catch (error) {
            console.error('Data load error:', error)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [])

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
                t.category.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesType = filterType === "all" || t.type === filterType
            return matchesSearch && matchesType
        })
        .sort((a, b) => {
            // Sort by created_at descending (newest first)
            const dateA = new Date(a.created_at || a.date || 0).getTime()
            const dateB = new Date(b.created_at || b.date || 0).getTime()
            return dateB - dateA
        })

    const handleExport = () => {
        exportToCSV(filteredTransactions)
    }

    const handleRefresh = () => {
        loadData(true)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Veriler yükleniyor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Tüm İşlemler</CardTitle>
                            <CardDescription>
                                {isAdmin ? "Webhook'tan alınan tüm finansal hareketler" : "İşlemlerinizi görüntüleyin"}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Refresh Button */}
                            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Yenile
                            </Button>
                            {/* Excel Export Button */}
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Excel&apos;e Aktar
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={filterType} onValueChange={(value: "all" | "INCOME" | "EXPENSE") => setFilterType(value)}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tümü</SelectItem>
                                <SelectItem value="INCOME">Gelirler</SelectItem>
                                <SelectItem value="EXPENSE">Giderler</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tarih</TableHead>
                                    <TableHead>Açıklama</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Tür</TableHead>
                                    <TableHead className="text-right">Tutar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            İşlem bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">
                                                {transaction.date ? new Date(transaction.date).toLocaleDateString("tr-TR") : '-'}
                                            </TableCell>
                                            <TableCell>{transaction.description}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{transaction.category}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={transaction.type === "INCOME" ? "success" : "destructive"}>
                                                    {transaction.type === "INCOME" ? "Gelir" : "Gider"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${transaction.type === "INCOME" ? "text-green-500" : "text-red-500"
                                                }`}>
                                                {transaction.type === "INCOME" ? "+" : "-"}₺{transaction.amount.toLocaleString("tr-TR")}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
