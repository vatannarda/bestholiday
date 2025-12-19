import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'admin' | 'worker' | null

export interface User {
    username: string
    role: UserRole
    displayName: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    login: (username: string, password: string) => { success: boolean; error?: string }
    logout: () => void
}

// Mock credentials
const MOCK_USERS: Record<string, { password: string; role: UserRole; displayName: string }> = {
    admin: { password: 'admin', role: 'admin', displayName: 'Yönetici' },
    user: { password: 'user', role: 'worker', displayName: 'Personel' },
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (username: string, password: string) => {
                const mockUser = MOCK_USERS[username.toLowerCase()]

                if (!mockUser) {
                    return { success: false, error: 'Kullanıcı bulunamadı' }
                }

                if (mockUser.password !== password) {
                    return { success: false, error: 'Şifre hatalı' }
                }

                set({
                    user: {
                        username: username.toLowerCase(),
                        role: mockUser.role,
                        displayName: mockUser.displayName,
                    },
                    isAuthenticated: true,
                })

                return { success: true }
            },
            logout: () => {
                set({ user: null, isAuthenticated: false })
            },
        }),
        {
            name: 'bestholiday-auth',
        }
    )
)
