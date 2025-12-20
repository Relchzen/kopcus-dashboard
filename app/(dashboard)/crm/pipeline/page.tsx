"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useCrmStore } from "@/hooks/use-crm-store";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { CreateDealDialog } from "@/components/crm/CreateDealDialog";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils/currency";

export default function PipelinePage() {
  const [createDealOpen, setCreateDealOpen] = useState(false);
  const getActiveDeals = useCrmStore((state) => state.getActiveDeals);
  const clients = useCrmStore((state) => state.clients);
  const loadClients = useCrmStore((state) => state.loadClients);
  const loadSubmissions = useCrmStore((state) => state.loadSubmissions);

  useEffect(() => {
    Promise.all([loadClients(), loadSubmissions()]);
  }, [loadClients, loadSubmissions]);

  const activeDeals = getActiveDeals();
  const totalValue = activeDeals.reduce((sum, deal) => sum + deal.value, 0);
  const wonDeals = clients.flatMap((c) => c.deals).filter((d) => d.stage === "WON");
  const totalDeals = clients.flatMap((c) => c.deals).filter((d) => d.stage !== "LOST");
  const conversionRate = totalDeals.length > 0
    ? ((wonDeals.length / totalDeals.length) * 100).toFixed(1)
    : "0";

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header and Stats - Constrained */}
      <div className="container mx-auto px-4 md:px-6 pt-4 md:pt-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Deal Pipeline</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Track and manage your sales pipeline
            </p>
          </div>
          <Button onClick={() => setCreateDealOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Deal
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4 md:p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Pipeline Value</div>
            <div className="text-xl md:text-2xl font-bold">{formatCurrencyCompact(totalValue)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(totalValue)}
            </div>
          </Card>
          <Card className="p-4 md:p-6">
            <div className="text-sm text-muted-foreground mb-1">Active Deals</div>
            <div className="text-xl md:text-2xl font-bold">{activeDeals.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Excluding lost deals
            </div>
          </Card>
          <Card className="p-4 md:p-6 sm:col-span-2 lg:col-span-1">
            <div className="text-sm text-muted-foreground mb-1">Conversion Rate</div>
            <div className="text-xl md:text-2xl font-bold">{conversionRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {wonDeals.length} won / {totalDeals.length} total
            </div>
          </Card>
        </div>
      </div>

      {/* Kanban Board - Full Width with Overflow */}
      <div 
        className="flex-1 px-4 md:px-6 pb-4 md:pb-6 mt-4 md:mt-6 overflow-x-scroll"
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE and Edge */
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        `}</style>
        <KanbanBoard />
      </div>

      {/* Create Deal Dialog */}
      <CreateDealDialog
        open={createDealOpen}
        onOpenChange={setCreateDealOpen}
      />
    </div>
  );
}
