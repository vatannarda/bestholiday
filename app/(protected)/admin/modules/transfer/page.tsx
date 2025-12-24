"use client"

import { Truck, Clock, Wrench } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/lib/store/language-store"

/**
 * Transfer Module Placeholder
 * /admin/modules/transfer
 */
export default function TransferModulePage() {
    const { t } = useTranslation()

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full">
                <CardContent className="pt-8 pb-8 text-center space-y-6">
                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                        <Truck className="w-10 h-10 text-muted-foreground" />
                    </div>

                    {/* Title & Badge */}
                    <div className="space-y-3">
                        <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {t.masterPanel.comingSoon}
                        </Badge>
                        <h1 className="text-2xl font-bold">{t.masterPanel.transferModule}</h1>
                        <p className="text-muted-foreground">
                            {t.masterPanel.transferDesc}
                        </p>
                    </div>

                    {/* Features Preview */}
                    <div className="pt-4 border-t space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Planlanan Özellikler</h3>
                        <div className="grid gap-2 text-sm text-left">
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                <Wrench className="h-4 w-4 text-primary" />
                                <span>Araç ve şoför yönetimi</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                <Wrench className="h-4 w-4 text-primary" />
                                <span>Transfer operasyon planlaması</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                <Wrench className="h-4 w-4 text-primary" />
                                <span>Muhasebe modülü ile otomatik entegrasyon</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                <Wrench className="h-4 w-4 text-primary" />
                                <span>Gerçek zamanlı takip</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
