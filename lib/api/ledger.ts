// Ledger API Client
// Handles all ledger/account movement API calls

import { apiFetch, type ApiResponse } from './config'
import type {
    LedgerEntry,
    CreateLedgerEntryRequest,
    UpdateLedgerEntryRequest,
    MarkPaidRequest,
    LedgerListResponse,
} from './types'

// Demo data for development mode
const DEMO_LEDGER_ENTRIES: LedgerEntry[] = [
    {
        id: 'led_001',
        entityId: 'ent_001',
        movementType: 'receivable',
        amount: 15000,
        currency: 'TRY',
        status: 'pending',
        date: '2024-12-20',
        dueDate: '2024-12-27',
        reference: 'REZ-2024-001',
        operationId: 'REZ-2024-001',
        description: 'Kapadokya turu ön ödeme - 3 kişi',
        createdBy: { id: 'u1', name: 'Admin', role: 'admin' },
        createdAt: '2024-12-20T10:00:00Z',
    },
    {
        id: 'led_002',
        entityId: 'ent_003',
        movementType: 'payable',
        amount: 8500,
        currency: 'TRY',
        status: 'pending',
        date: '2024-12-20',
        dueDate: '2024-12-25',
        reference: 'REZ-2024-001',
        operationId: 'REZ-2024-001',
        description: 'Grand Cappadocia Hotel - 2 gece konaklama',
        createdBy: { id: 'u1', name: 'Admin', role: 'admin' },
        createdAt: '2024-12-20T10:05:00Z',
    },
    {
        id: 'led_003',
        entityId: 'ent_001',
        movementType: 'income',
        amount: 5000,
        currency: 'TRY',
        status: 'paid',
        date: '2024-12-18',
        reference: 'TAH-2024-045',
        description: 'Nakit tahsilat',
        createdBy: { id: 'u2', name: 'Finans Personeli', role: 'finance_user' },
        createdAt: '2024-12-18T14:30:00Z',
    },
    {
        id: 'led_004',
        entityId: 'ent_005',
        movementType: 'expense',
        amount: 3000,
        currency: 'TRY',
        status: 'paid',
        date: '2024-12-15',
        reference: 'OPS-2024-089',
        operationId: 'OPS-2024-089',
        description: 'Transfer ücreti - Havalimanı',
        createdBy: { id: 'u1', name: 'Admin', role: 'admin' },
        createdAt: '2024-12-15T08:00:00Z',
    },
    {
        id: 'led_005',
        entityId: 'ent_002',
        movementType: 'receivable',
        amount: 22000,
        currency: 'TRY',
        status: 'overdue',
        date: '2024-12-01',
        dueDate: '2024-12-15',
        reference: 'REZ-2024-088',
        operationId: 'REZ-2024-088',
        description: 'Ege turu - 5 kişi (GECİKMİŞ)',
        createdBy: { id: 'u1', name: 'Admin', role: 'admin' },
        createdAt: '2024-12-01T10:00:00Z',
    },
    {
        id: 'led_006',
        entityId: 'ent_004',
        movementType: 'payable',
        amount: 1200,
        currency: 'USD',
        status: 'pending',
        date: '2024-12-22',
        dueDate: '2024-12-30',
        reference: 'REZ-2024-095',
        description: 'Antalya Beach Resort - 4 gece',
        createdBy: { id: 'u1', name: 'Admin', role: 'admin' },
        createdAt: '2024-12-22T11:00:00Z',
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
 * Get ledger entries, optionally filtered by entity
 * GET /ledger?entityId=xxx
 */
export async function getLedgerEntries(entityId?: string): Promise<ApiResponse<LedgerListResponse>> {
    // Demo mode fallback
    if (isDemoMode()) {
        const filtered = entityId
            ? DEMO_LEDGER_ENTRIES.filter(e => e.entityId === entityId)
            : DEMO_LEDGER_ENTRIES

        // Calculate summary
        const byCurrency: Record<string, { receivable: number; payable: number }> = {}
        let overdueCount = 0
        let upcomingDueCount = 0
        const today = new Date()
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

        filtered.forEach(entry => {
            if (!byCurrency[entry.currency]) {
                byCurrency[entry.currency] = { receivable: 0, payable: 0 }
            }
            if (entry.movementType === 'receivable' || entry.movementType === 'income') {
                byCurrency[entry.currency].receivable += entry.amount
            } else {
                byCurrency[entry.currency].payable += entry.amount
            }
            if (entry.status === 'overdue') overdueCount++
            if (entry.dueDate && entry.status === 'pending') {
                const due = new Date(entry.dueDate)
                if (due <= nextWeek && due >= today) upcomingDueCount++
            }
        })

        return {
            success: true,
            data: {
                entries: filtered,
                summary: entityId ? {
                    entityId,
                    byCurrency: Object.entries(byCurrency).map(([currency, vals]) => ({
                        currency: currency as 'TRY' | 'USD' | 'EUR',
                        receivable: vals.receivable,
                        payable: vals.payable,
                        net: vals.receivable - vals.payable,
                    })),
                    overdueCount,
                    upcomingDueCount,
                } : undefined,
            },
        }
    }

    const queryParams = entityId ? `?entityId=${entityId}` : ''
    const response = await apiFetch<LedgerListResponse>(`/ledger${queryParams}`, {
        method: 'GET',
    })

    // Handle various response formats
    if (response.success && response.data) {
        if (Array.isArray(response.data)) {
            return { success: true, data: { entries: response.data as unknown as LedgerEntry[] } }
        }
        if ((response.data as LedgerListResponse).entries) {
            return response
        }
    }

    return response
}

/**
 * Create a new ledger entry
 * POST /ledger
 */
export async function createLedgerEntry(data: CreateLedgerEntryRequest): Promise<ApiResponse<LedgerEntry>> {
    const response = await apiFetch<LedgerEntry>('/ledger', {
        method: 'POST',
        body: JSON.stringify(data),
    })

    return response
}

/**
 * Update an existing ledger entry
 * POST /ledger/update
 */
export async function updateLedgerEntry(data: UpdateLedgerEntryRequest): Promise<ApiResponse<LedgerEntry>> {
    const response = await apiFetch<LedgerEntry>('/ledger/update', {
        method: 'POST',
        body: JSON.stringify(data),
    })

    return response
}

/**
 * Mark a ledger entry as paid (ADMIN ONLY)
 * POST /ledger/mark-paid
 */
export async function markAsPaid(data: MarkPaidRequest): Promise<ApiResponse<LedgerEntry>> {
    const response = await apiFetch<LedgerEntry>('/ledger/mark-paid', {
        method: 'POST',
        body: JSON.stringify(data),
    })

    return response
}
