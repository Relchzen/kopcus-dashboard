"use client";

import { useRouter } from "next/navigation";
import { format, isToday, isYesterday } from "date-fns";
import { useCrmStore } from "@/hooks/use-crm-store";
import type { ContactSubmission } from "@/lib/types/crm";
import { EmptyState } from "./EmptyState";
import { Inbox } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Helper function to format date in Gmail style
function formatSubmissionDate(dateString: string): string {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  
  if (isYesterday(date)) {
    return "Yesterday";
  }
  
  // Within last 7 days
  const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    return format(date, "EEE"); // Mon, Tue, etc.
  }
  
  // This year
  if (date.getFullYear() === new Date().getFullYear()) {
    return format(date, "MMM d");
  }
  
  // Older
  return format(date, "MMM d, yyyy");
}

// Helper function to get status indicator color
function getStatusIndicator(submission: ContactSubmission): {
  color: string;
  label: string;
} | null {
  if (submission.isSpam) return null;
  
  if (submission.status === "NEW") {
    return {
      color: "bg-blue-600 dark:bg-blue-400",
      label: "New",
    };
  }
  
  if (submission.status === "REVIEWED" || submission.status === "CONTACTED") {
    return {
      color: "bg-orange-600 dark:bg-orange-400",
      label: "Pending",
    };
  }
  
  return null;
}

export function SubmissionTable() {
  const router = useRouter();
  const submissions = useCrmStore((state) => state.submissions);

  const handleRowClick = (id: string) => {
    router.push(`/crm/submissions/${id}`);
  };

  if (submissions.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No submissions yet"
        description="When customers submit the contact form, their submissions will appear here."
      />
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-2">
        {submissions.map((submission) => {
          const isUnread = submission.status === "NEW";
          const isSpam = submission.isSpam;

          return (
            <div
              key={submission.id}
              onClick={() => handleRowClick(submission.id)}
              className={cn(
                "p-4 rounded-lg border cursor-pointer transition-all",
                "hover:shadow-md hover:border-primary/50",
                isSpam && "bg-red-50 dark:bg-red-950/20 border-red-200",
                !isSpam && "bg-card"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  {/* Status Indicator */}
                  {getStatusIndicator(submission) && (
                    <div className="flex-shrink-0 mt-1.5">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          getStatusIndicator(submission)!.color
                        )}
                        title={getStatusIndicator(submission)!.label}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "truncate",
                        isUnread && !isSpam ? "font-semibold" : "font-normal"
                      )}
                    >
                      {submission.fullName}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {submission.email}
                    </div>
                    {submission.company && (
                      <div className="text-sm font-medium mt-1 truncate">
                        {submission.company}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatSubmissionDate(submission.submittedAt)}
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <div className={cn(isUnread && !isSpam ? "font-medium" : "")}>
                  <span className="text-muted-foreground">Project:</span>{" "}
                  {submission.projectType}
                </div>
                <div className="text-muted-foreground">
                  Budget: {submission.budgetRange}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block w-full rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[200px]">Sender</TableHead>
              <TableHead className="w-[150px]">Company</TableHead>
              <TableHead className="flex-1">Project</TableHead>
              <TableHead className="w-[120px] text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => {
              const isUnread = submission.status === "NEW";
              const isSpam = submission.isSpam;

              return (
                <TableRow
                  key={submission.id}
                  onClick={() => handleRowClick(submission.id)}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isSpam && "bg-red-50 dark:bg-red-950/20",
                    !isSpam && "hover:bg-muted/50"
                  )}
                >
                  {/* Status Indicator */}
                  <TableCell className="w-[50px]">
                    {getStatusIndicator(submission) && (
                      <div className="flex items-center justify-center">
                        <div
                          className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            getStatusIndicator(submission)!.color
                          )}
                          title={getStatusIndicator(submission)!.label}
                        />
                      </div>
                    )}
                  </TableCell>

                  {/* Sender */}
                  <TableCell>
                    <div
                      className={cn(
                        "truncate",
                        isUnread && !isSpam ? "font-semibold" : "font-normal"
                      )}
                    >
                      {submission.fullName}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {submission.email}
                    </div>
                  </TableCell>

                  {/* Company */}
                  <TableCell>
                    <div
                      className={cn(
                        "truncate",
                        isUnread && !isSpam ? "font-semibold" : "font-normal"
                      )}
                    >
                      {submission.company || (
                        <span className="text-muted-foreground italic">
                          No company
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Project */}
                  <TableCell>
                    <div
                      className={cn(
                        "truncate",
                        isUnread && !isSpam ? "font-semibold" : "font-normal"
                      )}
                    >
                      {submission.projectType}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {submission.budgetRange}
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-right">
                    <div
                      className={cn(
                        "text-sm whitespace-nowrap",
                        isUnread && !isSpam
                          ? "font-semibold"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatSubmissionDate(submission.submittedAt)}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
