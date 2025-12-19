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

export default function LoginPage() {
    const router = useRouter()
    const login = useAuthStore((state) => state.login)

    const [adminUsername, setAdminUsername] = useState("")
    const [adminPassword, setAdminPassword] = useState("")
    const [workerUsername, setWorkerUsername] = useState("")
    const [workerPassword, setWorkerPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (username: string, password: string, expectedRole: 'admin' | 'worker') => {
        setError("")
        setIsLoading(true)

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))

        const result = login(username, password)

        if (!result.success) {
            setError(result.error || "Giriş başarısız")
            setIsLoading(false)
            return
        }

        // Redirect based on role
        const user = useAuthStore.getState().user
        if (user?.role === 'admin') {
            router.push('/admin/dashboard')
        } else {
            router.push('/worker/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
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
                        <CardTitle className="text-2xl">Hoş Geldiniz</CardTitle>
                        <CardDescription className="mt-2">
                            Hesabınıza giriş yaparak devam edin
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="admin" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="admin" className="gap-2">
                                <Shield className="h-4 w-4" />
                                Yönetici
                            </TabsTrigger>
                            <TabsTrigger value="worker" className="gap-2">
                                <User className="h-4 w-4" />
                                Personel
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="admin">
                            <form onSubmit={(e) => {
                                e.preventDefault()
                                handleLogin(adminUsername, adminPassword, 'admin')
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="admin-username">Kullanıcı Adı</Label>
                                    <Input
                                        id="admin-username"
                                        placeholder="admin"
                                        value={adminUsername}
                                        onChange={(e) => setAdminUsername(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="admin-password">Şifre</Label>
                                    <div className="relative">
                                        <Input
                                            id="admin-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={adminPassword}
                                            onChange={(e) => setAdminPassword(e.target.value)}
                                            disabled={isLoading}
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
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Giriş yapılıyor...
                                        </>
                                    ) : (
                                        "Yönetici Girişi"
                                    )}
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                    Demo: admin / admin
                                </p>
                            </form>
                        </TabsContent>

                        <TabsContent value="worker">
                            <form onSubmit={(e) => {
                                e.preventDefault()
                                handleLogin(workerUsername, workerPassword, 'worker')
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="worker-username">Kullanıcı Adı</Label>
                                    <Input
                                        id="worker-username"
                                        placeholder="user"
                                        value={workerUsername}
                                        onChange={(e) => setWorkerUsername(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="worker-password">Şifre</Label>
                                    <div className="relative">
                                        <Input
                                            id="worker-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={workerPassword}
                                            onChange={(e) => setWorkerPassword(e.target.value)}
                                            disabled={isLoading}
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
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Giriş yapılıyor...
                                        </>
                                    ) : (
                                        "Personel Girişi"
                                    )}
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                    Demo: user / user
                                </p>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
