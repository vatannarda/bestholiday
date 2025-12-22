"use client"

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"

interface ExpensePieChartProps {
    data: { name: string; value: number; color: string }[]
}

// Custom tooltip component for better readability
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
    if (active && payload && payload.length) {
        const data = payload[0]
        return (
            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                <p className="font-medium text-foreground">{data.name}</p>
                <p className="text-lg font-bold" style={{ color: data.payload.color }}>
                    ₺{data.value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        )
    }
    return null
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
    // If no data, show placeholder
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Gider verisi bulunmuyor
            </div>
        )
    }

    // Calculate total for percentage
    const total = data.reduce((sum, item) => sum + item.value, 0)

    return (
        <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: %${((value / total) * 100).toFixed(0)}`}
                        labelLine={false}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        formatter={(value, entry) => {
                            const item = data.find(d => d.name === value)
                            if (item) {
                                return `${value} (₺${item.value.toLocaleString("tr-TR")})`
                            }
                            return value
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
