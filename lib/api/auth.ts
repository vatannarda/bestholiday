import { apiFetch, type ApiResponse } from './config'

export interface LoginRequest {
    username: string
    password: string
}

export interface LoginResponse {
    user: {
        id: string
        username: string
        displayName: string
        role: 'admin' | 'finance_admin' | 'finance_user'
        isActive: boolean
    }
    token?: string
}

/**
 * Authenticate user via n8n webhook
 * POST /auth/login
 */
export async function loginUser(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    })

    return response
}

/**
 * Validate current session (optional - for token-based auth)
 */
export async function validateSession(token: string): Promise<ApiResponse<LoginResponse>> {
    const response = await apiFetch<LoginResponse>('/auth/validate', {
        method: 'POST',
        body: JSON.stringify({ token }),
    })

    return response
}
