// Ledger Types for BestHoliday Accounting Module
// Used for tracking entity account movements (receivables, payables, income, expense)

import type { Currency } from './entity'

export type LedgerStatus = 'planned' | 'pending' | 'paid' | 'overdue'
export type MovementType = 'receivable' | 'payable' | 'income' | 'expense'

export interface LedgerEntry {
    id: string
    entityId: string
    movementType: MovementType
    amount: number
    currency: Currency
    status: LedgerStatus
    date: string              // İşlem tarihi (YYYY-MM-DD)
    dueDate?: string          // Vade tarihi (YYYY-MM-DD)
    reference?: string        // Referans: REZ-2024-001, FAT-123
    description?: string
    operationId?: string      // Operasyon bağlantısı (ileride Transfer Modülü ile)
    entityName?: string       // API'den gelen entity_name
    createdBy?: {
        id: string
        name: string
        role: 'admin' | 'finance_admin' | 'finance_user'
    }
    createdAt?: string
    updatedAt?: string
}

// Due item for vade takibi screen
export interface DueItem extends LedgerEntry {
    entityName: string
    entityType: string
    entityCode: string
    daysUntilDue: number      // Negatif = gecikmiş
}

// Request types
export interface CreateLedgerEntryRequest {
    entityId: string
    movementType: MovementType
    amount: number
    currency: Currency
    status: LedgerStatus
    date: string
    dueDate?: string
    reference?: string
    description?: string
    operationId?: string
}

export interface UpdateLedgerEntryRequest {
    id: string
    status?: LedgerStatus
    dueDate?: string
    reference?: string
    description?: string
    operationId?: string
}

export interface MarkPaidRequest {
    id: string
}

export interface AddDueNoteRequest {
    id: string
    note: string
}

// Response types
export interface LedgerListResponse {
    entries: LedgerEntry[]
    summary?: {
        entityId: string
        byCurrency: Array<{
            currency: Currency
            receivable: number
            payable: number
            net: number
        }>
        overdueCount: number
        upcomingDueCount: number
    }
}

export interface DueListResponse {
    upcoming: DueItem[]
    overdue: DueItem[]
}

// Status labels for UI
export const LEDGER_STATUS_LABELS = {
    planned: { tr: 'Planlandı', en: 'Planned' },
    pending: { tr: 'Beklemede', en: 'Pending' },
    paid: { tr: 'Ödendi', en: 'Paid' },
    overdue: { tr: 'Gecikmiş', en: 'Overdue' },
} as const

// Movement type labels for UI
export const MOVEMENT_TYPE_LABELS = {
    receivable: { tr: 'Alacak', en: 'Receivable' },
    payable: { tr: 'Borç', en: 'Payable' },
    income: { tr: 'Gelir', en: 'Income' },
    expense: { tr: 'Gider', en: 'Expense' },
} as const

// Badge variants for status
export const LEDGER_STATUS_VARIANTS: Record<LedgerStatus, 'default' | 'secondary' | 'success' | 'destructive' | 'warning'> = {
    planned: 'secondary',
    pending: 'warning',
    paid: 'success',
    overdue: 'destructive',
}
