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

/**
 * Get dashboard statistics directly from PostgreSQL
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const result = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as expense
      FROM transactions
    `)

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
        // Return zeros if database is not available
        return { income: 0, expense: 0, balance: 0 }
    }
}

/**
 * Get recent transactions directly from PostgreSQL
 */
export async function getRecentTransactions(limit: number = 20): Promise<Transaction[]> {
    try {
        const result = await pool.query(
            `SELECT id, amount, type, category, description, date, created_at
       FROM transactions 
       ORDER BY date DESC, created_at DESC 
       LIMIT $1`,
            [limit]
        )

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
 */
export async function getExpenseDistribution(): Promise<{ name: string; value: number; color: string }[]> {
    try {
        const result = await pool.query(`
      SELECT 
        category,
        SUM(amount) as total
      FROM transactions
      WHERE type = 'EXPENSE'
      GROUP BY category
      ORDER BY total DESC
      LIMIT 5
    `)

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
