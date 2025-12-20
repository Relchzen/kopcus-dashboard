import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="h-9 w-64 bg-muted rounded-lg animate-pulse" />
            
            {/* Row 1: Summary Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                                <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Row 2: Main Chart */}
            <Card className="col-span-4">
                <CardHeader>
                    <div className="h-6 w-40 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[350px] bg-muted rounded-lg animate-pulse" />
                </CardContent>
            </Card>
        </div>
    );
}
