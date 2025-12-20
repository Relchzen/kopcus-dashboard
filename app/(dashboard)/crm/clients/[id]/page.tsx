"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useCrmStore } from "@/hooks/use-crm-store";
import { ClientHeader } from "@/components/crm/ClientHeader";
import { ContactsTab } from "@/components/crm/ContactsTab";
import { DealsTab } from "@/components/crm/DealsTab";
import { CreateDealDialog } from "@/components/crm/CreateDealDialog";
import { DealDetailSheet } from "@/components/crm/DealDetailSheet";

interface ClientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = use(params);
  const client = useCrmStore((state) => state.getClientById(id));
  const [createDealOpen, setCreateDealOpen] = useState(false);

  if (!client) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Client Header */}
      <ClientHeader client={client} />

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={() => setCreateDealOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Create Deal
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contacts">
            Contacts ({client.contacts.length})
          </TabsTrigger>
          <TabsTrigger value="deals">
            Deals ({client.deals.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="contacts">
          <ContactsTab contacts={client.contacts} />
        </TabsContent>
        <TabsContent value="deals">
          <DealsTab deals={client.deals} />
        </TabsContent>
      </Tabs>

      {/* Create Deal Dialog */}
      <CreateDealDialog
        open={createDealOpen}
        onOpenChange={setCreateDealOpen}
        defaultClientId={client.id}
      />

      {/* Deal Detail Sheet */}
      <DealDetailSheet />
    </div>
  );
}
