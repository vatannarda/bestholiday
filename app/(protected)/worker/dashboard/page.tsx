"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Receipt, Clock, Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { TransactionCard } from "@/components/transaction-card"
import { useAuthStore } from "@/lib/store/auth-store"
import { useTranslation } from "@/lib/store/language-store"
import { addTransaction, fetchDashboardData, type Transaction } from "@/lib/actions/n8n"
import { getCurrencySymbol } from "@/lib/utils/dashboard"
import { toast } from "sonner"

// Refresh interval: 5 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000

export default function WorkerDashboard() {
    const router = useRouter()
    const user = useAuthStore((state) => state.user)
    const { t, language } = useTranslation()

    // Data state
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // AI Input state
    const [aiInput, setAiInput] = useState("")
    const [aiLoading, setAiLoading] = useState(false)

    // Fetch data from webhook
    const loadData = useCallback(async (showToast = false) => {
        // Critical Security: If user is not strictly defined, do not fetch data
        if (!user || !user.id) {
            setTransactions([])
            setIsDataLoading(false)
            return
        }

        try {
            if (showToast) setIsRefreshing(true)

            const data = await fetchDashboardData()

            // Filter to show only worker's own transactions
            const myTransactions = data.transactions.filter(t => {
                if (t.created_by_user_id) {
                    return String(t.created_by_user_id) === String(user.id)
                }
                if (t.created_by_name) {
                    return t.created_by_name === user.username || t.created_by_name === user.displayName
                }
                return false
            })

            setTransactions(myTransactions.slice(0, 10))

            if (showToast) {
                toast.success(t.toast.dataUpdated)
            }
        } catch (error) {
            console.error('Data load error:', error)
            if (showToast) {
                toast.error(t.toast.dataLoadError)
            }
        } finally {
            setIsDataLoading(false)
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

    const handleAISubmit = async () => {
        if (!aiInput.trim()) return

        setAiLoading(true)

        try {
            const response = await addTransaction(aiInput, user?.id)

            if (response.success) {
                toast.success(t.toast.success, {
                    description: t.toast.refreshing,
                })
                setAiInput("")
                setTimeout(() => {
                    loadData()
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

    const handleRefresh = () => {
        loadData(true)
    }

    if (isDataLoading) {
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
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-none">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/20 rounded-full">
                                <Receipt className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">{t.worker.welcome}, {user?.displayName}!</h2>
                                <p className="text-muted-foreground">{t.worker.welcomeDesc}</p>
                            </div>
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
                </CardContent>
            </Card>

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
                            <Label htmlFor="worker-ai-input">{t.dashboard.writeNaturally}</Label>
                            <Textarea
                                id="worker-ai-input"
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

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {t.dashboard.recentTrans}
                    </CardTitle>
                    <CardDescription>
                        {t.worker.last10}
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
                                {transactions.map((transaction) => (
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
                                            <TableHead className="text-right">{t.common.amount}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((transaction) => (
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
