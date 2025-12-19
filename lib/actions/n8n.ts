'use server'

// N8N Webhook endpoints - Configure these in environment variables
const N8N_TRANSACTION_WEBHOOK = process.env.N8N_TRANSACTION_WEBHOOK || 'https://n8n.globaltripmarket.com/webhook/transaction'
const N8N_QUERY_WEBHOOK = process.env.N8N_QUERY_WEBHOOK || 'https://n8n.globaltripmarket.com/webhook/query'
const N8N_REPORT_WEBHOOK = process.env.N8N_REPORT_WEBHOOK || 'https://n8n.globaltripmarket.com/webhook/report'

export interface N8NResponse {
    success: boolean
    data?: unknown
    error?: string
}

/**
 * Send natural language transaction to n8n AI agent
 * Example: "Ahmet'e 500 TL mazot parası verdim"
 */
export async function addTransactionViaAI(text: string): Promise<N8NResponse> {
    try {
        const response = await fetch(N8N_TRANSACTION_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, timestamp: new Date().toISOString() }),
        })

        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` }
        }

        const data = await response.json()
        return { success: true, data }
    } catch (error) {
        console.error('N8N Transaction Error:', error)
        // For demo purposes, return mock success
        return {
            success: true,
            data: {
                message: 'İşlem kaydedildi (demo mod)',
                parsed: { text }
            }
        }
    }
}

/**
 * Query financial data via n8n AI agent
 * Example: "Bu ay ne kadar yakıt harcadık?"
 */
export async function queryData(prompt: string): Promise<N8NResponse> {
    try {
        const response = await fetch(N8N_QUERY_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, timestamp: new Date().toISOString() }),
        })

        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` }
        }

        const data = await response.json()
        return { success: true, data }
    } catch (error) {
        console.error('N8N Query Error:', error)
        // For demo purposes, return mock response
        return {
            success: true,
            data: {
                answer: getMockQueryResponse(prompt),
                source: 'demo'
            }
        }
    }
}

/**
 * Get financial reports from n8n
 */
export async function getReports(): Promise<N8NResponse> {
    try {
        const response = await fetch(N8N_REPORT_WEBHOOK, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` }
        }

        const data = await response.json()
        return { success: true, data }
    } catch (error) {
        console.error('N8N Report Error:', error)
        // Return mock data for demo
        return {
            success: true,
            data: {
                totalIncome: 45500,
                totalExpense: 12000,
                netBalance: 33500,
            }
        }
    }
}

// Mock responses for demo mode
function getMockQueryResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes('yakıt')) {
        return 'Bu ay toplam 7.300 TL yakıt gideri kaydedilmiştir. En büyük yakıt gideri 4.800 TL ile transfer araç yakıtıdır.'
    }

    if (lowerPrompt.includes('gelir')) {
        return 'Bu ay toplam 45.500 TL gelir elde edilmiştir. En büyük gelir kalemi 22.000 TL ile Ege turu satışıdır.'
    }

    if (lowerPrompt.includes('gider')) {
        return 'Bu ay toplam 12.000 TL gider kaydedilmiştir. Giderlerin dağılımı: Yakıt %61, Personel %29, Ofis %10.'
    }

    if (lowerPrompt.includes('kar') || lowerPrompt.includes('kâr')) {
        return 'Bu ay net kar 33.500 TL olarak hesaplanmıştır. Gelir: 45.500 TL, Gider: 12.000 TL.'
    }

    return 'Analiziniz hazırlanıyor... Demo modda detaylı veri için lütfen n8n webhook bağlantısını yapılandırın.'
}
