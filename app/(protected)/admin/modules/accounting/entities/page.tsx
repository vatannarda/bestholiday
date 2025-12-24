"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Copy, Phone, Mail, MoreHorizontal, Loader2, Building2, Users, Car, Building, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { SkeletonTable } from "@/components/ui/skeleton"
import { useTranslation } from "@/lib/store/language-store"
import { getEntities, createEntity, toggleEntityStatus, deleteEntity } from "@/lib/api/entities"
import type { Entity, EntityType, CreateEntityRequest } from "@/lib/api/types"
import { ENTITY_TYPE_LABELS } from "@/lib/api/types"
import { toast } from "sonner"

/**
 * Entities List Page
 * /admin/modules/accounting/entities
 */
export default function EntitiesPage() {
    const router = useRouter()
    const { t, language } = useTranslation()

    const [entities, setEntities] = useState<Entity[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<EntityType | 'all'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Create entity dialog state
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newEntity, setNewEntity] = useState<CreateEntityRequest>({
        type: 'customer',
        name: '',
        contactName: '',
        phone: '',
        email: '',
        notes: '',
    })


    const loadEntities = useCallback(async (showRefresh = false) => {
        if (showRefresh) {
            setIsRefreshing(true)
        } else {
            setIsLoading(true)
        }
        try {
            const response = await getEntities()
            if (response.success && response.data) {
                setEntities(response.data.entities || [])
            } else {
                setEntities([])
            }
        } catch (error) {
            console.error('Load entities error:', error)
            toast.error(t.toast.connectionError)
            setEntities([])
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [t])

    const handleRefresh = () => {
        loadEntities(true)
    }

    useEffect(() => {
        loadEntities()
    }, [loadEntities])

    // Filter entities by tab and search - with null safety
    const filteredEntities = (entities || []).filter(entity => {
        const matchesTab = activeTab === 'all' || entity.type === activeTab
        const matchesSearch = searchQuery === '' ||
            entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entity.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entity.contactName?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesTab && matchesSearch
    })

    // Copy entity code to clipboard
    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        toast.success('Kod kopyalandı')
    }

    // Get entity type icon
    const getEntityIcon = (type: EntityType) => {
        switch (type) {
            case 'customer': return Users
            case 'hotel': return Building2
            case 'vehicle_owner': return Car
            case 'sub_agency': return Building
            default: return Users
        }
    }

    // Get entity count by type - with null safety
    const getCountByType = (type: EntityType | 'all') => {
        const safeEntities = entities || []
        if (type === 'all') return safeEntities.length
        return safeEntities.filter(e => e.type === type).length
    }

    // Handle create entity
    const handleCreate = async () => {
        if (!newEntity.name.trim()) {
            toast.error(language === 'tr' ? 'Cari adı zorunludur' : 'Entity name is required')
            return
        }

        setIsSubmitting(true)
        try {
            const response = await createEntity(newEntity)
            if (response.success) {
                toast.success(language === 'tr' ? 'Cari hesap oluşturuldu' : 'Entity created successfully')
                setIsCreateOpen(false)
                setNewEntity({
                    type: 'customer',
                    name: '',
                    contactName: '',
                    phone: '',
                    email: '',
                    notes: '',
                })
                loadEntities()
            } else {
                toast.error(t.toast.error, { description: response.error })
            }
        } catch (error) {
            console.error('Create entity error:', error)
            toast.error(t.toast.connectionError)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Reset form when dialog closes
    const handleDialogClose = (open: boolean) => {
        setIsCreateOpen(open)
        if (!open) {
            setNewEntity({
                type: 'customer',
                name: '',
                contactName: '',
                phone: '',
                email: '',
                notes: '',
            })
        }
    }

    // Handle toggle entity status (active/inactive)
    const handleToggle = async (id: string, entityName: string) => {
        try {
            const response = await toggleEntityStatus(id)
            if (response.success) {
                toast.success(language === 'tr'
                    ? `${entityName} durumu güncellendi`
                    : `${entityName} status updated`)
                loadEntities()
            } else {
                toast.error(t.toast.error, { description: response.error })
            }
        } catch (error) {
            console.error('Toggle entity error:', error)
            toast.error(t.toast.connectionError)
        }
    }

    // Handle delete entity
    const handleDelete = async (id: string, entityName: string) => {
        if (!confirm(language === 'tr'
            ? `"${entityName}" cari hesabını silmek istediğinize emin misiniz?`
            : `Are you sure you want to delete "${entityName}"?`)) {
            return
        }

        try {
            const response = await deleteEntity(id)
            if (response.success) {
                toast.success(language === 'tr'
                    ? `${entityName} silindi`
                    : `${entityName} deleted`)
                loadEntities()
            } else {
                toast.error(t.toast.error, { description: response.error })
            }
        } catch (error) {
            console.error('Delete entity error:', error)
            toast.error(t.toast.connectionError)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">{t.entities.title}</h2>
                    <p className="text-muted-foreground">{t.entities.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {t.common.refresh}
                    </Button>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t.entities.addEntity}
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t.common.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EntityType | 'all')}>
                <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="all" className="gap-2">
                        {t.common.all}
                        <Badge variant="secondary" className="h-5 min-w-5 px-1">{getCountByType('all')}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="customer" className="gap-2">
                        <Users className="h-4 w-4 hidden lg:inline" />
                        <span className="hidden sm:inline">{t.entities.customers}</span>
                        <span className="sm:hidden">Müş.</span>
                        <Badge variant="secondary" className="h-5 min-w-5 px-1">{getCountByType('customer')}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="hotel" className="gap-2">
                        <Building2 className="h-4 w-4 hidden lg:inline" />
                        <span className="hidden sm:inline">{t.entities.hotels}</span>
                        <span className="sm:hidden">Otel</span>
                        <Badge variant="secondary" className="h-5 min-w-5 px-1">{getCountByType('hotel')}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="vehicle_owner" className="gap-2">
                        <Car className="h-4 w-4 hidden lg:inline" />
                        <span className="hidden sm:inline">{t.entities.vehicleOwners}</span>
                        <span className="sm:hidden">Araç</span>
                        <Badge variant="secondary" className="h-5 min-w-5 px-1">{getCountByType('vehicle_owner')}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="sub_agency" className="gap-2">
                        <Building className="h-4 w-4 hidden lg:inline" />
                        <span className="hidden sm:inline">{t.entities.subAgencies}</span>
                        <span className="sm:hidden">Acent.</span>
                        <Badge variant="secondary" className="h-5 min-w-5 px-1">{getCountByType('sub_agency')}</Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    {isLoading ? (
                        <Card>
                            <CardContent className="pt-6">
                                <SkeletonTable rows={5} columns={6} />
                            </CardContent>
                        </Card>
                    ) : filteredEntities.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <EmptyState
                                    icon={Users}
                                    title={t.entities.noEntities.split('.')[0]}
                                    description={t.entities.noEntities}
                                    action={{
                                        label: t.entities.addEntity,
                                        onClick: () => setIsCreateOpen(true),
                                    }}
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <Card className="hidden md:block">
                                <CardContent className="pt-6">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t.entities.entityCode}</TableHead>
                                                <TableHead>{t.entities.entityName}</TableHead>
                                                <TableHead>{t.common.type}</TableHead>
                                                <TableHead>{t.entities.contactName}</TableHead>
                                                <TableHead>{t.users.status}</TableHead>
                                                <TableHead className="text-right">{t.users.actions}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredEntities.map((entity) => {
                                                const Icon = getEntityIcon(entity.type)
                                                return (
                                                    <TableRow
                                                        key={entity.id}
                                                        className="cursor-pointer hover:bg-muted/50"
                                                        onClick={() => router.push(`/admin/modules/accounting/entities/${entity.id}`)}
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <code className="text-sm bg-muted px-2 py-0.5 rounded">{entity.code}</code>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        copyCode(entity.code)
                                                                    }}
                                                                >
                                                                    <Copy className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium">{entity.name}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                                                {ENTITY_TYPE_LABELS[entity.type][language]}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                {entity.contactName && (
                                                                    <div className="text-sm">{entity.contactName}</div>
                                                                )}
                                                                {entity.phone && (
                                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                        <Phone className="h-3 w-3" />
                                                                        {entity.phone}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={entity.isActive ? 'success' : 'secondary'}>
                                                                {entity.isActive ? t.users.active : t.users.inactive}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                                    <DropdownMenuItem onSelect={(e) => {
                                                                        e.preventDefault()
                                                                        router.push(`/admin/modules/accounting/entities/${entity.id}`)
                                                                    }}>
                                                                        {language === 'tr' ? 'Görüntüle / Düzenle' : 'View / Edit'}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onSelect={(e) => {
                                                                        e.preventDefault()
                                                                        handleToggle(entity.id, entity.name)
                                                                    }}>
                                                                        {entity.isActive
                                                                            ? (language === 'tr' ? 'Pasife Al' : 'Deactivate')
                                                                            : (language === 'tr' ? 'Aktif Et' : 'Activate')
                                                                        }
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onSelect={(e) => {
                                                                            e.preventDefault()
                                                                            handleDelete(entity.id, entity.name)
                                                                        }}
                                                                        className="text-destructive"
                                                                    >
                                                                        {language === 'tr' ? 'Sil' : 'Delete'}
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Mobile Cards */}
                            <div className="grid gap-4 md:hidden">
                                {filteredEntities.map((entity) => {
                                    const Icon = getEntityIcon(entity.type)
                                    return (
                                        <Card
                                            key={entity.id}
                                            className="cursor-pointer hover:border-primary/50 transition-colors"
                                            onClick={() => router.push(`/admin/modules/accounting/entities/${entity.id}`)}
                                        >
                                            <CardContent className="pt-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            <Icon className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium">{entity.name}</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{entity.code}</code>
                                                                <Badge variant={entity.isActive ? 'success' : 'secondary'} className="text-xs">
                                                                    {entity.isActive ? t.users.active : t.users.inactive}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {(entity.phone || entity.email) && (
                                                    <div className="mt-3 pt-3 border-t space-y-1">
                                                        {entity.phone && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Phone className="h-3 w-3" />
                                                                {entity.phone}
                                                            </div>
                                                        )}
                                                        {entity.email && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Mail className="h-3 w-3" />
                                                                {entity.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </TabsContent>
            </Tabs>

            {/* Create Entity Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {language === 'tr' ? 'Yeni Cari Hesap' : 'New Entity'}
                        </DialogTitle>
                        <DialogDescription>
                            {language === 'tr'
                                ? 'Yeni müşteri, otel, araç sahibi veya alt acenta ekleyin.'
                                : 'Add a new customer, hotel, vehicle owner, or sub agency.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Entity Type */}
                        <div className="space-y-2">
                            <Label>{language === 'tr' ? 'Cari Tipi' : 'Entity Type'}</Label>
                            <Select
                                value={newEntity.type}
                                onValueChange={(value: EntityType) => setNewEntity({ ...newEntity, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="customer">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            {ENTITY_TYPE_LABELS.customer[language]}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="hotel">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            {ENTITY_TYPE_LABELS.hotel[language]}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="vehicle_owner">
                                        <div className="flex items-center gap-2">
                                            <Car className="h-4 w-4" />
                                            {ENTITY_TYPE_LABELS.vehicle_owner[language]}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="sub_agency">
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            {ENTITY_TYPE_LABELS.sub_agency[language]}
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Entity Name */}
                        <div className="space-y-2">
                            <Label>{language === 'tr' ? 'Cari Adı' : 'Entity Name'} *</Label>
                            <Input
                                placeholder={language === 'tr' ? 'Örn: Ahmet Yılmaz, Grand Hotel' : 'e.g. John Doe, Grand Hotel'}
                                value={newEntity.name}
                                onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
                            />
                        </div>

                        {/* Contact Name */}
                        <div className="space-y-2">
                            <Label>{language === 'tr' ? 'Yetkili Kişi' : 'Contact Name'}</Label>
                            <Input
                                placeholder={language === 'tr' ? 'Örn: Muhasebe Birimi' : 'e.g. Accounting Dept'}
                                value={newEntity.contactName || ''}
                                onChange={(e) => setNewEntity({ ...newEntity, contactName: e.target.value })}
                            />
                        </div>

                        {/* Phone & Email */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{language === 'tr' ? 'Telefon' : 'Phone'}</Label>
                                <Input
                                    placeholder="+90 5XX XXX XX XX"
                                    value={newEntity.phone || ''}
                                    onChange={(e) => setNewEntity({ ...newEntity, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>E-posta</Label>
                                <Input
                                    type="email"
                                    placeholder="ornek@email.com"
                                    value={newEntity.email || ''}
                                    onChange={(e) => setNewEntity({ ...newEntity, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label>{language === 'tr' ? 'Notlar' : 'Notes'}</Label>
                            <Textarea
                                placeholder={language === 'tr' ? 'Ek bilgiler...' : 'Additional notes...'}
                                value={newEntity.notes || ''}
                                onChange={(e) => setNewEntity({ ...newEntity, notes: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleDialogClose(false)}>
                            {t.common.cancel}
                        </Button>
                        <Button onClick={handleCreate} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Plus className="h-4 w-4 mr-2" />
                            )}
                            {language === 'tr' ? 'Oluştur' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
