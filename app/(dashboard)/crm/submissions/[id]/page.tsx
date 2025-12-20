"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  AlertTriangle,
  ArrowRightLeft,
  Building2,
  User,
  Phone,
  Calendar,
  DollarSign,
  Clock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCrmStore } from "@/hooks/use-crm-store";
import { ConvertToDealDialog } from "@/components/crm/ConvertToDealDialog";

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const getSubmissionById = useCrmStore((state) => state.getSubmissionById);
  const markAsReviewed = useCrmStore((state) => state.markAsReviewed);
  const markAsSpam = useCrmStore((state) => state.markAsSpam);

  const submission = getSubmissionById(id);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);

  // Auto-mark as reviewed when viewing
  useEffect(() => {
    if (submission && submission.status === "NEW") {
      markAsReviewed(id);
    }
  }, [id, submission, markAsReviewed]);

  const handleMarkAsSpam = async () => {
    await markAsSpam(id);
    router.push("/crm/submissions");
  };

  if (!submission) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Submission not found</h2>
          <p className="text-muted-foreground mb-4">
            The submission you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push("/crm/submissions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inbox
          </Button>
        </div>
      </div>
    );
  }

  const emailHref = `mailto:${submission.email}?subject=Re: ${submission.projectType} Project`;
  const whatsappHref = `https://wa.me/${submission.phone.replace(/\D/g, "")}?text=Hi ${submission.fullName}, regarding your ${submission.projectType} project inquiry...`;

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/crm/submissions")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inbox
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(emailHref, "_blank")}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(whatsappHref, "_blank")}
            className="gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAsSpam}
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <AlertTriangle className="h-4 w-4" />
            Mark Spam
          </Button>

          <Button
            size="sm"
            onClick={() => setConvertDialogOpen(true)}
            disabled={submission.status === "CLOSED"}
            className="gap-2"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Convert to Deal
          </Button>
        </div>
      </div>

      {/* Spam Warning */}
      {submission.isSpam && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">This submission is marked as spam</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <p className="text-lg font-semibold">{submission.fullName}</p>
            </div>

            {submission.company && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Company
                </label>
                <p className="text-lg font-semibold">{submission.company}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email
              </label>
              <a
                href={emailHref}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {submission.email}
              </a>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Phone
              </label>
              <a
                href={whatsappHref}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {submission.phone}
              </a>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Submitted
              </label>
              <p className="text-sm">
                {format(new Date(submission.submittedAt), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="mt-1">
                <Badge
                  variant={submission.status === "NEW" ? "default" : "secondary"}
                >
                  {submission.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Project Type
              </label>
              <p className="text-lg font-semibold">{submission.projectType}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Budget Range
              </label>
              <p className="text-lg font-semibold">{submission.budgetRange}</p>
            </div>

            {submission.estimatedTimeline && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Estimated Timeline
                </label>
                <p className="text-sm">{submission.estimatedTimeline}</p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Project Description
            </label>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {submission.description}
            </p>
          </div>

          {submission.notes && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Internal Notes
                </label>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {submission.notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Convert Dialog */}
      <ConvertToDealDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        submission={submission}
      />
    </div>
  );
}
