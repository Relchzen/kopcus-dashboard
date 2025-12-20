"use client";

import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Deal, DealStage } from "@/lib/types/crm";

interface KanbanColumnProps {
  stage: DealStage;
  label: string;
  deals: Deal[];
  bgColor: string;
  children: React.ReactNode;
}

export function KanbanColumn({
  stage,
  label,
  deals,
  bgColor,
  children,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-full sm:w-[340px] md:w-[280px] lg:w-[300px] snap-center snap-always transition-all",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <Card className={cn(bgColor, "p-4 h-full flex flex-col")}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm md:text-base">{label}</h3>
          <Badge variant="secondary" className="text-xs">
            {deals.length}
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-visible pr-3 -mr-3">
          <div className="space-y-3 pb-4">
            {deals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No deals in this stage
              </p>
            ) : (
              children
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
