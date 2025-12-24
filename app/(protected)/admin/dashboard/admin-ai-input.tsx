"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { addTransaction } from "@/lib/actions/n8n"
import { useAuthStore } from "@/lib/store/auth-store"
import { toast } from "sonner"

export function AdminAiInput() {
    const router = useRouter()
    const [aiInput, setAiInput] = useState("")
    const [aiLoading, setAiLoading] = useState(false)

    const handleAISubmit = async () => {
        if (!aiInput.trim()) return

        setAiLoading(true)

        try {
            const user = useAuthStore.getState().user
            const response = await addTransaction(aiInput, user?.id)

            if (response.success) {
                toast.success("İşlem Başarıyla Eklendi", {
                    description: "Veriler yenileniyor...",
                })
                setAiInput("")
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
                description: "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.",
            })
        } finally {
            setAiLoading(false)
        }
    }

    return (
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
                        <Label htmlFor="ai-input">İşlemi Yazın</Label>
                        <Textarea
                            id="ai-input"
                            placeholder="Örn: Bugün Ahmet'e 500 TL mazot parası verdim"
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            className="min-h-[80px] resize-none"
                            disabled={aiLoading}
                        />
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
    )
}
