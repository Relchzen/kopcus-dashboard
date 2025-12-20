import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string | {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    trendClassName?: string;
    footer?: React.ReactNode; // NEW: for extra details
}

export function StatsCard({ title, value, icon: Icon, trend, className, trendClassName, footer }: StatsCardProps) {
    // Determine trend color - red for offline status, otherwise muted
    const defaultTrendColor = typeof trend === 'string' && trend.toLowerCase().includes('offline')
        ? 'text-red-500 font-bold'
        : 'text-muted-foreground';

    return (
        <Card className={cn("overflow-hidden transition-all hover:shadow-lg flex flex-col justify-between", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <p className={cn("text-xs mt-1", trendClassName || defaultTrendColor)}>
                        {typeof trend === 'string' 
                            ? trend 
                            : `${trend.isPositive ? "↑" : "↓"} ${Math.abs(trend.value)}% from last week`
                        }
                    </p>
                )}
                {footer && footer}
            </CardContent>
        </Card>
    );
}
