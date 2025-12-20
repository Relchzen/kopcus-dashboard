"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { DealCard } from "./DealCard";
import type { Deal } from "@/lib/types/crm";

interface DraggableDealCardProps {
  deal: Deal;
  clientName: string;
  onClick?: () => void;
}

export function DraggableDealCard({
  deal,
  clientName,
  onClick,
}: DraggableDealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: deal.id,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all",
        isDragging && "opacity-50 rotate-2 scale-105 shadow-2xl z-50"
      )}
    >
      <DealCard deal={deal} clientName={clientName} onClick={onClick} />
    </div>
  );
}
