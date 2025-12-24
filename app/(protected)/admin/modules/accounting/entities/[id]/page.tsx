"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Copy, Phone, Mail, Edit2, Plus, TrendingUp, TrendingDown, AlertTriangle, Clock, CheckCircle, Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { SkeletonTable, SkeletonKPICards } from "@/components/ui/skeleton"
import { useTranslation } from "@/lib/store/language-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { getEntity, updateEntity } from "@/lib/api/entities"
import { getLedgerEntries, markAsPaid } from "@/lib/api/ledger"
import type { Entity, EntityBalanceSummary, LedgerEntry, UpdateEntityRequest } from "@/lib/api/types"
import { ENTITY_TYPE_LABELS, LEDGER_STATUS_LABELS, MOVEMENT_TYPE_LABELS, LEDGER_STATUS_VARIANTS } from "@/lib/api/types"
import { toast } from "sonner"

/**
 * Entity Detail Page
 * /admin/modules/accounting/entities/[id]
 */
export default function EntityDetailPage() {
    const router = useRouter()
    const params = useParams()
    const entityId = params.id as string
    const { t, language } = useTranslation()
    const { user } = useAuthStore()

    const isAdmin = user?.role === 'admin'

    const [entity, setEntity] = useState<Entity | null>(null)
    const [summary, setSummary] = useState<EntityBalanceSummary | null>(null)
    const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Edit dialog state
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [editForm, setEditForm] = useState({
        name: '',
        contactName: '',
        phone: '',
        email: '',
        notes: '',
    })

    const loadData = useCallback(async (showRefresh = false) => {
        if (showRefresh) {
            setIsRefreshing(true)
        } else {
            setIsLoading(true)
        }
        try {
            const [entityRes, ledgerRes] = await Promise.all([
                getEntity(entityId),
                getLedgerEntries(entityId),
            ])

            if (entityRes.success && entityRes.data) {
                setEntity(entityRes.data.entity || null)
                setSummary(entityRes.data.summary || null)
            }

            if (ledgerRes.success && ledgerRes.data) {
                setLedgerEntries(ledgerRes.data.entries || [])
                if (ledgerRes.data.summary) {
                    setSummary(ledgerRes.data.summary)
                }
            }
        } catch (error) {
            console.error('Load entity error:', error)
            toast.error(t.toast.connectionError)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [entityId, t])

    const handleRefresh = () => {
        loadData(true)
    }

    useEffect(() => {
        loadData()
    }, [loadData])

    // Copy entity code
    const copyCode = () => {
        if (entity) {
            navigator.clipboard.writeText(entity.code)
            toast.success('Kod kopyalandı')
        }
    }

    // Handle mark as paid (Admin only)
    const handleMarkAsPaid = async (entryId: string) => {
        try {
            const response = await markAsPaid({ id: entryId })
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

    // Open edit dialog with current entity values
    const openEditDialog = () => {
        if (entity) {
            setEditForm({
                name: entity.name,
                contactName: entity.contactName || '',
                phone: entity.phone || '',
                email: entity.email || '',
                notes: entity.notes || '',
            })
            setIsEditOpen(true)
        }
    }

    // Handle entity update
    const handleUpdate = async () => {
        if (!entity) return

        setIsUpdating(true)
        try {
            const updateData: UpdateEntityRequest = {
                id: entity.id,
                name: editForm.name,
                contactName: editForm.contactName || undefined,
                phone: editForm.phone || undefined,
                email: editForm.email || undefined,
                notes: editForm.notes || undefined,
            }

            const response = await updateEntity(updateData)
            if (response.success) {
                toast.success(language === 'tr' ? 'Cari hesap güncellendi' : 'Entity updated')
                setIsEditOpen(false)
                loadData()
            } else {
                toast.error(t.toast.error, { description: response.error })
            }
        } catch (error) {
            console.error('Update entity error:', error)
            toast.error(t.toast.connectionError)
        } finally {
            setIsUpdating(false)
        }
    }

    // Get movement type icon and color
    const getMovementStyle = (type: string) => {
        switch (type) {
            case 'receivable':
            case 'income':
                return { icon: TrendingUp, color: 'text-green-500' }
            case 'payable':
            case 'expense':
                return { icon: TrendingDown, color: 'text-red-500' }
            default:
                return { icon: TrendingUp, color: 'text-muted-foreground' }
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" disabled>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Geri
                </Button>
                <SkeletonKPICards count={3} />
                <Card>
                    <CardContent className="pt-6">
                        <SkeletonTable rows={5} columns={6} />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!entity) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Geri
                </Button>
                <Card>
                    <CardContent className="pt-6">
                        <EmptyState
                            icon={AlertTriangle}
                            title="Cari Bulunamadı"
                            description="Aradığınız cari hesap bulunamadı veya silinmiş olabilir."
                            action={{
                                label: "Cari Listesine Dön",
                                onClick: () => router.push('/admin/modules/accounting/entities'),
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
            </Button>

            {/* Entity Header */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold">{entity.name}</h1>
                                <Badge variant={entity.isActive ? 'success' : 'secondary'}>
                                    {entity.isActive ? t.users.active : t.users.inactive}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="text-lg bg-muted px-3 py-1 rounded font-mono">{entity.code}</code>
                                <Button variant="ghost" size="icon" onClick={copyCode}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline">
                                    {ENTITY_TYPE_LABELS[entity.type][language]}
                                </Badge>
                                {entity.tags?.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {t.common.refresh}
                            </Button>
                            <Button variant="outline" onClick={openEditDialog}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                {language === 'tr' ? 'Düzenle' : 'Edit'}
                            </Button>
                        </div>
                    </div>

                    {/* Contact Info */}
                    {(entity.contactName || entity.phone || entity.email) && (
                        <div className="mt-4 pt-4 border-t flex flex-wrap gap-4">
                            {entity.contactName && (
                                <span className="text-sm">{entity.contactName}</span>
                            )}
                            {entity.phone && (
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    {entity.phone}
                                </span>
                            )}
                            {entity.email && (
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {entity.email}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Notes */}
                    {entity.notes && (
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">{entity.notes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Balance Summary */}
            {summary && (
                <div>
                    <h2 className="text-lg font-semibold mb-4">{t.entities.balanceSummary}</h2>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {summary.byCurrency.map(({ currency, receivable, payable, net }) => (
                            <Card key={currency}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                        <span>{currency} {t.accounting.netBalance}</span>
                                        <span className="text-lg">{currency === 'TRY' ? '₺' : currency === 'USD' ? '$' : '€'}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {currency === 'TRY' && '₺'}
                                        {currency === 'USD' && '$'}
                                        {currency === 'EUR' && '€'}
                                        {net.toLocaleString(currency === 'TRY' ? 'tr-TR' : 'en-US')}
                                    </div>
                                    <div className="flex gap-4 text-xs mt-2">
                                        <span className="text-green-500">
                                            +{currency === 'TRY' ? '₺' : currency === 'USD' ? '$' : '€'}
                                            {receivable.toLocaleString(currency === 'TRY' ? 'tr-TR' : 'en-US')}
                                        </span>
                                        <span className="text-red-500">
                                            -{currency === 'TRY' ? '₺' : currency === 'USD' ? '$' : '€'}
                                            {payable.toLocaleString(currency === 'TRY' ? 'tr-TR' : 'en-US')}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Due Stats */}
                        <Card className={summary.overdueCount > 0 ? 'border-red-500/50' : ''}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Vade Durumu
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <div>
                                        <div className={`text-2xl font-bold ${summary.overdueCount > 0 ? 'text-red-500' : ''}`}>
                                            {summary.overdueCount}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Gecikmiş</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-amber-500">{summary.upcomingDueCount}</div>
                                        <div className="text-xs text-muted-foreground">Yaklaşan</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Ledger Entries */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{t.entities.accountMovements}</CardTitle>
                            <CardDescription>Bu cari hesaba ait tüm hareketler</CardDescription>
                        </div>
                        <Button onClick={() => toast.info('Hareket ekleme yakında')}>
                            <Plus className="h-4 w-4 mr-2" />
                            {t.ledger.addEntry}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {ledgerEntries.length === 0 ? (
                        <EmptyState
                            icon={TrendingUp}
                            title={t.ledger.noEntries}
                            description="Bu cari hesabın henüz hareketi bulunmuyor."
                            action={{
                                label: t.ledger.addEntry,
                                onClick: () => toast.info('Hareket ekleme yakında'),
                            }}
                        />
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t.common.date}</TableHead>
                                            <TableHead>{t.ledger.movementType}</TableHead>
                                            <TableHead>{t.common.description}</TableHead>
                                            <TableHead>{t.ledger.reference}</TableHead>
                                            <TableHead>{t.ledger.status}</TableHead>
                                            <TableHead>{t.ledger.dueDate}</TableHead>
                                            <TableHead className="text-right">{t.common.amount}</TableHead>
                                            {isAdmin && <TableHead className="text-right">{t.users.actions}</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ledgerEntries.map((entry) => {
                                            const moveStyle = getMovementStyle(entry.movementType)
                                            const MoveIcon = moveStyle.icon
                                            return (
                                                <TableRow key={entry.id}>
                                                    <TableCell className="font-medium">
                                                        {new Date(entry.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <MoveIcon className={`h-4 w-4 ${moveStyle.color}`} />
                                                            {MOVEMENT_TYPE_LABELS[entry.movementType][language]}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px]">
                                                        <div className="truncate">{entry.description || '-'}</div>
                                                        {entry.operationId && (
                                                            <div className="text-xs text-muted-foreground">
                                                                Op: {entry.operationId}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {entry.reference ? (
                                                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{entry.reference}</code>
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={LEDGER_STATUS_VARIANTS[entry.status]}>
                                                            {LEDGER_STATUS_LABELS[entry.status][language]}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {entry.dueDate ? (
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                                {new Date(entry.dueDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                                                            </div>
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell className={`text-right font-medium ${moveStyle.color}`}>
                                                        {entry.movementType === 'receivable' || entry.movementType === 'income' ? '+' : '-'}
                                                        {entry.currency === 'TRY' && '₺'}
                                                        {entry.currency === 'USD' && '$'}
                                                        {entry.currency === 'EUR' && '€'}
                                                        {entry.amount.toLocaleString(entry.currency === 'TRY' ? 'tr-TR' : 'en-US')}
                                                    </TableCell>
                                                    {isAdmin && (
                                                        <TableCell className="text-right">
                                                            {entry.status !== 'paid' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleMarkAsPaid(entry.id)}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    {t.ledger.markAsPaid}
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="grid gap-3 md:hidden">
                                {ledgerEntries.map((entry) => {
                                    const moveStyle = getMovementStyle(entry.movementType)
                                    const MoveIcon = moveStyle.icon
                                    return (
                                        <Card key={entry.id} className="border-l-4" style={{ borderLeftColor: moveStyle.color.includes('green') ? '#22c55e' : '#ef4444' }}>
                                            <CardContent className="pt-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <MoveIcon className={`h-4 w-4 ${moveStyle.color}`} />
                                                            <span className="font-medium">{MOVEMENT_TYPE_LABELS[entry.movementType][language]}</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">{entry.description || '-'}</p>
                                                    </div>
                                                    <div className={`text-lg font-bold ${moveStyle.color}`}>
                                                        {entry.movementType === 'receivable' || entry.movementType === 'income' ? '+' : '-'}
                                                        {entry.currency === 'TRY' && '₺'}
                                                        {entry.currency === 'USD' && '$'}
                                                        {entry.currency === 'EUR' && '€'}
                                                        {entry.amount.toLocaleString(entry.currency === 'TRY' ? 'tr-TR' : 'en-US')}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(entry.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                                                    </span>
                                                    <Badge variant={LEDGER_STATUS_VARIANTS[entry.status]} className="text-xs">
                                                        {LEDGER_STATUS_LABELS[entry.status][language]}
                                                    </Badge>
                                                    {entry.reference && (
                                                        <code className="text-xs bg-muted px-1 rounded">{entry.reference}</code>
                                                    )}
                                                </div>
                                                {isAdmin && entry.status !== 'paid' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full mt-3"
                                                        onClick={() => handleMarkAsPaid(entry.id)}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        {t.ledger.markAsPaid}
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Edit Entity Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {language === 'tr' ? 'Cari Hesap Düzenle' : 'Edit Entity'}
                        </DialogTitle>
                        <DialogDescription>
                            {entity?.name} - {entity && ENTITY_TYPE_LABELS[entity.type][language]}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Entity Name */}
                        <div className="space-y-2">
                            <Label>{language === 'tr' ? 'Cari Adı' : 'Entity Name'} *</Label>
                            <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>

                        {/* Contact Name */}
                        <div className="space-y-2">
                            <Label>{language === 'tr' ? 'Yetkili Kişi' : 'Contact Name'}</Label>
                            <Input
                                value={editForm.contactName}
                                onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                            />
                        </div>

                        {/* Phone & Email */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{language === 'tr' ? 'Telefon' : 'Phone'}</Label>
                                <Input
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>E-posta</Label>
                                <Input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label>{language === 'tr' ? 'Notlar' : 'Notes'}</Label>
                            <Textarea
                                value={editForm.notes}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                            {t.common.cancel}
                        </Button>
                        <Button onClick={handleUpdate} disabled={isUpdating || !editForm.name.trim()}>
                            {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Edit2 className="h-4 w-4 mr-2" />
                            )}
                            {language === 'tr' ? 'Güncelle' : 'Update'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
