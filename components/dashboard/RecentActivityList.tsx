import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { BusinessActivityItem } from "@/types/analytics";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityListProps {
    data: BusinessActivityItem[];
}

export function RecentActivityList({ data }: RecentActivityListProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                No recent activity
            </div>
        );
    }

    return (
        <ScrollArea className="h-[300px]">
            <div className="space-y-4 p-4">
                {data.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 text-sm">
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs">
                                {item.fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1 min-w-0 flex-1">
                            <p className="font-medium leading-none">
                                {item.fullName}{" "}
                                <span className="text-muted-foreground font-normal">
                                    submitted a request.
                                </span>
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {item.projectType} • {item.company || "Personal"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
