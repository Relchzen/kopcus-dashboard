"use client";

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
import type { Contact } from "@/lib/types/crm";
import { EmptyState } from "./EmptyState";
import { Users, Mail, Phone, Briefcase } from "lucide-react";

interface ContactsTabProps {
  contacts: Contact[];
}

export function ContactsTab({ contacts }: ContactsTabProps) {
  if (contacts.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No contacts yet"
        description="Contacts will appear here when you convert submissions or add them manually."
      />
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {contacts.map((contact) => (
          <Card key={contact.id} className="p-4">
            <div className="space-y-3">
              <div>
                <div className="font-semibold text-base">{contact.name}</div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="break-all">{contact.email}</span>
                </div>
                
                {contact.phone ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{contact.phone}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground/50 italic">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>No phone</span>
                  </div>
                )}
                
                {contact.position ? (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 flex-shrink-0" />
                    <Badge variant="secondary" className="text-xs">{contact.position}</Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground/50 italic">
                    <Briefcase className="h-4 w-4 flex-shrink-0" />
                    <span>No position</span>
                  </div>
                )}
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
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead className="min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[130px]">Phone</TableHead>
              <TableHead className="min-w-[130px]">Position</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>
                  {contact.phone || (
                    <span className="text-muted-foreground italic">No phone</span>
                  )}
                </TableCell>
                <TableCell>
                  {contact.position || (
                    <span className="text-muted-foreground italic">No position</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
