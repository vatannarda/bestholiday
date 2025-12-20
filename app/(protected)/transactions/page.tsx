import { Suspense } from "react"
import { getRecentTransactions } from "@/lib/actions/db"
import { TransactionsClient } from "./transactions-client"

export const dynamic = 'force-dynamic'

export default async function TransactionsPage() {
    const transactions = await getRecentTransactions(100)

    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <TransactionsClient initialTransactions={transactions} />
        </Suspense>
    )
}
