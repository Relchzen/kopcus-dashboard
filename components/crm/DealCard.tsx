"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import type { Deal, DealStage } from "@/lib/types/crm";

interface DealCardProps {
  deal: Deal;
  clientName: string;
  onClick?: () => void;
}

const stageBorderColors: Record<DealStage, string> = {
  NEW: "border-l-blue-500",
  NEGOTIATION: "border-l-yellow-500",
  WON: "border-l-green-500",
  LOST: "border-l-red-500",
};

const stageTextColors: Record<DealStage, string> = {
  NEW: "text-blue-600 dark:text-blue-400",
  NEGOTIATION: "text-yellow-600 dark:text-yellow-400",
  WON: "text-green-600 dark:text-green-400",
  LOST: "text-red-600 dark:text-red-400",
};

export function DealCard({ deal, clientName, onClick }: DealCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/crm/clients/${deal.clientId}`);
    }
  };

  return (
    <Card
      className={`p-3 sm:p-4 border-l-4 ${stageBorderColors[deal.stage]} hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]`}
      onClick={handleClick}
    >
      <h4 className="font-semibold text-sm mb-1 line-clamp-2">{deal.title}</h4>
      <p className="text-xs text-muted-foreground mb-2 sm:mb-3">{clientName}</p>
      <div className={`text-base sm:text-lg font-bold ${stageTextColors[deal.stage]}`}>
        {formatCurrency(deal.value)}
      </div>
    </Card>
  );
}
