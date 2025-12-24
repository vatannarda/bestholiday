import { apiFetch, type ApiResponse } from './config'

export interface User {
    id: string
    username: string
    displayName: string
    role: 'admin' | 'finance_admin' | 'finance_user'
    isActive: boolean
    createdAt?: string
    lastLogin?: string
}

export interface CreateUserRequest {
    username: string
    displayName: string
    role: 'admin' | 'finance_admin' | 'finance_user'
    password: string
}

export interface UsersListResponse {
    users: User[]
}

/**
 * Get all users
 * GET /users
 */
export async function getUsers(): Promise<ApiResponse<UsersListResponse>> {
    const response = await apiFetch<UsersListResponse>('/users', {
        method: 'GET',
    })

    // Handle various n8n response formats
    if (response.success && response.data) {
        // If data is array directly
        if (Array.isArray(response.data)) {
            return { success: true, data: { users: response.data as unknown as User[] } }
        }
        // If data has users property
        if ((response.data as UsersListResponse).users) {
            return response
        }
        // If data is wrapped in another structure
        const data = response.data as unknown as Record<string, unknown>
        if (data.items && Array.isArray(data.items)) {
            return { success: true, data: { users: data.items as User[] } }
        }
    }

    return response
}

/**
 * Create a new user
 * POST /users
 */
export async function createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await apiFetch<User>('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
    })

    return response
}

/**
 * Delete a user
 * POST /users/delete
 */
export async function deleteUser(userId: string): Promise<ApiResponse<void>> {
    const response = await apiFetch<void>('/users/delete', {
        method: 'POST',
        body: JSON.stringify({ id: userId }),
    })

    return response
}

/**
 * Toggle user active status
 * POST /users/toggle
 */
export async function toggleUserStatus(userId: string, isActive: boolean): Promise<ApiResponse<User>> {
    const response = await apiFetch<User>('/users/toggle', {
        method: 'POST',
        body: JSON.stringify({ id: userId, isActive }),
    })

    return response
}
