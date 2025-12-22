'use server'

import pool from '@/lib/db'

export interface DashboardStats {
    income: number
    expense: number
    balance: number
}

export interface Transaction {
    id: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    category: string
    description: string
    date: string
    created_at: string
}

export interface MonthlyStats {
    month: string
    monthLabel: string
    income: number
    expense: number
    balance: number
}

export interface CategoryStats {
    category: string
    income: number
    expense: number
    total: number
}

/**
 * Get dashboard statistics directly from PostgreSQL
 * Optional month filter in format 'YYYY-MM'
 */
export async function getDashboardStats(month?: string): Promise<DashboardStats> {
    try {
        let query = `
            SELECT
                COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as expense
            FROM transactions
        `
        const params: string[] = []

        if (month) {
            query += ` WHERE TO_CHAR(date, 'YYYY-MM') = $1`
            params.push(month)
        }

        const result = await pool.query(query, params)

        const { income, expense } = result.rows[0]
        const incomeNum = parseFloat(income) || 0
        const expenseNum = parseFloat(expense) || 0

        return {
            income: incomeNum,
            expense: expenseNum,
            balance: incomeNum - expenseNum,
        }
    } catch (error) {
        console.error('Database error in getDashboardStats:', error)
        return { income: 0, expense: 0, balance: 0 }
    }
}

/**
 * Get recent transactions directly from PostgreSQL
 * Optional month filter in format 'YYYY-MM'
 */
export async function getRecentTransactions(limit: number = 20, month?: string): Promise<Transaction[]> {
    try {
        let query = `
            SELECT id, amount, type, category, description, date, created_at
            FROM transactions
        `
        const params: (string | number)[] = []

        if (month) {
            query += ` WHERE TO_CHAR(date, 'YYYY-MM') = $1`
            params.push(month)
            query += ` ORDER BY date DESC, created_at DESC LIMIT $2`
            params.push(limit)
        } else {
            query += ` ORDER BY date DESC, created_at DESC LIMIT $1`
            params.push(limit)
        }

        const result = await pool.query(query, params)

        return result.rows.map(row => ({
            id: String(row.id),
            amount: parseFloat(row.amount) || 0,
            type: row.type as 'INCOME' | 'EXPENSE',
            category: row.category || '',
            description: row.description || '',
            date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
            created_at: row.created_at ? new Date(row.created_at).toISOString() : '',
        }))
    } catch (error) {
        console.error('Database error in getRecentTransactions:', error)
        return []
    }
}

/**
 * Get weekly financial data for charts
 */
export async function getWeeklyStats(): Promise<{ name: string; gelir: number; gider: number }[]> {
    try {
        const result = await pool.query(`
            SELECT 
                TO_CHAR(date, 'Dy') as day_name,
                EXTRACT(DOW FROM date) as day_num,
                COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as expense
            FROM transactions
            WHERE date >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY TO_CHAR(date, 'Dy'), EXTRACT(DOW FROM date)
            ORDER BY day_num
        `)

        const dayNames: Record<string, string> = {
            'Sun': 'Paz', 'Mon': 'Pzt', 'Tue': 'Sal', 'Wed': 'Çar',
            'Thu': 'Per', 'Fri': 'Cum', 'Sat': 'Cmt'
        }

        return result.rows.map(row => ({
            name: dayNames[row.day_name] || row.day_name,
            gelir: parseFloat(row.income) || 0,
            gider: parseFloat(row.expense) || 0,
        }))
    } catch (error) {
        console.error('Database error in getWeeklyStats:', error)
        return []
    }
}

/**
 * Get expense distribution by category
 * Optional month filter in format 'YYYY-MM'
 */
export async function getExpenseDistribution(month?: string): Promise<{ name: string; value: number; color: string }[]> {
    try {
        let query = `
            SELECT 
                category,
                SUM(amount) as total
            FROM transactions
            WHERE type = 'EXPENSE'
        `
        const params: string[] = []

        if (month) {
            query += ` AND TO_CHAR(date, 'YYYY-MM') = $1`
            params.push(month)
        }

        query += ` GROUP BY category ORDER BY total DESC LIMIT 5`

        const result = await pool.query(query, params)

        const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899']

        return result.rows.map((row, index) => ({
            name: row.category || 'Diğer',
            value: parseFloat(row.total) || 0,
            color: colors[index % colors.length],
        }))
    } catch (error) {
        console.error('Database error in getExpenseDistribution:', error)
        return []
    }
}

/**
 * Get monthly summary for a given year
 */
export async function getMonthlySummary(year?: number): Promise<MonthlyStats[]> {
    try {
        const targetYear = year || new Date().getFullYear()

        const result = await pool.query(`
            SELECT 
                TO_CHAR(date, 'YYYY-MM') as month,
                TO_CHAR(date, 'TMMonth YYYY') as month_label,
                COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as expense
            FROM transactions
            WHERE EXTRACT(YEAR FROM date) = $1
            GROUP BY TO_CHAR(date, 'YYYY-MM'), TO_CHAR(date, 'TMMonth YYYY')
            ORDER BY month DESC
        `, [targetYear])

        const turkishMonths: Record<string, string> = {
            'January': 'Ocak', 'February': 'Şubat', 'March': 'Mart', 'April': 'Nisan',
            'May': 'Mayıs', 'June': 'Haziran', 'July': 'Temmuz', 'August': 'Ağustos',
            'September': 'Eylül', 'October': 'Ekim', 'November': 'Kasım', 'December': 'Aralık'
        }

        return result.rows.map(row => {
            const income = parseFloat(row.income) || 0
            const expense = parseFloat(row.expense) || 0
            // Convert English month to Turkish
            let monthLabel = row.month_label
            for (const [eng, tr] of Object.entries(turkishMonths)) {
                monthLabel = monthLabel.replace(eng, tr)
            }
            return {
                month: row.month,
                monthLabel: monthLabel,
                income,
                expense,
                balance: income - expense,
            }
        })
    } catch (error) {
        console.error('Database error in getMonthlySummary:', error)
        return []
    }
}

/**
 * Get category breakdown for a specific month
 */
export async function getCategoryBreakdown(month?: string): Promise<CategoryStats[]> {
    try {
        let query = `
            SELECT 
                category,
                COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as expense,
                COALESCE(SUM(amount), 0) as total
            FROM transactions
        `
        const params: string[] = []

        if (month) {
            query += ` WHERE TO_CHAR(date, 'YYYY-MM') = $1`
            params.push(month)
        }

        query += ` GROUP BY category ORDER BY total DESC`

        const result = await pool.query(query, params)

        return result.rows.map(row => ({
            category: row.category || 'Diğer',
            income: parseFloat(row.income) || 0,
            expense: parseFloat(row.expense) || 0,
            total: parseFloat(row.total) || 0,
        }))
    } catch (error) {
        console.error('Database error in getCategoryBreakdown:', error)
        return []
    }
}

/**
 * Get available months for filtering
 */
export async function getAvailableMonths(): Promise<{ value: string; label: string }[]> {
    try {
        const result = await pool.query(`
            SELECT DISTINCT 
                TO_CHAR(date, 'YYYY-MM') as month,
                TO_CHAR(date, 'TMMonth YYYY') as month_label
            FROM transactions
            ORDER BY month DESC
            LIMIT 24
        `)

        const turkishMonths: Record<string, string> = {
            'January': 'Ocak', 'February': 'Şubat', 'March': 'Mart', 'April': 'Nisan',
            'May': 'Mayıs', 'June': 'Haziran', 'July': 'Temmuz', 'August': 'Ağustos',
            'September': 'Eylül', 'October': 'Ekim', 'November': 'Kasım', 'December': 'Aralık'
        }

        return result.rows.map(row => {
            let label = row.month_label
            for (const [eng, tr] of Object.entries(turkishMonths)) {
                label = label.replace(eng, tr)
            }
            return {
                value: row.month,
                label: label,
            }
        })
    } catch (error) {
        console.error('Database error in getAvailableMonths:', error)
        return []
    }
}
