"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import type { Client } from "@/lib/types/crm";

interface ClientHeaderProps {
  client: Client;
}

export function ClientHeader({ client }: ClientHeaderProps) {
  const totalDealsValue = client.deals
    .filter((deal) => deal.stage !== "LOST")
    .reduce((sum, deal) => sum + deal.value, 0);

  const activeDealsCount = client.deals.filter(
    (deal) => deal.stage !== "LOST" && deal.stage !== "WON"
  ).length;

  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{client.name}</h1>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">{client.contacts.length}</span> contact{client.contacts.length !== 1 ? "s" : ""}
            </div>
            <div>
              <span className="font-medium">{client.deals.length}</span> total deal{client.deals.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="text-sm text-muted-foreground">Total Deals Value</div>
          <div className="text-xl md:text-2xl font-bold text-primary">
            {formatCurrency(totalDealsValue)}
          </div>
          <Badge variant="secondary" className="mt-1">
            {activeDealsCount} Active Deal{activeDealsCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
