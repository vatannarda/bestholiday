"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { type Transaction, type Currency } from "@/lib/actions/n8n"
import { ArrowUpRight, ArrowDownRight, Calendar, Tag, Banknote } from "lucide-react"

interface TransactionCardProps {
    transaction: Transaction
    dateLabel?: string
    categoryLabel?: string
    showCurrency?: boolean
}

const currencySymbols: Record<Currency, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
}

export function TransactionCard({
    transaction,
    dateLabel = "Tarih",
    categoryLabel = "Kategori",
    showCurrency = true
}: TransactionCardProps) {
    const isIncome = transaction.type === 'INCOME'
    const symbol = currencySymbols[transaction.currency] || '₺'

    return (
        <Card className={`relative overflow-hidden hover-card-effect border border-border/50 ${isIncome ? 'border-l-4 border-l-green-500 dark:border-l-green-600' : 'border-l-4 border-l-destructive dark:border-l-destructive'
            }`}>
            <CardContent className="p-4">
                {/* Amount - Top Right */}
                <div className={`absolute top-3 right-3 flex items-center gap-1 text-lg font-bold tabular-nums ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                    {isIncome ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {isIncome ? '+' : '-'}{symbol}{transaction.amount.toLocaleString()}
                </div>

                {/* Description */}
                <h3 className="font-medium text-base pr-28 line-clamp-2 mb-3 leading-snug">
                    {transaction.description}
                </h3>

                {/* Meta Info Grid */}
                <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-muted-foreground">
                    {/* Date */}
                    <div className="flex items-center gap-1.5 min-w-[120px]">
                        <Calendar className="h-3.5 w-3.5 opacity-70" />
                        <span>{dateLabel}: </span>
                        <span className="font-medium text-foreground/80">
                            {transaction.transaction_date
                                ? new Date(transaction.transaction_date).toLocaleDateString()
                                : '-'}
                        </span>
                    </div>

                    {/* Currency */}
                    {showCurrency && (
                        <div className="flex items-center gap-1.5">
                            <Banknote className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">{transaction.currency}</span>
                        </div>
                    )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {transaction.category}
                    </Badge>

                    {transaction.sub_category && (
                        <Badge variant="secondary" className="text-xs">
                            {transaction.sub_category}
                        </Badge>
                    )}

                    <Badge variant={isIncome ? "success" : "destructive"} className="text-xs">
                        {isIncome ? 'Gelir' : 'Gider'}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    )
}
