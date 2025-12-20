"use client";

import { useCrmStore } from "@/hooks/use-crm-store";
import { Inbox, Mail, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

export function InboxSummary() {
  const submissions = useCrmStore((state) => state.submissions);
  const getUnreadCount = useCrmStore((state) => state.getUnreadCount);
  const getActionRequiredCount = useCrmStore((state) => state.getActionRequiredCount);

  const totalCount = submissions.filter((s) => !s.isSpam).length;
  const unreadCount = getUnreadCount();
  const actionRequiredCount = getActionRequiredCount();

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-wrap items-center gap-6 text-sm">
        {/* Total Inbox */}
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Inbox:</span>
          <span className="font-semibold">{totalCount}</span>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-border hidden sm:block" />

        {/* New (Unread) */}
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-muted-foreground">New:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {unreadCount}
          </span>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-border hidden sm:block" />

        {/* Pending Action */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <span className="text-muted-foreground">Pending Action:</span>
          <span className="font-semibold text-orange-600 dark:text-orange-400">
            {actionRequiredCount}
          </span>
        </div>
      </div>
    </Card>
  );
}
