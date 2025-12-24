// Entities API Client
// Handles all entity-related API calls (Customers, Hotels, Vehicle Owners, Sub Agencies)

import { apiFetch, type ApiResponse } from './config'
import type {
    Entity,
    EntityType,
    CreateEntityRequest,
    UpdateEntityRequest,
    EntitiesListResponse,
    EntityResponse,
} from './types'

// Demo data for development mode
const DEMO_ENTITIES: Entity[] = [
    {
        id: 'ent_001',
        type: 'customer',
        code: 'MUS-001',
        name: 'Ahmet Yılmaz',
        contactName: 'Ahmet',
        phone: '+90 532 111 22 33',
        email: 'ahmet@example.com',
        tags: ['vip', 'ankara'],
        isActive: true,
        notes: 'Düzenli müşteri, yıllık 10+ tur',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-12-20T15:30:00Z',
    },
    {
        id: 'ent_002',
        type: 'customer',
        code: 'MUS-002',
        name: 'Mehmet Demir',
        contactName: 'Mehmet',
        phone: '+90 533 444 55 66',
        email: 'mehmet@example.com',
        tags: ['istanbul'],
        isActive: true,
        createdAt: '2024-03-20T14:00:00Z',
        updatedAt: '2024-12-18T09:00:00Z',
    },
    {
        id: 'ent_003',
        type: 'hotel',
        code: 'OTL-001',
        name: 'Grand Cappadocia Hotel',
        contactName: 'Reservation Dept',
        phone: '+90 384 111 22 33',
        email: 'reservation@grandcappadocia.com',
        tags: ['kapadokya', 'premium'],
        isActive: true,
        notes: 'Komisyon oranı %15',
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-12-15T11:00:00Z',
    },
    {
        id: 'ent_004',
        type: 'hotel',
        code: 'OTL-002',
        name: 'Antalya Beach Resort',
        contactName: 'Ali Bey',
        phone: '+90 242 333 44 55',
        email: 'info@antalyabeach.com',
        tags: ['antalya', 'beach'],
        isActive: true,
        createdAt: '2024-04-10T12:00:00Z',
        updatedAt: '2024-12-10T16:00:00Z',
    },
    {
        id: 'ent_005',
        type: 'vehicle_owner',
        code: 'ARC-001',
        name: 'Hasan Kaya - Mercedes Vito',
        contactName: 'Hasan',
        phone: '+90 555 666 77 88',
        isActive: true,
        notes: '16 kişilik Vito, günlük 3000 TL',
        createdAt: '2024-05-15T08:00:00Z',
        updatedAt: '2024-12-01T10:00:00Z',
    },
]

/**
 * Check if demo mode is enabled
 */
function isDemoMode(): boolean {
    if (typeof window === 'undefined') return false
    return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && process.env.NODE_ENV === 'development'
}

/**
 * Get all entities, optionally filtered by type
 * GET /entities?type=customer
 */
export async function getEntities(type?: EntityType): Promise<ApiResponse<EntitiesListResponse>> {
    // Demo mode fallback
    if (isDemoMode()) {
        const filtered = type ? DEMO_ENTITIES.filter(e => e.type === type) : DEMO_ENTITIES
        return { success: true, data: { entities: filtered } }
    }

    const queryParams = type ? `?type=${type}` : ''
    const response = await apiFetch<EntitiesListResponse>(`/entities${queryParams}`, {
        method: 'GET',
    })

    // Handle various response formats
    if (response.success && response.data) {
        if (Array.isArray(response.data)) {
            return { success: true, data: { entities: response.data as unknown as Entity[] } }
        }
        if ((response.data as EntitiesListResponse).entities) {
            return response
        }
    }

    return response
}

/**
 * Get a single entity by ID
 * GET /entities?id=xxx
 */
export async function getEntity(id: string): Promise<ApiResponse<EntityResponse>> {
    // Demo mode fallback
    if (isDemoMode()) {
        const entity = DEMO_ENTITIES.find(e => e.id === id)
        if (entity) {
            return {
                success: true,
                data: {
                    entity,
                    summary: {
                        entityId: id,
                        byCurrency: [
                            { currency: 'TRY', receivable: 15000, payable: 5000, net: 10000 },
                            { currency: 'USD', receivable: 500, payable: 0, net: 500 },
                        ],
                        overdueCount: 1,
                        upcomingDueCount: 3,
                    },
                },
            }
        }
        return { success: false, error: 'Entity bulunamadı' }
    }

    const response = await apiFetch<EntityResponse>(`/entities?id=${id}`, {
        method: 'GET',
    })

    return response
}

/**
 * Create a new entity
 * POST /entities
 */
export async function createEntity(data: CreateEntityRequest): Promise<ApiResponse<Entity>> {
    const response = await apiFetch<Entity>('/entities', {
        method: 'POST',
        body: JSON.stringify(data),
    })

    return response
}

/**
 * Update an existing entity
 * POST /entities/update
 */
export async function updateEntity(data: UpdateEntityRequest): Promise<ApiResponse<Entity>> {
    const response = await apiFetch<Entity>('/entities/update', {
        method: 'POST',
        body: JSON.stringify(data),
    })

    return response
}

/**
 * Toggle entity active status
 * POST /entities/toggle
 */
export async function toggleEntityStatus(id: string): Promise<ApiResponse<Entity>> {
    const response = await apiFetch<Entity>('/entities/toggle', {
        method: 'POST',
        body: JSON.stringify({ id }),
    })

    return response
}
