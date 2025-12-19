import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TransactionType = 'gelir' | 'gider'

export interface Transaction {
    id: string
    date: string
    amount: number
    type: TransactionType
    category: string
    description: string
    createdBy: string
    createdAt: string
}

interface TransactionState {
    transactions: Transaction[]
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void
    updateTransaction: (id: string, transaction: Partial<Transaction>) => void
    deleteTransaction: (id: string) => void
}

// Mock initial data
const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: '1',
        date: '2024-12-18',
        amount: 15000,
        type: 'gelir',
        category: 'Tur Satışı',
        description: 'Kapadokya turu - 3 kişi',
        createdBy: 'admin',
        createdAt: '2024-12-18T10:30:00',
    },
    {
        id: '2',
        date: '2024-12-17',
        amount: 2500,
        type: 'gider',
        category: 'Yakıt',
        description: 'Araç yakıt gideri',
        createdBy: 'user',
        createdAt: '2024-12-17T14:20:00',
    },
    {
        id: '3',
        date: '2024-12-16',
        amount: 8500,
        type: 'gelir',
        category: 'Otel Komisyonu',
        description: 'Antalya otel rezervasyonu komisyonu',
        createdBy: 'admin',
        createdAt: '2024-12-16T09:15:00',
    },
    {
        id: '4',
        date: '2024-12-15',
        amount: 1200,
        type: 'gider',
        category: 'Ofis Gideri',
        description: 'Kırtasiye malzemeleri',
        createdBy: 'user',
        createdAt: '2024-12-15T11:45:00',
    },
    {
        id: '5',
        date: '2024-12-14',
        amount: 22000,
        type: 'gelir',
        category: 'Tur Satışı',
        description: 'Ege turu - 5 kişi',
        createdBy: 'admin',
        createdAt: '2024-12-14T16:00:00',
    },
    {
        id: '6',
        date: '2024-12-13',
        amount: 3500,
        type: 'gider',
        category: 'Personel',
        description: 'Rehber ücreti',
        createdBy: 'admin',
        createdAt: '2024-12-13T10:00:00',
    },
    {
        id: '7',
        date: '2024-12-12',
        amount: 4800,
        type: 'gider',
        category: 'Yakıt',
        description: 'Transfer araç yakıtı',
        createdBy: 'user',
        createdAt: '2024-12-12T08:30:00',
    },
]

export const useTransactionStore = create<TransactionState>()(
    persist(
        (set) => ({
            transactions: MOCK_TRANSACTIONS,
            addTransaction: (transaction) => {
                const newTransaction: Transaction = {
                    ...transaction,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                }
                set((state) => ({
                    transactions: [newTransaction, ...state.transactions],
                }))
            },
            updateTransaction: (id, updates) => {
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    ),
                }))
            },
            deleteTransaction: (id) => {
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.id !== id),
                }))
            },
        }),
        {
            name: 'bestholiday-transactions',
        }
    )
)
