"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, User, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Logo } from "@/components/best-holiday-ui/logo"
import { useAuthStore } from "@/lib/store/auth-store"
import { useTranslation } from "@/lib/store/language-store"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
    const router = useRouter()
    const { login, logout, isLoading } = useAuthStore()
    const { t } = useTranslation()

    const [adminUsername, setAdminUsername] = useState("")
    const [adminPassword, setAdminPassword] = useState("")
    const [workerUsername, setWorkerUsername] = useState("")
    const [workerPassword, setWorkerPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (username: string, password: string, loginType: 'admin' | 'worker') => {
        setError("")

        if (!username.trim() || !password.trim()) {
            setError(t.login.loginFailed)
            return
        }



        const result = await login(username, password)

        if (!result.success) {
            setError(result.error || t.login.loginFailed)
            return
        }

        const user = useAuthStore.getState().user

        // Security check: Enforce role separation
        if (loginType === 'admin') {
            // Admin tab: Only allow 'admin' role
            if (user?.role !== 'admin') {
                logout() // Logout immediately
                setError("Bu panelden sadece Yöneticiler giriş yapabilir.")
                return
            }
        } else {
            // Worker tab: Allow everyone EXCEPT 'admin'
            if (user?.role === 'admin') {
                logout() // Logout immediately
                setError("Yöneticiler 'Yönetici Girişi' sekmesinden giriş yapmalıdır.")
                return
            }
        }

        // Redirect based on role
        if (user?.role === 'admin') {
            router.push('/admin/dashboard')
        } else {
            router.push('/worker/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
            {/* Language and Theme toggles */}
            <div className="fixed top-4 right-4 flex items-center gap-1 z-50">
                <LanguageToggle />
                <ThemeToggle />
            </div>

            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md relative backdrop-blur-sm bg-card/95 border-primary/10 shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <Logo size="lg" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">{t.login.welcome}</CardTitle>
                        <CardDescription className="mt-2">
                            {t.login.subtitle}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="admin" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="admin" className="gap-2">
                                <Shield className="h-4 w-4" />
                                {t.login.admin}
                            </TabsTrigger>
                            <TabsTrigger value="worker" className="gap-2">
                                <User className="h-4 w-4" />
                                {t.login.worker}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="admin">
                            <form onSubmit={(e) => {
                                e.preventDefault()
                                handleLogin(adminUsername, adminPassword, 'admin')
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="admin-username">{t.login.username}</Label>
                                    <Input
                                        id="admin-username"
                                        placeholder={t.login.username}
                                        value={adminUsername}
                                        onChange={(e) => setAdminUsername(e.target.value)}
                                        disabled={isLoading}
                                        className="min-h-[44px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="admin-password">{t.login.password}</Label>
                                    <div className="relative">
                                        <Input
                                            id="admin-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={adminPassword}
                                            onChange={(e) => setAdminPassword(e.target.value)}
                                            disabled={isLoading}
                                            className="min-h-[44px]"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                {error && (
                                    <p className="text-sm text-destructive text-center">{error}</p>
                                )}
                                <Button type="submit" className="w-full min-h-[48px]" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t.login.loggingIn}
                                        </>
                                    ) : (
                                        t.login.adminLogin
                                    )}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="worker">
                            <form onSubmit={(e) => {
                                e.preventDefault()
                                handleLogin(workerUsername, workerPassword, 'worker')
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="worker-username">{t.login.username}</Label>
                                    <Input
                                        id="worker-username"
                                        placeholder={t.login.username}
                                        value={workerUsername}
                                        onChange={(e) => setWorkerUsername(e.target.value)}
                                        disabled={isLoading}
                                        className="min-h-[44px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="worker-password">{t.login.password}</Label>
                                    <div className="relative">
                                        <Input
                                            id="worker-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={workerPassword}
                                            onChange={(e) => setWorkerPassword(e.target.value)}
                                            disabled={isLoading}
                                            className="min-h-[44px]"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                {error && (
                                    <p className="text-sm text-destructive text-center">{error}</p>
                                )}
                                <Button type="submit" className="w-full min-h-[48px]" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t.login.loggingIn}
                                        </>
                                    ) : (
                                        t.login.workerLogin
                                    )}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
