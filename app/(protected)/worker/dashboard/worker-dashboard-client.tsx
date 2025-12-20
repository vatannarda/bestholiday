"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Sparkles, Receipt, Clock, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useAuthStore } from "@/lib/store/auth-store"
import { addTransaction } from "@/lib/actions/n8n"

const categories = [
    "Tur Satışı",
    "Otel Komisyonu",
    "Transfer",
    "Yakıt",
    "Personel",
    "Ofis Gideri",
    "Reklam",
    "Diğer",
]

interface WorkerDashboardClientProps {
    recentTransactions: Array<{
        id: string
        amount: number
        type: 'INCOME' | 'EXPENSE'
        category: string
        description: string
        date: string
    }>
}

export function WorkerDashboardClient({ recentTransactions }: WorkerDashboardClientProps) {
    const router = useRouter()
    const user = useAuthStore((state) => state.user)

    // AI Input state
    const [aiInput, setAiInput] = useState("")
    const [aiLoading, setAiLoading] = useState(false)
    const [aiResult, setAiResult] = useState<string | null>(null)

    // Manual form state
    const [manualForm, setManualForm] = useState({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        type: "EXPENSE" as "INCOME" | "EXPENSE",
        category: "",
        description: "",
    })
    const [manualLoading, setManualLoading] = useState(false)

    const handleAISubmit = async () => {
        if (!aiInput.trim()) return

        setAiLoading(true)
        setAiResult(null)

        try {
            const response = await addTransaction(aiInput)

            if (response.success) {
                setAiResult("✅ İşlem başarıyla kaydedildi! Sayfa yenileniyor...")
                setAiInput("")
                // Refresh the page to get updated data
                setTimeout(() => {
                    router.refresh()
                }, 1500)
            } else {
                setAiResult(`❌ ${response.error || 'İşlem kaydedilemedi. Lütfen tekrar deneyin.'}`)
            }
        } catch {
            setAiResult("❌ Bağlantı hatası oluştu.")
        } finally {
            setAiLoading(false)
        }
    }

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!manualForm.amount || !manualForm.category || !manualForm.description) {
            return
        }

        setManualLoading(true)

        // Build a natural language string for n8n
        const text = `${manualForm.date} tarihinde ${manualForm.category} kategorisinde ${manualForm.amount} TL ${manualForm.type === 'INCOME' ? 'gelir' : 'gider'}: ${manualForm.description}`

        try {
            const response = await addTransaction(text)

            if (response.success) {
                setManualForm({
                    date: new Date().toISOString().split("T")[0],
                    amount: "",
                    type: "EXPENSE",
                    category: "",
                    description: "",
                })
                router.refresh()
            }
        } catch (error) {
            console.error('Manual submit error:', error)
        } finally {
            setManualLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-none">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/20 rounded-full">
                            <Receipt className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Hoş geldin, {user?.displayName}!</h2>
                            <p className="text-muted-foreground">AI ile doğal dilde işlem ekleyebilirsin.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Transaction Entry */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle className="h-5 w-5" />
                        Hızlı İşlem Ekle
                    </CardTitle>
                    <CardDescription>
                        Yapay zeka ile yazarak veya manuel form ile işlem ekleyin
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="ai" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="ai" className="gap-2">
                                <Sparkles className="h-4 w-4" />
                                AI ile Ekle
                            </TabsTrigger>
                            <TabsTrigger value="manual" className="gap-2">
                                <Receipt className="h-4 w-4" />
                                Manuel Giriş
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="ai">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>İşlemi Doğal Dilde Yazın</Label>
                                    <Textarea
                                        placeholder="Örn: Bugün Ahmet'e 500 TL mazot parası verdim"
                                        value={aiInput}
                                        onChange={(e) => setAiInput(e.target.value)}
                                        className="min-h-[100px]"
                                        disabled={aiLoading}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        n8n webhook&apos;u yazınızı analiz edip PostgreSQL&apos;e kaydedecektir.
                                    </p>
                                </div>

                                {aiResult && (
                                    <div className={`p-3 rounded-lg ${aiResult.startsWith("✅") ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                                        }`}>
                                        {aiResult}
                                    </div>
                                )}

                                <Button
                                    onClick={handleAISubmit}
                                    disabled={aiLoading || !aiInput.trim()}
                                    className="w-full"
                                >
                                    {aiLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            n8n&apos;e Gönderiliyor...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            AI ile Kaydet
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="manual">
                            <form onSubmit={handleManualSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Tarih</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={manualForm.date}
                                            onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                                            disabled={manualLoading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Tutar (₺)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="0.00"
                                            value={manualForm.amount}
                                            onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                                            disabled={manualLoading}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tür</Label>
                                        <Select
                                            value={manualForm.type}
                                            onValueChange={(value: "INCOME" | "EXPENSE") => setManualForm({ ...manualForm, type: value })}
                                            disabled={manualLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INCOME">Gelir</SelectItem>
                                                <SelectItem value="EXPENSE">Gider</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kategori</Label>
                                        <Select
                                            value={manualForm.category}
                                            onValueChange={(value) => setManualForm({ ...manualForm, category: value })}
                                            disabled={manualLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçin..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Açıklama</Label>
                                    <Input
                                        id="description"
                                        placeholder="İşlem açıklaması..."
                                        value={manualForm.description}
                                        onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                                        disabled={manualLoading}
                                    />
                                </div>

                                <Button type="submit" disabled={manualLoading} className="w-full">
                                    {manualLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            İşlemi Kaydet
                                        </>
                                    )}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
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
                        Veritabanından alınan son 10 işlem
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {recentTransactions.length === 0 ? (
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
                                {recentTransactions.map((transaction) => (
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
