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

    // Use getLedgerEntries to fetch all data and filter for due items
    // This ensures consistency with the main ledger
    const { getLedgerEntries } = await import('./ledger')
    const response = await getLedgerEntries(params?.entityId)

    if (!response.success || !response.data) {
        return { success: false, error: response.error }
    }

    const { entries } = response.data
    const today = new Date()

    // Map to DueItem and filter
    const allDueItems: DueItem[] = entries
        .filter(entry => entry.dueDate && entry.status !== 'paid') // Only items with due dates and not paid
        .map(entry => {
            const due = new Date(entry.dueDate!)
            // Calculate days diff: (Due - Today) / DayMs
            const diffTime = due.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            return {
                ...entry,
                entityName: entry.entityName || 'Unknown Entity',
                entityType: 'customer', // Default/Unknown if not provided
                entityCode: '---', // Default/Unknown
                daysUntilDue: diffDays
            }
        })

    // Separate into upcoming and overdue
    let upcoming = allDueItems.filter(i => i.daysUntilDue >= 0)
    let overdue = allDueItems.filter(i => i.daysUntilDue < 0)

    // Apply Client-side filters
    if (params?.days) {
        upcoming = upcoming.filter(i => i.daysUntilDue <= params.days!)
    }

    // Server-side status simulation (already split into lists)
    if (params?.status === 'pending') {
        overdue = []
    } else if (params?.status === 'overdue') {
        upcoming = []
    }

    return { success: true, data: { upcoming, overdue } }
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
