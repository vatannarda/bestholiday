// Due (Vade Takibi) API Client
// Handles due date tracking API calls

import { apiFetch, type ApiResponse } from './config'
import type { DueListResponse, DueItem, AddDueNoteRequest } from './types'

// Demo data for development mode
const DEMO_DUE_ITEMS: DueItem[] = [
    {
        id: 'led_001',
        entityId: 'ent_001',
        entityName: 'Ahmet Yılmaz',
        entityType: 'customer',
        entityCode: 'MUS-001',
        movementType: 'receivable',
        amount: 15000,
        currency: 'TRY',
        status: 'pending',
        date: '2024-12-20',
        dueDate: '2024-12-27',
        daysUntilDue: 3,
        reference: 'REZ-2024-001',
        operationId: 'REZ-2024-001',
        description: 'Kapadokya turu ön ödeme - 3 kişi',
    },
    {
        id: 'led_002',
        entityId: 'ent_003',
        entityName: 'Grand Cappadocia Hotel',
        entityType: 'hotel',
        entityCode: 'OTL-001',
        movementType: 'payable',
        amount: 8500,
        currency: 'TRY',
        status: 'pending',
        date: '2024-12-20',
        dueDate: '2024-12-25',
        daysUntilDue: 1,
        reference: 'REZ-2024-001',
        operationId: 'REZ-2024-001',
        description: 'Grand Cappadocia Hotel - 2 gece konaklama',
    },
    {
        id: 'led_006',
        entityId: 'ent_004',
        entityName: 'Antalya Beach Resort',
        entityType: 'hotel',
        entityCode: 'OTL-002',
        movementType: 'payable',
        amount: 1200,
        currency: 'USD',
        status: 'pending',
        date: '2024-12-22',
        dueDate: '2024-12-30',
        daysUntilDue: 6,
        reference: 'REZ-2024-095',
        description: 'Antalya Beach Resort - 4 gece',
    },
]

const DEMO_OVERDUE_ITEMS: DueItem[] = [
    {
        id: 'led_005',
        entityId: 'ent_002',
        entityName: 'Mehmet Demir',
        entityType: 'customer',
        entityCode: 'MUS-002',
        movementType: 'receivable',
        amount: 22000,
        currency: 'TRY',
        status: 'overdue',
        date: '2024-12-01',
        dueDate: '2024-12-15',
        daysUntilDue: -9,
        reference: 'REZ-2024-088',
        operationId: 'REZ-2024-088',
        description: 'Ege turu - 5 kişi (GECİKMİŞ)',
    },
]

/**
 * Check if demo mode is enabled
 */
function isDemoMode(): boolean {
    if (typeof window === 'undefined') return false
    return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && process.env.NODE_ENV === 'development'
}

export interface GetDueItemsParams {
    days?: number           // Filter by days until due (default: 7)
    status?: 'pending' | 'overdue' | 'all'
    entityType?: string
    entityId?: string
    currency?: 'TRY' | 'USD' | 'EUR'
}

/**
 * Get due items (upcoming and overdue)
 * GET /due?days=7&status=pending
 */
export async function getDueItems(params?: GetDueItemsParams): Promise<ApiResponse<DueListResponse>> {
    // Demo mode fallback
    if (isDemoMode()) {
        let upcoming = [...DEMO_DUE_ITEMS]
        let overdue = [...DEMO_OVERDUE_ITEMS]

        // Apply filters
        if (params?.entityType) {
            upcoming = upcoming.filter(i => i.entityType === params.entityType)
            overdue = overdue.filter(i => i.entityType === params.entityType)
        }
        if (params?.entityId) {
            upcoming = upcoming.filter(i => i.entityId === params.entityId)
            overdue = overdue.filter(i => i.entityId === params.entityId)
        }
        if (params?.currency) {
            upcoming = upcoming.filter(i => i.currency === params.currency)
            overdue = overdue.filter(i => i.currency === params.currency)
        }
        if (params?.days) {
            upcoming = upcoming.filter(i => i.daysUntilDue <= params.days!)
        }

        if (params?.status === 'pending') {
            overdue = []
        } else if (params?.status === 'overdue') {
            upcoming = []
        }

        return { success: true, data: { upcoming, overdue } }
    }

    // Build query string
    const queryParts: string[] = []
    if (params?.days) queryParts.push(`days=${params.days}`)
    if (params?.status) queryParts.push(`status=${params.status}`)
    if (params?.entityType) queryParts.push(`entityType=${params.entityType}`)
    if (params?.entityId) queryParts.push(`entityId=${params.entityId}`)
    if (params?.currency) queryParts.push(`currency=${params.currency}`)

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''

    const response = await apiFetch<DueListResponse>(`/due${queryString}`, {
        method: 'GET',
    })

    // Handle various response formats
    if (response.success && response.data) {
        if ((response.data as DueListResponse).upcoming !== undefined) {
            return response
        }
    }

    return response
}

/**
 * Add a reminder note to a due item (ADMIN ONLY)
 * POST /due/note
 */
export async function addDueNote(data: AddDueNoteRequest): Promise<ApiResponse<void>> {
    const response = await apiFetch<void>('/due/note', {
        method: 'POST',
        body: JSON.stringify(data),
    })

    return response
}
