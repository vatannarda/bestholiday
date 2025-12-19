"use client"

import { useState } from "react"
import { Pencil, Trash2, PlusCircle, Search, Filter } from "lucide-react"
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
import { useTransactionStore, type Transaction } from "@/lib/store/transaction-store"
import { useAuthStore } from "@/lib/store/auth-store"

const categories = [
    "Tur Satışı",
    "Otel Komisyonu",
    "Transfer",
    "Yakıt",
    "Personel",
    "Ofis Gideri",
    "Reklam",
    "Diğer",
]

export default function TransactionsPage() {
    const user = useAuthStore((state) => state.user)
    const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactionStore()
    const isAdmin = user?.role === "admin"

    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState<"all" | "gelir" | "gider">("all")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        type: "gider" as "gelir" | "gider",
        category: "",
        description: "",
    })

    const filteredTransactions = transactions.filter((t) => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === "all" || t.type === filterType
        return matchesSearch && matchesType
    })

    const handleAddTransaction = () => {
        if (!formData.amount || !formData.category || !formData.description) return

        addTransaction({
            date: formData.date,
            amount: parseFloat(formData.amount),
            type: formData.type,
            category: formData.category,
            description: formData.description,
            createdBy: user?.username || "user",
        })

        setFormData({
            date: new Date().toISOString().split("T")[0],
            amount: "",
            type: "gider",
            category: "",
            description: "",
        })
        setIsAddDialogOpen(false)
    }

    const handleEditTransaction = () => {
        if (!editingTransaction) return

        updateTransaction(editingTransaction.id, {
            date: formData.date,
            amount: parseFloat(formData.amount),
            type: formData.type,
            category: formData.category,
            description: formData.description,
        })

        setEditingTransaction(null)
        setFormData({
            date: new Date().toISOString().split("T")[0],
            amount: "",
            type: "gider",
            category: "",
            description: "",
        })
    }

    const openEditDialog = (transaction: Transaction) => {
        setEditingTransaction(transaction)
        setFormData({
            date: transaction.date,
            amount: transaction.amount.toString(),
            type: transaction.type,
            category: transaction.category,
            description: transaction.description,
        })
    }

    const handleDelete = (id: string) => {
        if (confirm("Bu işlemi silmek istediğinizden emin misiniz?")) {
            deleteTransaction(id)
        }
    }

    const TransactionForm = ({ onSubmit, submitText }: { onSubmit: () => void; submitText: string }) => (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="date">Tarih</Label>
                    <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amount">Tutar (₺)</Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tür</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value: "gelir" | "gider") => setFormData({ ...formData, type: value })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gelir">Gelir</SelectItem>
                            <SelectItem value="gider">Gider</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seçin..." />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Input
                    id="description"
                    placeholder="İşlem açıklaması..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>
            <DialogFooter>
                <Button onClick={onSubmit}>{submitText}</Button>
            </DialogFooter>
        </div>
    )

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Tüm İşlemler</CardTitle>
                            <CardDescription>
                                {isAdmin ? "Tüm finansal hareketleri görüntüle ve yönet" : "İşlemlerinizi görüntüleyin"}
                            </CardDescription>
                        </div>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Yeni İşlem
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Yeni İşlem Ekle</DialogTitle>
                                    <DialogDescription>
                                        Yeni bir finansal işlem kaydı oluşturun.
                                    </DialogDescription>
                                </DialogHeader>
                                <TransactionForm onSubmit={handleAddTransaction} submitText="Ekle" />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={filterType} onValueChange={(value: "all" | "gelir" | "gider") => setFilterType(value)}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tümü</SelectItem>
                                <SelectItem value="gelir">Gelirler</SelectItem>
                                <SelectItem value="gider">Giderler</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tarih</TableHead>
                                    <TableHead>Açıklama</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Ekleyen</TableHead>
                                    <TableHead>Tür</TableHead>
                                    <TableHead className="text-right">Tutar</TableHead>
                                    {isAdmin && <TableHead className="text-right">İşlemler</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground">
                                            İşlem bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">
                                                {new Date(transaction.date).toLocaleDateString("tr-TR")}
                                            </TableCell>
                                            <TableCell>{transaction.description}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{transaction.category}</Badge>
                                            </TableCell>
                                            <TableCell className="capitalize">{transaction.createdBy}</TableCell>
                                            <TableCell>
                                                <Badge variant={transaction.type === "gelir" ? "success" : "destructive"}>
                                                    {transaction.type === "gelir" ? "Gelir" : "Gider"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${transaction.type === "gelir" ? "text-green-500" : "text-red-500"
                                                }`}>
                                                {transaction.type === "gelir" ? "+" : "-"}₺{transaction.amount.toLocaleString("tr-TR")}
                                            </TableCell>
                                            {isAdmin && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Dialog open={editingTransaction?.id === transaction.id} onOpenChange={(open) => {
                                                            if (!open) setEditingTransaction(null)
                                                        }}>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(transaction)}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>İşlemi Düzenle</DialogTitle>
                                                                    <DialogDescription>
                                                                        İşlem bilgilerini güncelleyin.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <TransactionForm onSubmit={handleEditTransaction} submitText="Güncelle" />
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
