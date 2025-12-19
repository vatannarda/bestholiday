"use client"

import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Receipt } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useTransactionStore } from "@/lib/store/transaction-store"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts"

const weeklyData = [
    { name: "Pzt", gelir: 4000, gider: 2400 },
    { name: "Sal", gelir: 3000, gider: 1398 },
    { name: "Çar", gelir: 2000, gider: 800 },
    { name: "Per", gelir: 2780, gider: 1908 },
    { name: "Cum", gelir: 5890, gider: 2800 },
    { name: "Cmt", gelir: 8390, gider: 3800 },
    { name: "Paz", gelir: 6490, gider: 1300 },
]

const expenseData = [
    { name: "Yakıt", value: 7300, color: "#f97316" },
    { name: "Personel", value: 3500, color: "#3b82f6" },
    { name: "Ofis", value: 1200, color: "#10b981" },
]

export default function AdminDashboard() {
    const transactions = useTransactionStore((state) => state.transactions)

    const totalIncome = transactions
        .filter((t) => t.type === "gelir")
        .reduce((acc, t) => acc + t.amount, 0)

    const totalExpense = transactions
        .filter((t) => t.type === "gider")
        .reduce((acc, t) => acc + t.amount, 0)

    const netBalance = totalIncome - totalExpense

    const recentTransactions = transactions.slice(0, 5)

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Toplam Gelir
                        </CardTitle>
                        <div className="p-2 bg-green-500/10 rounded-full">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            ₺{totalIncome.toLocaleString("tr-TR")}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">+12.5%</span>
                            <span>geçen aya göre</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Toplam Gider
                        </CardTitle>
                        <div className="p-2 bg-red-500/10 rounded-full">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            ₺{totalExpense.toLocaleString("tr-TR")}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <ArrowDownRight className="h-3 w-3 text-red-500" />
                            <span className="text-red-500">-8.2%</span>
                            <span>geçen aya göre</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Net Bakiye
                        </CardTitle>
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Wallet className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            ₺{netBalance.toLocaleString("tr-TR")}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <ArrowUpRight className="h-3 w-3 text-primary" />
                            <span className="text-primary">+18.3%</span>
                            <span>geçen aya göre</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            Haftalık Finansal Durum
                        </CardTitle>
                        <CardDescription>
                            Bu haftanın gelir ve gider karşılaştırması
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="name" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                        formatter={(value) => [`₺${Number(value).toLocaleString("tr-TR")}`, ""]}
                                    />
                                    <Bar dataKey="gelir" name="Gelir" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="gider" name="Gider" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5" />
                            Gider Dağılımı
                        </CardTitle>
                        <CardDescription>
                            Kategorilere göre gider oranları
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {expenseData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                        formatter={(value) => [`₺${Number(value).toLocaleString("tr-TR")}`, ""]}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Son İşlemler</CardTitle>
                    <CardDescription>
                        En son yapılan finansal hareketler
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tarih</TableHead>
                                <TableHead>Açıklama</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Tür</TableHead>
                                <TableHead className="text-right">Tutar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTransactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="font-medium">
                                        {new Date(transaction.date).toLocaleDateString("tr-TR")}
                                    </TableCell>
                                    <TableCell>{transaction.description}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{transaction.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={transaction.type === "gelir" ? "success" : "destructive"}>
                                            {transaction.type === "gelir" ? "Gelir" : "Gider"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={`text-right font-medium ${transaction.type === "gelir" ? "text-green-500" : "text-red-500"
                                        }`}>
                                        {transaction.type === "gelir" ? "+" : "-"}₺{transaction.amount.toLocaleString("tr-TR")}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
