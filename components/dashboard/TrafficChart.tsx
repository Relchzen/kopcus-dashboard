import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyTraffic } from "@/lib/api/analytics";

interface TrafficChartProps {
    data: DailyTraffic[] | undefined;
}

export function TrafficChart({ data }: TrafficChartProps) {
    if (!data?.length) {
        return (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                No traffic data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <XAxis 
                    dataKey="date" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#888888' }}
                />
                <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`}
                    tick={{ fill: '#888888' }}
                />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: "hsl(var(--popover))", 
                        border: "1px solid hsl(var(--border))", 
                        borderRadius: "8px",
                        color: "hsl(var(--popover-foreground))" 
                    }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                />
                <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
