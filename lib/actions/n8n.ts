'use server'

import { revalidatePath } from 'next/cache'

// HARDCODED Webhook URLs
const N8N_TRANSACTION_WEBHOOK = 'https://n8n.globaltripmarket.com/webhook/islem-ekle'
const N8N_CHATBOT_WEBHOOK = 'https://n8n.globaltripmarket.com/webhook/chatbot'
const N8N_DASHBOARD_DATA_WEBHOOK = 'https://n8n.globaltripmarket.com/webhook/dashboard-data'

export interface N8NResponse {
    success: boolean
    data?: unknown
    error?: string
}

export interface Transaction {
    id: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    category: string
    description: string
    date: string
    created_at: string
}

export interface DashboardStats {
    income: number
    expense: number
    balance: number
}

export interface DashboardData {
    transactions: Transaction[]
    stats: DashboardStats
}

/**
 * Fetch all dashboard data from n8n webhook
 * This replaces direct PostgreSQL access with webhook-based data fetching
 */
export async function fetchDashboardData(): Promise<DashboardData> {
    try {
        // Use POST method as n8n webhooks typically require POST
        const response = await fetch(N8N_DASHBOARD_DATA_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'fetch' }),
            cache: 'no-store', // Always fetch fresh data
        })

        if (!response.ok) {
            console.error('Dashboard data fetch failed:', response.status)
            return { transactions: [], stats: { income: 0, expense: 0, balance: 0 } }
        }

        const rawData = await response.json()
        console.log('Webhook raw response:', JSON.stringify(rawData).slice(0, 500))

        // Parse the n8n response format - handle multiple possible structures
        let rawTransactions: Array<{
            id: number
            amount: string
            type: string
            category: string
            description: string
            created_at: string
        }> = []

        // Format 1: [{ data: [{ transactions: [...] }] }]
        if (Array.isArray(rawData) && rawData[0]?.data?.[0]?.transactions) {
            rawTransactions = rawData[0].data[0].transactions
        }
        // Format 2: { data: [{ transactions: [...] }] }
        else if (rawData?.data?.[0]?.transactions) {
            rawTransactions = rawData.data[0].transactions
        }
        // Format 3: { transactions: [...] }
        else if (rawData?.transactions) {
            rawTransactions = rawData.transactions
        }
        // Format 4: Direct array of transactions
        else if (Array.isArray(rawData) && rawData[0]?.id !== undefined) {
            rawTransactions = rawData
        }
        // Format 5: [{ transactions: [...] }]
        else if (Array.isArray(rawData) && rawData[0]?.transactions) {
            rawTransactions = rawData[0].transactions
        }

        // Transform and filter transactions
        const transactions: Transaction[] = rawTransactions
            .filter((t) =>
                t.description &&
                !t.description.includes('[object Object]') &&
                parseFloat(t.amount || '0') > 0
            )
            .map((t) => ({
                id: String(t.id),
                amount: parseFloat(t.amount) || 0,
                type: t.type as 'INCOME' | 'EXPENSE',
                category: t.category || 'Diğer',
                description: t.description || '',
                date: t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : '',
                created_at: t.created_at || '',
            }))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        // Calculate stats from transactions
        let income = 0
        let expense = 0

        for (const t of transactions) {
            if (t.type === 'INCOME') {
                income += t.amount
            } else {
                expense += t.amount
            }
        }

        console.log(`Processed ${transactions.length} transactions, income: ${income}, expense: ${expense}`)

        return {
            transactions,
            stats: {
                income,
                expense,
                balance: income - expense,
            }
        }
    } catch (error) {
        console.error('Dashboard data fetch error:', error)
        return { transactions: [], stats: { income: 0, expense: 0, balance: 0 } }
    }
}

/**
 * Send natural language transaction to n8n AI agent for parsing and saving
 * Example: "Ahmet'e 500 TL mazot parası verdim"
 */
export async function addTransaction(text: string): Promise<N8NResponse> {
    try {
        const response = await fetch(N8N_TRANSACTION_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                timestamp: new Date().toISOString()
            }),
        })

        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` }
        }

        // Try to parse response, but treat any 200 OK as success
        try {
            const data = await response.json()
            // Check if response explicitly indicates failure
            if (data.success === false || data.error) {
                return { success: false, error: data.error || 'İşlem başarısız' }
            }
        } catch {
            // If JSON parsing fails but we got 200 OK, still consider it successful
        }

        // Revalidate all pages to refresh data
        revalidatePath('/')
        revalidatePath('/admin/dashboard')
        revalidatePath('/worker/dashboard')
        revalidatePath('/transactions')

        return { success: true }
    } catch (error) {
        console.error('N8N Transaction Error:', error)
        return {
            success: false,
            error: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.'
        }
    }
}

/**
 * AI Query for the Analyst Chat interface (General Assistant)
 * Sends user message to n8n chatbot for AI-powered analysis
 */
export async function aiQuery(userMessage: string): Promise<N8NResponse> {
    try {
        const response = await fetch(N8N_CHATBOT_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chatInput: userMessage
            }),
        })

        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` }
        }

        const data = await response.json()

        // Handle response format: { text: "...", success: true } or { output: "..." }
        if (data.text !== undefined) {
            return {
                success: data.success ?? true,
                data: { output: data.text }
            }
        }

        if (data.output !== undefined) {
            return { success: true, data: { output: data.output } }
        }

        // Fallback for legacy format
        return { success: true, data }
    } catch (error) {
        console.error('N8N Query Error:', error)
        return {
            success: false,
            error: 'AI bağlantısı kurulamadı. Lütfen tekrar deneyin.'
        }
    }
}
