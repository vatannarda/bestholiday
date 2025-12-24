"use client"

import { useRouter } from "next/navigation"
import { Calculator, Truck, Users, BarChart3, Sparkles } from "lucide-react"
import { useTranslation } from "@/lib/store/language-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { ModuleCard } from "@/components/master-panel/ModuleCard"
import { PageHeader } from "@/components/ui/page-header"
import { SectionHeader } from "@/components/ui/section-header"
import { DemoBadge } from "@/components/ui/demo-badge"
import { Badge } from "@/components/ui/badge"

/**
 * Master Panel Home
 * /admin - Enterprise-grade module dashboard
 */
export default function AdminPage() {
    const router = useRouter()
    const { t } = useTranslation()
    const { user } = useAuthStore()

    const isAdmin = user?.role === 'admin'

    return (
        <div className="space-y-8">
            <DemoBadge />

            {/* Page Header with Product Branding */}
            <PageHeader
                title={t.masterPanel.modules}
                description={t.masterPanel.modulesDesc}
                badge={
                    <Badge variant="outline" className="text-xs font-normal">
                        {t.masterPanel.productName}
                    </Badge>
                }
            />

            {/* Active Modules Section */}
            <section>
                <SectionHeader
                    title={t.masterPanel.activeModules}
                    description="Kullanıma hazır iş modülleri"
                    action={
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xs text-emerald-600 font-medium">Çalışıyor</span>
                        </div>
                    }
                />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Accounting Module - Active */}
                    <ModuleCard
                        title={t.masterPanel.accountingModule}
                        description={t.masterPanel.accountingDesc}
                        icon={Calculator}
                        status="active"
                        statusLabel={t.masterPanel.active}
                        onClick={() => router.push('/admin/modules/accounting')}
                    />
                </div>
            </section>

            {/* Coming Soon Section */}
            <section>
                <SectionHeader
                    title={t.masterPanel.comingSoon}
                    description="Gelecek sürümlerde aktif olacak modüller"
                    action={
                        <Badge variant="secondary" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Yol Haritası
                        </Badge>
                    }
                />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Transfer System Module */}
                    <ModuleCard
                        title={t.masterPanel.transferModule}
                        description={t.masterPanel.transferDesc}
                        icon={Truck}
                        status="coming-soon"
                        statusLabel={t.masterPanel.comingSoon}
                        disabled
                    />

                    {/* CRM Module */}
                    <ModuleCard
                        title="CRM Modülü"
                        description="Müşteri ilişkileri yönetimi ve satış takibi"
                        icon={Users}
                        status="coming-soon"
                        statusLabel={t.masterPanel.comingSoon}
                        disabled
                    />

                    {/* Reporting Module */}
                    <ModuleCard
                        title="Raporlama Modülü"
                        description="Detaylı analiz ve iş zekası raporları"
                        icon={BarChart3}
                        status="coming-soon"
                        statusLabel={t.masterPanel.comingSoon}
                        disabled
                    />
                </div>
            </section>

            {/* System Status - Admin Only */}
            {isAdmin && (
                <section className="p-6 bg-muted/30 rounded-xl border border-border/60">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">
                        Sistem Durumu
                    </h3>
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">1</div>
                            <div className="text-xs text-muted-foreground">Aktif Modül</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">3</div>
                            <div className="text-xs text-muted-foreground">Planlanan</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-500">●</div>
                            <div className="text-xs text-muted-foreground">Sistem Sağlığı</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">v1.0</div>
                            <div className="text-xs text-muted-foreground">Versiyon</div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
