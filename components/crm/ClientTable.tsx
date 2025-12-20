"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useCrmStore } from "@/hooks/use-crm-store";
import { formatCurrency } from "@/lib/utils/currency";
import { EmptyState } from "./EmptyState";
import { Building2 } from "lucide-react";

export function ClientTable() {
  const router = useRouter();
  const clients = useCrmStore((state) => state.clients);
  const deleteClient = useCrmStore((state) => state.deleteClient);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const handleDelete = () => {
    if (selectedClientId) {
      deleteClient(selectedClientId);
      setDeleteDialogOpen(false);
      setSelectedClientId(null);
    }
  };

  const confirmDelete = (clientId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedClientId(clientId);
    setDeleteDialogOpen(true);
  };

  const getTotalDealsValue = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return 0;
    return client.deals
      .filter((deal) => deal.stage !== "LOST")
      .reduce((sum, deal) => sum + deal.value, 0);
  };

  const getActiveDealsCount = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return 0;
    return client.deals.filter((deal) => deal.stage !== "LOST" && deal.stage !== "WON").length;
  };

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No clients yet"
        description="Convert a submission to get started or add a client manually."
      />
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {clients.filter(client => client != null).map((client) => (
          <div
            key={client.id}
            className="p-4 sm:p-5 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => router.push(`/crm/clients/${client.id}`)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{client.name}</h3>
                <div className="text-sm text-muted-foreground mt-1">
                  {client.contacts.length} contact{client.contacts.length !== 1 ? "s" : ""}
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-8 sm:w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/crm/clients/${client.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Deal
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e: React.MouseEvent) => confirmDelete(client.id, e)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(getTotalDealsValue(client.id))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Deals</span>
                <Badge variant="secondary">{getActiveDealsCount(client.id)}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block w-full rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Client Name</TableHead>
              <TableHead className="min-w-[150px]">Total Deals Value</TableHead>
              <TableHead className="min-w-[120px]"># of Active Deals</TableHead>
              <TableHead className="min-w-[120px]"># of Contacts</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.filter(client => client != null).map((client) => (
              <TableRow
                key={client.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/crm/clients/${client.id}`)}
              >
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{formatCurrency(getTotalDealsValue(client.id))}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{getActiveDealsCount(client.id)}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{client.contacts.length}</Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/crm/clients/${client.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Deal
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e: React.MouseEvent) => confirmDelete(client.id, e)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the client and all related contacts and deals.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
