"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Copy, Phone, Mail, MoreHorizontal, Loader2, Building2, Users, Car, Building } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { getEntities } from "@/lib/api/entities"
import type { Entity, EntityType } from "@/lib/api/types"
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

    const loadEntities = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await getEntities()
            if (response.success && response.data) {
                setEntities(response.data.entities)
            }
        } catch (error) {
            console.error('Load entities error:', error)
            toast.error(t.toast.connectionError)
        } finally {
            setIsLoading(false)
        }
    }, [t])

    useEffect(() => {
        loadEntities()
    }, [loadEntities])

    // Filter entities by tab and search
    const filteredEntities = entities.filter(entity => {
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

    // Get entity count by type
    const getCountByType = (type: EntityType | 'all') => {
        if (type === 'all') return entities.length
        return entities.filter(e => e.type === type).length
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">{t.entities.title}</h2>
                    <p className="text-muted-foreground">{t.entities.subtitle}</p>
                </div>
                <Button onClick={() => toast.info('Yeni cari ekleme yakında')}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t.entities.addEntity}
                </Button>
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
                                        onClick: () => toast.info('Yeni cari ekleme yakında'),
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
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => router.push(`/admin/modules/accounting/entities/${entity.id}`)}>
                                                                        Detay Görüntüle
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => copyCode(entity.code)}>
                                                                        Kodu Kopyala
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
        </div>
    )
}
