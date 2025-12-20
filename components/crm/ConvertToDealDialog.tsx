"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCrmStore } from "@/hooks/use-crm-store";
import type { ContactSubmission } from "@/lib/types/crm";
import { ConvertToDealSchema, type ConvertToDealFormData } from "@/lib/schemas/crm";

interface ConvertToDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: ContactSubmission;
}

export function ConvertToDealDialog({
  open,
  onOpenChange,
  submission,
}: ConvertToDealDialogProps) {
  const convertSubmission = useCrmStore((state) => state.convertSubmission);

  const form = useForm<ConvertToDealFormData>({
    resolver: zodResolver(ConvertToDealSchema),
    defaultValues: {
      clientName: submission.company || submission.fullName,
      dealTitle: `${submission.projectType} Project for ${submission.company || submission.fullName}`,
      dealValue: 0,
    },
  });

  const onSubmit = (data: ConvertToDealFormData) => {
    convertSubmission(submission.id, data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Convert Submission to Deal</DialogTitle>
          <DialogDescription>
            Create a new client, contact, and deal from this submission.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Info Preview */}
            <div>
              <h4 className="font-medium text-sm mb-2">Contact Information</h4>
              <Card className="p-4 bg-muted">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {submission.fullName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {submission.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {submission.phone}
                  </div>
                </div>
              </Card>
            </div>

            {/* Client Name */}
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter client name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deal Title */}
            <FormField
              control={form.control}
              name="dealTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deal Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter deal title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget Range Hint & Deal Value */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Budget Range from Submission:</span>{" "}
                {submission.budgetRange}
              </div>
              
              <FormField
                control={form.control}
                name="dealValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Value (IDR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                        placeholder="Enter estimated deal value"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Project Description Preview */}
            <div>
              <h4 className="font-medium text-sm mb-2">Project Description</h4>
              <Card className="p-4 bg-muted">
                <p className="text-sm text-muted-foreground">{submission.description}</p>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Convert to Deal</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
