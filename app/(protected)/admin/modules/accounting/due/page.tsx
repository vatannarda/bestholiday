"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Clock, AlertTriangle, Calendar, Users2, Building2, Car, CheckCircle, Loader2, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { SkeletonTable } from "@/components/ui/skeleton"
import { useTranslation } from "@/lib/store/language-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { getDueItems } from "@/lib/api/due"
import { markAsPaid } from "@/lib/api/ledger"
import type { DueItem } from "@/lib/api/types"
import { MOVEMENT_TYPE_LABELS } from "@/lib/api/types"
import { toast } from "sonner"

/**
 * Due Tracking Page
 * /admin/modules/accounting/due
 */
export default function DuePage() {
    const router = useRouter()
    const { t, language } = useTranslation()
    const { user } = useAuthStore()

    const isAdmin = user?.role === 'admin'

    const [isLoading, setIsLoading] = useState(true)
    const [upcoming, setUpcoming] = useState<DueItem[]>([])
    const [overdue, setOverdue] = useState<DueItem[]>([])
    const [daysFilter, setDaysFilter] = useState<number>(14)
    const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all')

    const loadData = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await getDueItems({
                days: daysFilter,
                entityType: entityTypeFilter !== 'all' ? entityTypeFilter : undefined,
            })

            if (response.success && response.data) {
                setUpcoming(response.data.upcoming)
                setOverdue(response.data.overdue)
            }
        } catch (error) {
            console.error('Load due items error:', error)
            toast.error(t.toast.connectionError)
        } finally {
            setIsLoading(false)
        }
    }, [daysFilter, entityTypeFilter, t])

    useEffect(() => {
        loadData()
    }, [loadData])

    // Handle mark as paid
    const handleMarkAsPaid = async (id: string) => {
        try {
            const response = await markAsPaid({ id })
            if (response.success) {
                toast.success('Ödendi olarak işaretlendi')
                loadData()
            } else {
                toast.error(t.toast.error, { description: response.error })
            }
        } catch (error) {
            toast.error(t.toast.connectionError)
        }
    }

    // Get entity type icon
    const getEntityIcon = (type: string) => {
        switch (type) {
            case 'customer': return Users2
            case 'hotel': return Building2
            case 'vehicle_owner': return Car
            default: return Users2
        }
    }

    // Render due item card
    const renderDueItem = (item: DueItem, isOverdue: boolean) => {
        const Icon = getEntityIcon(item.entityType)
        const isReceivable = item.movementType === 'receivable'

        return (
            <Card key={item.id} className={`border-l-4 ${isOverdue ? 'border-l-red-500' : 'border-l-amber-500'}`}>
                <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="font-medium">{item.entityName}</h3>
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.entityCode}</code>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-lg font-bold ${isReceivable ? 'text-green-500' : 'text-red-500'}`}>
                                {isReceivable ? '+' : '-'}
                                {item.currency === 'TRY' && '₺'}
                                {item.currency === 'USD' && '$'}
                                {item.currency === 'EUR' && '€'}
                                {item.amount.toLocaleString(item.currency === 'TRY' ? 'tr-TR' : 'en-US')}
                            </div>
                            <Badge variant={isReceivable ? 'success' : 'destructive'} className="text-xs">
                                {MOVEMENT_TYPE_LABELS[item.movementType][language]}
                            </Badge>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t space-y-2">
                        {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    Vade: {item.dueDate && new Date(item.dueDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                                </span>
                                <Badge variant={isOverdue ? 'destructive' : 'warning'}>
                                    {isOverdue ? (
                                        <>{Math.abs(item.daysUntilDue)} {t.dueTracking.daysOverdue}</>
                                    ) : (
                                        <>{item.daysUntilDue} {t.dueTracking.daysUntilDue}</>
                                    )}
                                </Badge>
                            </div>
                            {item.reference && (
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.reference}</code>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/admin/modules/accounting/entities/${item.entityId}`)}
                        >
                            Cari Detay
                        </Button>
                        {isAdmin && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleMarkAsPaid(item.id)}
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {t.ledger.markAsPaid}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">{t.dueTracking.title}</h2>
                    <p className="text-muted-foreground">{t.dueTracking.subtitle}</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{t.dueTracking.filterDays}:</span>
                        </div>
                        <Select value={daysFilter.toString()} onValueChange={(v) => setDaysFilter(parseInt(v))}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">{t.dueTracking.next7Days}</SelectItem>
                                <SelectItem value="14">{t.dueTracking.next14Days}</SelectItem>
                                <SelectItem value="30">{t.dueTracking.next30Days}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Cari Türü" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t.common.all}</SelectItem>
                                <SelectItem value="customer">{t.entities.customers}</SelectItem>
                                <SelectItem value="hotel">{t.entities.hotels}</SelectItem>
                                <SelectItem value="vehicle_owner">{t.entities.vehicleOwners}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <Card>
                    <CardContent className="pt-6">
                        <SkeletonTable rows={5} columns={5} />
                    </CardContent>
                </Card>
            ) : (
                <Tabs defaultValue="overdue">
                    <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
                        <TabsTrigger value="overdue" className="gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {t.dueTracking.overduePayments}
                            {overdue.length > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-5 px-1">{overdue.length}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="upcoming" className="gap-2">
                            <Clock className="h-4 w-4" />
                            {t.dueTracking.upcoming}
                            {upcoming.length > 0 && (
                                <Badge variant="warning" className="h-5 min-w-5 px-1">{upcoming.length}</Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overdue" className="mt-6">
                        {overdue.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <EmptyState
                                        icon={CheckCircle}
                                        title={t.dueTracking.noOverdue}
                                        description="Tüm ödemeler zamanında yapılmış görünüyor."
                                    />
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {overdue.map(item => renderDueItem(item, true))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="upcoming" className="mt-6">
                        {upcoming.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <EmptyState
                                        icon={Clock}
                                        title={t.dueTracking.noUpcoming}
                                        description={`${daysFilter} gün içinde yaklaşan ödeme bulunmuyor.`}
                                    />
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {upcoming.map(item => renderDueItem(item, false))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    )
}
