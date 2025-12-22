"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Sparkles, Receipt, Clock, Loader2, Upload, X, FileText } from "lucide-react"
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
import { addTransactionWithFile, addTransaction } from "@/lib/actions/n8n"
import { toast } from "sonner"

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

// Manual form fields component - OUTSIDE main component to prevent focus loss
function ManualFormFields({
    formData,
    setFormData,
    isLoading,
}: {
    formData: {
        date: string
        amount: string
        type: "INCOME" | "EXPENSE"
        category: string
        description: string
    }
    setFormData: React.Dispatch<React.SetStateAction<typeof formData>>
    isLoading: boolean
}) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="manual-date">Tarih</Label>
                    <Input
                        id="manual-date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="manual-amount">Tutar (₺)</Label>
                    <Input
                        id="manual-amount"
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tür</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value: "INCOME" | "EXPENSE") => setFormData(prev => ({ ...prev, type: value }))}
                        disabled={isLoading}
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
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        disabled={isLoading}
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
                <Label htmlFor="manual-description">Açıklama</Label>
                <Input
                    id="manual-description"
                    placeholder="İşlem açıklaması..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    disabled={isLoading}
                />
            </div>
        </>
    )
}

export function WorkerDashboardClient({ recentTransactions }: WorkerDashboardClientProps) {
    const router = useRouter()
    const user = useAuthStore((state) => state.user)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // AI Input state
    const [aiInput, setAiInput] = useState("")
    const [aiLoading, setAiLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    // Manual form state
    const [manualForm, setManualForm] = useState({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        type: "EXPENSE" as "INCOME" | "EXPENSE",
        category: "",
        description: "",
    })
    const [manualLoading, setManualLoading] = useState(false)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Dosya Çok Büyük", {
                    description: "Maksimum dosya boyutu 10MB olabilir.",
                })
                return
            }
            setSelectedFile(file)
        }
    }

    const removeFile = () => {
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleAISubmit = async () => {
        if (!aiInput.trim()) return

        setAiLoading(true)

        try {
            let response

            if (selectedFile) {
                // Use FormData for binary file upload
                const formData = new FormData()
                formData.append('text', aiInput)
                formData.append('file', selectedFile)

                response = await addTransactionWithFile(formData)
            } else {
                // Text only
                response = await addTransaction(aiInput)
            }

            if (response.success) {
                toast.success("İşlem Başarıyla Eklendi", {
                    description: "Sayfa yenileniyor...",
                })
                setAiInput("")
                setSelectedFile(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }
                setTimeout(() => {
                    router.refresh()
                }, 1000)
            } else {
                toast.error("Hata", {
                    description: response.error || "İşlem kaydedilemedi. Lütfen tekrar deneyin.",
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

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!manualForm.amount || !manualForm.category || !manualForm.description) {
            toast.error("Eksik Bilgi", {
                description: "Lütfen tüm alanları doldurun.",
            })
            return
        }

        setManualLoading(true)

        // Build a natural language string for n8n
        const text = `${manualForm.date} tarihinde ${manualForm.category} kategorisinde ${manualForm.amount} TL ${manualForm.type === 'INCOME' ? 'gelir' : 'gider'}: ${manualForm.description}`

        try {
            const response = await addTransaction(text)

            if (response.success) {
                toast.success("İşlem Başarıyla Eklendi", {
                    description: "Sayfa yenileniyor...",
                })
                setManualForm({
                    date: new Date().toISOString().split("T")[0],
                    amount: "",
                    type: "EXPENSE",
                    category: "",
                    description: "",
                })
                setTimeout(() => {
                    router.refresh()
                }, 1000)
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
                                    <Label htmlFor="ai-text-input">İşlemi Doğal Dilde Yazın</Label>
                                    <Textarea
                                        id="ai-text-input"
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

                                {/* File Upload Section */}
                                <div className="space-y-2">
                                    <Label>Dosya Ekle (Opsiyonel)</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
                                            disabled={aiLoading}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={aiLoading}
                                            className="gap-2"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Dosya Seç
                                        </Button>
                                        {selectedFile && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5"
                                                    onClick={removeFile}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        PDF, resim veya Excel dosyası ekleyebilirsiniz. Dosya binary olarak webhook&apos;a gönderilir.
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
                        </TabsContent>

                        <TabsContent value="manual">
                            <form onSubmit={handleManualSubmit} className="space-y-4">
                                <ManualFormFields
                                    formData={manualForm}
                                    setFormData={setManualForm}
                                    isLoading={manualLoading}
                                />

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
