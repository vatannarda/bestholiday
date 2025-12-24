// API Configuration
// Falls back to hardcoded URL if environment variable is not set

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://n8n.globaltripmarket.com/webhook'

export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

/**
 * Generic API fetch wrapper with error handling
 */
export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const url = `${API_BASE_URL}${endpoint}`

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        })

        if (!response.ok) {
            return {
                success: false,
                error: `HTTP ${response.status}: ${response.statusText}`,
            }
        }

        // Helper to check for JSON content type
        const contentType = response.headers.get('content-type')
        const isJson = contentType && contentType.includes('application/json')

        // Get text first to safely debug and handle empty responses
        const text = await response.text()

        // Debug: Log raw response
        if (text.length < 1000) {
            console.log(`apiFetch ${url} raw response:`, text)
        } else {
            console.log(`apiFetch ${url} raw response length:`, text.length)
        }

        if (!text || text.trim() === '') {
            // Empty response is valid for some endpoints like void returns
            // But if we expected data, it will be handled by the caller checking success/data
            return { success: true, data: {} as T }
        }

        let data
        try {
            data = JSON.parse(text)
        } catch (e) {
            console.error(`apiFetch JSON parse error for ${url}:`, e)
            return {
                success: false,
                error: 'Sunucudan geçersiz yanıt alındı (JSON hatası)',
            }
        }

        // Debug: Log parsed data type
        console.log(`apiFetch ${url} parsed data type:`, Array.isArray(data) ? `Array[${data.length}]` : typeof data)

        // Handle n8n response formats
        if (data.error) {
            return { success: false, error: data.error }
        }

        if (data.success === false) {
            return { success: false, error: data.message || 'İşlem başarısız' }
        }

        return { success: true, data }
    } catch (error) {
        console.error('API Error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Bağlantı hatası',
        }
    }
}
