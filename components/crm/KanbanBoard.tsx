"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { useCrmStore } from "@/hooks/use-crm-store";
import { KanbanColumn } from "./KanbanColumn";
import { DraggableDealCard } from "./DraggableDealCard";
import { DealDetailSheet } from "./DealDetailSheet";
import { EmptyState } from "./EmptyState";
import { Kanban } from "lucide-react";
import type { Deal, DealStage } from "@/lib/types/crm";

const stages: { value: DealStage; label: string; bgColor: string }[] = [
  { value: "NEW", label: "New", bgColor: "bg-blue-50 dark:bg-blue-950/20" },
  { value: "NEGOTIATION", label: "Negotiation", bgColor: "bg-yellow-50 dark:bg-yellow-950/20" },
  { value: "WON", label: "Won", bgColor: "bg-green-50 dark:bg-green-950/20" },
  { value: "LOST", label: "Lost", bgColor: "bg-red-50 dark:bg-red-950/20" },
];

export function KanbanBoard() {
  const clients = useCrmStore((state) => state.clients);
  const getDealsByStage = useCrmStore((state) => state.getDealsByStage);
  const updateDealStage = useCrmStore((state) => state.updateDealStage);
  const openDealDetail = useCrmStore((state) => state.openDealDetail);

  // Setup sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Get client name for a deal
  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as DealStage;

    // Find the deal's current stage
    let currentStage: DealStage | null = null;
    for (const client of clients) {
      const deal = client.deals.find((d) => d.id === dealId);
      if (deal) {
        currentStage = deal.stage;
        break;
      }
    }

    // Only update if stage changed
    if (currentStage && currentStage !== newStage) {
      updateDealStage(dealId, newStage);
    }
  };

  // Handle deal card click to open drawer
  const handleDealClick = (deal: Deal) => {
    openDealDetail(deal.id);
  };

  // Check if there are any deals at all
  const totalDeals = clients.flatMap((c) => c.deals).length;

  if (totalDeals === 0) {
    return (
      <EmptyState
        icon={Kanban}
        title="No deals in pipeline"
        description="Create a deal to start tracking your sales pipeline."
      />
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="relative">
        {/* Horizontal scroll container with snap */}
        <div className="pb-4">
          <div className="flex gap-4 snap-x snap-mandatory">
            {stages.map((stage) => {
              const deals = getDealsByStage(stage.value);

              return (
                <KanbanColumn
                  key={stage.value}
                  stage={stage.value}
                  label={stage.label}
                  deals={deals}
                  bgColor={stage.bgColor}
                >
                  {deals.map((deal) => (
                    <DraggableDealCard
                      key={deal.id}
                      deal={deal}
                      clientName={getClientName(deal.clientId)}
                      onClick={() => handleDealClick(deal)}
                    />
                  ))}
                </KanbanColumn>
              );
            })}
          </div>
        </div>
        
        {/* Scroll indicator for mobile/tablet */}
        <div className="md:hidden flex justify-center gap-1 mt-2">
          {stages.map((stage) => (
            <div 
              key={`indicator-${stage.value}`}
              className="h-1 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Deal Detail Sheet */}
      <DealDetailSheet />
    </DndContext>
  );
}
