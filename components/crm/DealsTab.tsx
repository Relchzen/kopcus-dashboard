"use client";

import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { useCrmStore } from "@/hooks/use-crm-store";
import type { Deal, DealStage } from "@/lib/types/crm";
import { EmptyState } from "./EmptyState";
import { TrendingUp, Calendar } from "lucide-react";

interface DealsTabProps {
  deals: Deal[];
}

const stageColors: Record<DealStage, string> = {
  NEW: "bg-blue-500 text-blue-900 dark:text-blue-100",
  NEGOTIATION: "bg-yellow-500 text-yellow-900 dark:text-yellow-100",
  WON: "bg-green-500 text-green-900 dark:text-green-100",
  LOST: "bg-red-500 text-red-900 dark:text-red-100",
};

export function DealsTab({ deals }: DealsTabProps) {
  const openDealDetail = useCrmStore((state) => state.openDealDetail);
  if (deals.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No deals yet"
        description="Create a deal for this client to start tracking opportunities."
      />
    );
  }

  // Sort deals by created date descending
  const sortedDeals = [...deals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {sortedDeals.map((deal) => (
          <Card
            key={deal.id}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openDealDetail(deal.id)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base mb-1 truncate">{deal.title}</h4>
                  {deal.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {deal.description}
                    </p>
                  )}
                </div>
                <Badge className={`${stageColors[deal.stage]} flex-shrink-0`}>
                  {deal.stage}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(deal.createdAt), "MMM d, yyyy")}</span>
                </div>
                <div className="text-lg font-bold text-primary">
                  {formatCurrency(deal.value)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block w-full rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Title</TableHead>
              <TableHead className="min-w-[200px]">Description</TableHead>
              <TableHead className="min-w-[120px]">Value</TableHead>
              <TableHead className="min-w-[100px]">Stage</TableHead>
              <TableHead className="min-w-[120px]">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDeals.map((deal) => (
              <TableRow
                key={deal.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => openDealDetail(deal.id)}
              >
                <TableCell className="font-medium">{deal.title}</TableCell>
                <TableCell className="max-w-md">
                  {deal.description ? (
                    <span className="line-clamp-2 text-sm">{deal.description}</span>
                  ) : (
                    <span className="text-muted-foreground italic">No description</span>
                  )}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(deal.value)}
                </TableCell>
                <TableCell>
                  <Badge className={stageColors[deal.stage]}>{deal.stage}</Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(deal.createdAt), "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
