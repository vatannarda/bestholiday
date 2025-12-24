"use client"

import { useState, useEffect, useCallback } from "react"
import { Users, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, RefreshCw, Shield, UserIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTranslation } from "@/lib/store/language-store"
import { getUsers, createUser, deleteUser, toggleUserStatus, type User } from "@/lib/api/users"
import { toast } from "sonner"

export default function UsersPage() {
    const { t, language } = useTranslation()

    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Create form state
    const [newUser, setNewUser] = useState({
        username: "",
        displayName: "",
        password: "",
        role: "finance_user" as "admin" | "finance_admin" | "finance_user",
    })

    // Load users
    const loadUsers = useCallback(async (showToast = false) => {
        try {
            if (showToast) setIsRefreshing(true)
            const response = await getUsers()

            if (response.success && response.data) {
                setUsers(response.data.users || [])
            } else {
                toast.error(t.toast.error, { description: response.error })
            }
        } catch (error) {
            console.error('Load users error:', error)
            toast.error(t.toast.connectionError)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [t])

    useEffect(() => {
        loadUsers()
    }, [loadUsers])

    // Create user
    const handleCreate = async () => {
        if (!newUser.username || !newUser.displayName || !newUser.password) {
            toast.error(t.toast.error, { description: "Tüm alanları doldurun" })
            return
        }

        setIsSubmitting(true)
        try {
            const response = await createUser(newUser)

            if (response.success) {
                toast.success(t.users.createSuccess)
                setIsCreateOpen(false)
                setNewUser({ username: "", displayName: "", password: "", role: "finance_user" })
                loadUsers()
            } else {
                toast.error(t.toast.error, { description: response.error })
            }
        } catch (error) {
            console.error('Create user error:', error)
            toast.error(t.toast.connectionError)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Delete user
    const handleDelete = async () => {
        if (!selectedUser) return

        setIsSubmitting(true)
        try {
            const response = await deleteUser(selectedUser.id)

            if (response.success) {
                toast.success(t.users.deleteSuccess)
                setIsDeleteOpen(false)
                setSelectedUser(null)
                loadUsers()
            } else {
                toast.error(t.toast.error, { description: response.error })
            }
        } catch (error) {
            console.error('Delete user error:', error)
            toast.error(t.toast.connectionError)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Toggle user status
    const handleToggle = async (user: User) => {
        try {
            const response = await toggleUserStatus(user.id, !user.isActive)

            if (response.success) {
                toast.success(t.users.toggleSuccess)
                loadUsers()
            } else {
                toast.error(t.toast.error, { description: response.error })
            }
        } catch (error) {
            console.error('Toggle user error:', error)
            toast.error(t.toast.connectionError)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">{t.common.loading}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                {t.users.title}
                            </CardTitle>
                            <CardDescription>{t.users.subtitle}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadUsers(true)}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {t.common.refresh}
                            </Button>

                            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t.users.addUser}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t.users.addUser}</DialogTitle>
                                        <DialogDescription>{t.users.subtitle}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>{t.users.username}</Label>
                                            <Input
                                                value={newUser.username}
                                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                                placeholder="johndoe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t.users.displayName}</Label>
                                            <Input
                                                value={newUser.displayName}
                                                onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t.users.password}</Label>
                                            <Input
                                                type="password"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t.users.role}</Label>
                                            <Select
                                                value={newUser.role}
                                                onValueChange={(value: "admin" | "finance_admin" | "finance_user") => setNewUser({ ...newUser, role: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="h-4 w-4 text-primary" />
                                                            {t.users.admin}
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="finance_admin">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="h-4 w-4 text-amber-500" />
                                                            {t.users.financeAdmin}
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="finance_user">
                                                        <div className="flex items-center gap-2">
                                                            <UserIcon className="h-4 w-4 text-blue-500" />
                                                            {t.users.financeUser}
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                            {t.common.cancel}
                                        </Button>
                                        <Button onClick={handleCreate} disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Plus className="h-4 w-4 mr-2" />
                                            )}
                                            {t.users.create}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {t.users.noUsers}
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="grid gap-4 md:hidden">
                                {users.map((user) => (
                                    <Card key={user.id} className="border-l-4 border-l-primary">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-medium">{user.displayName}</h3>
                                                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                        {user.role === 'admin' ? t.users.admin : t.users.worker}
                                                    </Badge>
                                                    <Badge variant={user.isActive ? 'success' : 'destructive'}>
                                                        {user.isActive ? t.users.active : t.users.inactive}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggle(user)}
                                                    className="flex-1"
                                                >
                                                    {user.isActive ? (
                                                        <ToggleRight className="h-4 w-4 mr-2" />
                                                    ) : (
                                                        <ToggleLeft className="h-4 w-4 mr-2" />
                                                    )}
                                                    {t.users.toggle}
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user)
                                                        setIsDeleteOpen(true)
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t.users.username}</TableHead>
                                            <TableHead>{t.users.displayName}</TableHead>
                                            <TableHead>{t.users.role}</TableHead>
                                            <TableHead>{t.users.status}</TableHead>
                                            <TableHead className="text-right">{t.users.actions}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">@{user.username}</TableCell>
                                                <TableCell>{user.displayName}</TableCell>
                                                <TableCell>
                                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                        {user.role === 'admin' ? (
                                                            <><Shield className="h-3 w-3 mr-1" />{t.users.admin}</>
                                                        ) : (
                                                            <><UserIcon className="h-3 w-3 mr-1" />{t.users.worker}</>
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.isActive ? 'success' : 'destructive'}>
                                                        {user.isActive ? t.users.active : t.users.inactive}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleToggle(user)}
                                                        >
                                                            {user.isActive ? (
                                                                <ToggleRight className="h-4 w-4" />
                                                            ) : (
                                                                <ToggleLeft className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedUser(user)
                                                                setIsDeleteOpen(true)
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t.users.deleteConfirm}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t.users.deleteWarning}
                            {selectedUser && (
                                <span className="block mt-2 font-medium">
                                    {selectedUser.displayName} (@{selectedUser.username})
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            {t.users.delete}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
