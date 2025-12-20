"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

interface WeeklyChartProps {
    data: { name: string; gelir: number; gider: number }[]
}

export function WeeklyChart({ data }: WeeklyChartProps) {
    // If no data, show placeholder
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Bu hafta için veri bulunmuyor
            </div>
        )
    }

    return (
        <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
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
    )
}
