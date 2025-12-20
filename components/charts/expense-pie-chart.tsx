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

export function ExpensePieChart({ data }: ExpensePieChartProps) {
    // If no data, show placeholder
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Gider verisi bulunmuyor
            </div>
        )
    }

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
                    >
                        {data.map((entry, index) => (
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
    )
}
