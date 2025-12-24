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
 * Convert snake_case backend entity to camelCase frontend entity
 */
function normalizeEntity(raw: Record<string, unknown>): Entity {
    return {
        id: raw.id as string,
        type: raw.type as EntityType,
        code: raw.code as string || `${String(raw.type).toUpperCase().slice(0, 3)}-${String(raw.id).slice(0, 4)}`,
        name: raw.name as string,
        contactName: (raw.contact_name || raw.contactName) as string | undefined,
        phone: raw.phone as string | undefined,
        email: raw.email as string | undefined,
        tags: (raw.tags as string[] | null) || undefined,
        notes: raw.notes as string | undefined,
        isActive: (raw.is_active ?? raw.isActive ?? true) as boolean,
        createdAt: (raw.created_at || raw.createdAt) as string,
        updatedAt: (raw.updated_at || raw.updatedAt) as string,
    }
}

/**
 * Get all entities, optionally filtered by type
 * GET /entities
 */
export async function getEntities(type?: EntityType): Promise<ApiResponse<EntitiesListResponse>> {
    // Demo mode fallback
    if (isDemoMode()) {
        const filtered = type ? DEMO_ENTITIES.filter(e => e.type === type) : DEMO_ENTITIES
        return { success: true, data: { entities: filtered } }
    }

    const queryParams = type ? `?type=${type}` : ''
    // Use direct fetch without Content-Type header (n8n may behave differently)
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://n8n.globaltripmarket.com/webhook'
    const url = `${API_BASE_URL}/entities/${queryParams}`

    let response: ApiResponse<EntitiesListResponse>
    try {
        const fetchResponse = await fetch(url, { method: 'GET' })
        const data = await fetchResponse.json()

        // Debug: Log raw response
        console.log('Entities direct fetch raw data:', Array.isArray(data) ? `Array[${data.length}]` : typeof data, data)

        response = { success: true, data }
    } catch (error) {
        console.error('Entities fetch error:', error)
        response = { success: false, error: 'Bağlantı hatası' }
    }

    // Debug: Log raw response to see what backend returns
    console.log('Entities API raw response:', JSON.stringify(response, null, 2))

    // Handle various response formats from different backends
    if (response.success && response.data) {
        const data = response.data as unknown as Record<string, unknown>

        // If data is an array directly
        if (Array.isArray(response.data)) {
            console.log('Entities: data is array directly')
            const entities = (response.data as Record<string, unknown>[]).map(normalizeEntity)
            return { success: true, data: { entities } }
        }

        // If data has entities property (array)
        if (Array.isArray(data.entities)) {
            console.log('Entities: data has entities array')
            const entities = (data.entities as Record<string, unknown>[]).map(normalizeEntity)
            return { success: true, data: { entities } }
        }

        // If data is a SINGLE entity object (has id property)
        if (data.id && typeof data.id === 'string') {
            console.log('Entities: data is single entity object - wrapping in array')
            const entity = normalizeEntity(data)
            return { success: true, data: { entities: [entity] } }
        }

        // If data has nested data property (n8n webhook format)
        if (data.data) {
            if (Array.isArray(data.data)) {
                console.log('Entities: nested data.data array found')
                const entities = (data.data as Record<string, unknown>[]).map(normalizeEntity)
                return { success: true, data: { entities } }
            }
            // Single entity in nested data
            const nested = data.data as Record<string, unknown>
            if (nested.id) {
                console.log('Entities: nested data.data is single entity')
                const entity = normalizeEntity(nested)
                return { success: true, data: { entities: [entity] } }
            }
        }

        // Look for any array property that might contain entities
        if (typeof data === 'object' && data !== null) {
            for (const key of Object.keys(data)) {
                if (Array.isArray(data[key])) {
                    console.log(`Entities: found array in key "${key}"`)
                    const entities = (data[key] as Record<string, unknown>[]).map(normalizeEntity)
                    return { success: true, data: { entities } }
                }
            }
        }
    }

    // If response itself is an array (some backends return this)
    if (Array.isArray(response)) {
        console.log('Entities: response itself is array')
        const entities = (response as unknown as Record<string, unknown>[]).map(normalizeEntity)
        return { success: true, data: { entities } }
    }

    console.log('Entities: no matching format found, returning empty array')
    return { success: true, data: { entities: [] } }
}
/**
 * Get a single entity by ID
 * Fetches all entities and finds the one with matching id
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

    // Fetch all entities and find the one with matching id
    // This is needed because n8n may not support query params properly
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://n8n.globaltripmarket.com/webhook'
    const url = `${API_BASE_URL}/entities/`

    try {
        const fetchResponse = await fetch(url, { method: 'GET' })
        const data = await fetchResponse.json()

        console.log('Entity detail - fetched all entities, looking for id:', id)

        // Handle nested data.data array format (n8n returns this)
        let entities: Record<string, unknown>[] = []
        if (Array.isArray(data)) {
            entities = data
        } else if (data && data.data && Array.isArray(data.data)) {
            entities = data.data
        }

        if (entities.length > 0) {
            const found = entities.find((e: Record<string, unknown>) => e.id === id)
            if (found) {
                console.log('Entity detail - found entity:', found)
                const entity = normalizeEntity(found as Record<string, unknown>)
                return { success: true, data: { entity } }
            }
        }

        // If data is a single entity matching the id
        if (data && data.id === id) {
            const entity = normalizeEntity(data as Record<string, unknown>)
            return { success: true, data: { entity } }
        }

        console.log('Entity detail - entity not found in response:', data)
        return { success: false, error: 'Entity bulunamadı' }
    } catch (error) {
        console.error('Get entity error:', error)
        return { success: false, error: 'Bağlantı hatası' }
    }
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

/**
 * Delete an entity
 * POST /entities/delete
 */
export async function deleteEntity(id: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiFetch<{ success: boolean }>('/entities/delete', {
        method: 'POST',
        body: JSON.stringify({ id }),
    })

    return response
}
