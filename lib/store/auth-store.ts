import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginUser } from '@/lib/api/auth'

/**
 * User Roles:
 * - admin: Master user, sees all modules and all data
 * - finance_admin: Finance manager, Muhasebe only, sees all ledger data
 * - finance_user: Finance staff, Muhasebe only, sees only own entries
 */
export type UserRole = 'admin' | 'finance_admin' | 'finance_user' | null

export interface User {
    id?: string
    username: string
    role: UserRole
    displayName: string
    isActive?: boolean
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => void
    setLoading: (loading: boolean) => void
}

/**
 * Permission Helper Functions
 */

// Can user see Modules page (Master Panel)?
export function canSeeModulesPage(role: UserRole): boolean {
    return role === 'admin'
}

// Can user see all ledger entries (not just their own)?
export function canSeeAllLedger(role: UserRole): boolean {
    return role === 'admin' || role === 'finance_admin'
}

// Can user see "Created By" column?
export function canSeeCreatedByColumn(role: UserRole): boolean {
    return role === 'admin' || role === 'finance_admin'
}

// Get landing page for user after login
export function getLandingPage(role: UserRole): string {
    if (role === 'admin') return '/admin'
    if (role === 'finance_admin') return '/admin/modules/accounting'
    if (role === 'finance_user') return '/user/panel'
    return '/admin'
}

// Check if user has access to a specific module
export function hasModuleAccess(role: UserRole, module: 'accounting' | 'transfer'): boolean {
    if (role === 'admin') return true
    if (role === 'finance_admin' || role === 'finance_user') {
        return module === 'accounting'
    }
    return false
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (username: string, password: string) => {
                set({ isLoading: true })

                try {
                    const response = await loginUser({ username, password })

                    if (!response.success || !response.data) {
                        set({ isLoading: false })
                        return {
                            success: false,
                            error: response.error || 'Giriş başarısız'
                        }
                    }

                    const userData = response.data.user

                    // Check if user is active
                    if (userData.isActive === false) {
                        set({ isLoading: false })
                        return {
                            success: false,
                            error: 'Hesabınız devre dışı bırakılmış. Yönetici ile iletişime geçin.'
                        }
                    }

                    set({
                        user: {
                            id: userData.id,
                            username: userData.username,
                            role: userData.role,
                            displayName: userData.displayName,
                            isActive: userData.isActive,
                        },
                        isAuthenticated: true,
                        isLoading: false,
                    })

                    return { success: true }
                } catch (error) {
                    console.error('Login error:', error)
                    set({ isLoading: false })
                    return {
                        success: false,
                        error: 'Bağlantı hatası. Lütfen tekrar deneyin.'
                    }
                }
            },

            logout: () => {
                set({ user: null, isAuthenticated: false, isLoading: false })
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading })
            },
        }),
        {
            name: 'bestholiday-auth',
        }
    )
)
