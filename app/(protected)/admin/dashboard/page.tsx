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
import { getDashboardStats, getRecentTransactions, getWeeklyStats, getExpenseDistribution } from "@/lib/actions/db"
import { WeeklyChart } from "@/components/charts/weekly-chart"
import { ExpensePieChart } from "@/components/charts/expense-pie-chart"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    // Fetch data directly from PostgreSQL
    const [stats, transactions, weeklyData, expenseData] = await Promise.all([
        getDashboardStats(),
        getRecentTransactions(5),
        getWeeklyStats(),
        getExpenseDistribution(),
    ])

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
                            ₺{stats.income.toLocaleString("tr-TR")}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">Canlı Veri</span>
                            <span>PostgreSQL</span>
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
                            ₺{stats.expense.toLocaleString("tr-TR")}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <ArrowDownRight className="h-3 w-3 text-red-500" />
                            <span className="text-red-500">Canlı Veri</span>
                            <span>PostgreSQL</span>
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
                            ₺{stats.balance.toLocaleString("tr-TR")}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <ArrowUpRight className="h-3 w-3 text-primary" />
                            <span className="text-primary">Canlı Veri</span>
                            <span>PostgreSQL</span>
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
                        <WeeklyChart data={weeklyData} />
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
                        <ExpensePieChart data={expenseData} />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Son İşlemler</CardTitle>
                    <CardDescription>
                        Veritabanından alınan son finansal hareketler
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Henüz işlem bulunmuyor. Veritabanı bağlantısını kontrol edin.
                        </div>
                    ) : (
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
                                {transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-medium">
                                            {transaction.date ? new Date(transaction.date).toLocaleDateString("tr-TR") : '-'}
                                        </TableCell>
                                        <TableCell>{transaction.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{transaction.category}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={transaction.type === "INCOME" ? "success" : "destructive"}>
                                                {transaction.type === "INCOME" ? "Gelir" : "Gider"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={`text-right font-medium ${transaction.type === "INCOME" ? "text-green-500" : "text-red-500"
                                            }`}>
                                            {transaction.type === "INCOME" ? "+" : "-"}₺{transaction.amount.toLocaleString("tr-TR")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
