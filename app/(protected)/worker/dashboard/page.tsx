import { Suspense } from "react"
import { getRecentTransactions } from "@/lib/actions/db"
import { WorkerDashboardClient } from "./worker-dashboard-client"

export const dynamic = 'force-dynamic'

export default async function WorkerDashboard() {
    const transactions = await getRecentTransactions(10)

    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <WorkerDashboardClient recentTransactions={transactions} />
        </Suspense>
    )
}
