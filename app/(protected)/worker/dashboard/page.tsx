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
import { useAuthStore } from "@/lib/store/auth-store"
import { addTransaction, fetchDashboardData, type Transaction } from "@/lib/actions/n8n"
import { toast } from "sonner"

// Refresh interval: 5 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000

export default function WorkerDashboard() {
    const router = useRouter()
    const user = useAuthStore((state) => state.user)

    // Data state
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // AI Input state
    const [aiInput, setAiInput] = useState("")
    const [aiLoading, setAiLoading] = useState(false)

    // Fetch data from webhook
    const loadData = useCallback(async (showToast = false) => {
        try {
            if (showToast) setIsRefreshing(true)

            const data = await fetchDashboardData()
            setTransactions(data.transactions.slice(0, 10))

            if (showToast) {
                toast.success("Veriler Güncellendi")
            }
        } catch (error) {
            console.error('Data load error:', error)
            if (showToast) {
                toast.error("Veri Yükleme Hatası")
            }
        } finally {
            setIsDataLoading(false)
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

    const handleAISubmit = async () => {
        if (!aiInput.trim()) return

        setAiLoading(true)

        try {
            const response = await addTransaction(aiInput)

            if (response.success) {
                toast.success("İşlem Başarıyla Eklendi", {
                    description: "Veriler yenileniyor...",
                })
                setAiInput("")
                setTimeout(() => {
                    loadData()
                    router.refresh()
                }, 1500)
            } else {
                toast.error("Hata", {
                    description: response.error || "İşlem kaydedilemedi.",
                })
            }
        } catch {
            toast.error("Bağlantı Hatası", {
                description: "Sunucuya bağlanılamadı.",
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
                    <p className="text-muted-foreground">Veriler yükleniyor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-none">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/20 rounded-full">
                                <Receipt className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Hoş geldin, {user?.displayName}!</h2>
                                <p className="text-muted-foreground">AI ile doğal dilde işlem ekleyebilirsin.</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Yenile
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* AI Quick Add - Only AI */}
            <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Hızlı İşlem Ekle
                    </CardTitle>
                    <CardDescription>
                        Yapay zeka ile doğal dilde işlem ekleyin
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="worker-ai-input">İşlemi Doğal Dilde Yazın</Label>
                            <Textarea
                                id="worker-ai-input"
                                placeholder="Örn: Bugün Ahmet'e 500 TL mazot parası verdim"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                className="min-h-[100px]"
                                disabled={aiLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                n8n webhook&apos;u yazınızı analiz edip veritabanına kaydedecektir.
                            </p>
                        </div>

                        <Button
                            onClick={handleAISubmit}
                            disabled={aiLoading || !aiInput.trim()}
                            className="w-full"
                        >
                            {aiLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Gönderiliyor...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    AI ile Kaydet
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
                        Son İşlemler
                    </CardTitle>
                    <CardDescription>
                        Webhook&apos;tan alınan son 10 işlem
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Henüz işlem bulunmuyor.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tarih</TableHead>
                                    <TableHead>Açıklama</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead className="text-right">Tutar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-medium">
                                            {transaction.date ? new Date(transaction.date).toLocaleDateString("tr-TR") : '-'}
                                        </TableCell>
                                        <TableCell>{transaction.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{transaction.category}</Badge>
                                        </TableCell>
                                        <TableCell className={`text-right font-medium ${transaction.type === "INCOME" ? "text-green-500" : "text-red-500"
                                            }`}>
                                            {transaction.type === "INCOME" ? "+" : "-"}₺{transaction.amount.toLocaleString("tr-TR")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
