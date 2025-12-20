'use server'

import { revalidatePath } from 'next/cache'

// HARDCODED Webhook URLs - Do not use environment variables
const N8N_TRANSACTION_WEBHOOK = 'https://n8n.globaltripmarket.com/webhook/islem-ekle'
const N8N_QUERY_WEBHOOK = 'https://n8n.globaltripmarket.com/webhook/sorgu'

export interface N8NResponse {
    success: boolean
    data?: unknown
    error?: string
}

/**
 * Send natural language transaction to n8n AI agent for parsing and saving
 * Example: "Ahmet'e 500 TL mazot parası verdim"
 * After successful processing, n8n will save to PostgreSQL
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

        const data = await response.json()

        // Revalidate all pages to refresh data from database
        revalidatePath('/')
        revalidatePath('/admin/dashboard')
        revalidatePath('/worker/dashboard')
        revalidatePath('/transactions')

        return { success: true, data }
    } catch (error) {
        console.error('N8N Transaction Error:', error)
        return {
            success: false,
            error: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.'
        }
    }
}

/**
 * AI Query for the Analyst Chat interface
 * Sends user message to n8n for AI-powered analysis
 */
export async function aiQuery(userMessage: string): Promise<N8NResponse> {
    try {
        const response = await fetch(N8N_QUERY_WEBHOOK, {
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
        return { success: true, data }
    } catch (error) {
        console.error('N8N Query Error:', error)
        return {
            success: false,
            error: 'AI bağlantısı kurulamadı. Lütfen tekrar deneyin.'
        }
    }
}
