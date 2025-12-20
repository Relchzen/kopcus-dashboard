import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Zap, LayoutTemplate, Timer } from "lucide-react";

interface LighthouseCardProps {
    title: string;
    score: number | null;
    metrics?: {
        lcp: string | null;
        cls: string | null;
        fcp: string | null;
    };
}

interface MetricStatus {
    label: string;
    color: string;
    bg: string;
}

function getMetricStatus(value: string | null, type: 'lcp' | 'cls' | 'fcp'): MetricStatus {
    if (!value) return { label: '-', color: 'text-muted-foreground', bg: 'bg-muted' };
    
    const num = parseFloat(value);
    if (isNaN(num)) return { label: '-', color: 'text-muted-foreground', bg: 'bg-muted' };

    if (type === 'lcp') {
        // LCP thresholds: Good <= 2.5s, Needs Improvement <= 4.0s, Poor > 4.0s
        if (num <= 2.5) return { label: 'Good', color: 'text-green-600', bg: 'bg-green-500/10' };
        if (num <= 4.0) return { label: 'Needs Improv.', color: 'text-yellow-600', bg: 'bg-yellow-500/10' };
        return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-500/10' };
    }
    
    if (type === 'cls') {
        // CLS thresholds: Good <= 0.1, Needs Improvement <= 0.25, Poor > 0.25
        if (num <= 0.1) return { label: 'Good', color: 'text-green-600', bg: 'bg-green-500/10' };
        if (num <= 0.25) return { label: 'Needs Improv.', color: 'text-yellow-600', bg: 'bg-yellow-500/10' };
        return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-500/10' };
    }
    
    if (type === 'fcp') {
        // FCP thresholds: Good <= 1.8s, Needs Improvement <= 3.0s, Poor > 3.0s
        if (num <= 1.8) return { label: 'Good', color: 'text-green-600', bg: 'bg-green-500/10' };
        if (num <= 3.0) return { label: 'Needs Improv.', color: 'text-yellow-600', bg: 'bg-yellow-500/10' };
        return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-500/10' };
    }
    
    return { label: '-', color: 'text-muted-foreground', bg: 'bg-muted' };
}

interface MetricRowProps {
    icon: React.ElementType;
    label: string;
    value: string | null;
    status: MetricStatus;
}

function MetricRow({ icon: Icon, label, value, status }: MetricRowProps) {
    return (
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-foreground">{value || '-'}</span>
                <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                    status.color,
                    status.bg
                )}>
                    {status.label}
                </span>
            </div>
        </div>
    );
}

export function LighthouseCard({ title, score, metrics }: LighthouseCardProps) {
    const safeScore = score ?? 0;
    
    // Determine color based on score thresholds
    const scoreColor = safeScore >= 90 
        ? "text-green-500" 
        : safeScore >= 50 
        ? "text-yellow-500" 
        : "text-red-500";
    
    const ringColor = safeScore >= 90 
        ? "stroke-green-500" 
        : safeScore >= 50 
        ? "stroke-yellow-500" 
        : "stroke-red-500";

    // Calculate stroke-dashoffset for circular progress
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - safeScore / 100);

    // Score label
    const scoreLabel = safeScore >= 90 ? "Excellent" : safeScore >= 50 ? "Average" : "Poor";

    return (
        <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-6">
                {/* Score Gauge */}
                <div className="flex items-center gap-6">
                    <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Background circle */}
                            <circle 
                                cx="40" 
                                cy="40" 
                                r={radius} 
                                fill="transparent" 
                                stroke="currentColor" 
                                strokeWidth="8" 
                                className="text-muted/20" 
                            />
                            {/* Progress circle */}
                            <circle 
                                cx="40" 
                                cy="40" 
                                r={radius} 
                                fill="transparent" 
                                stroke="currentColor" 
                                strokeWidth="8" 
                                className={cn("transition-all duration-1000 ease-out", ringColor)}
                                strokeDasharray={circumference} 
                                strokeDashoffset={offset} 
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className={cn("absolute text-xl font-bold", scoreColor)}>
                            {score ?? 'N/A'}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium text-lg leading-none">{scoreLabel}</p>
                        <p className="text-xs text-muted-foreground">Mobile Score</p>
                    </div>
                </div>

                {/* Core Web Vitals Metrics */}
                {metrics && (
                    <div className="grid gap-3">
                        <MetricRow 
                            icon={Timer} 
                            label="LCP" 
                            value={metrics.lcp} 
                            status={getMetricStatus(metrics.lcp, 'lcp')} 
                        />
                        <MetricRow 
                            icon={Zap} 
                            label="FCP" 
                            value={metrics.fcp} 
                            status={getMetricStatus(metrics.fcp, 'fcp')} 
                        />
                        <MetricRow 
                            icon={LayoutTemplate} 
                            label="CLS" 
                            value={metrics.cls} 
                            status={getMetricStatus(metrics.cls, 'cls')} 
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
