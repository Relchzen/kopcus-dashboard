"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useCrmStore } from "@/hooks/use-crm-store";

import { formatDistanceToNow } from "date-fns";

const dealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  value: z.number().min(0, "Value must be positive"),
  stage: z.enum(["NEW", "NEGOTIATION", "WON", "LOST"]),
});

type DealFormData = z.infer<typeof dealSchema>;

export function DealDetailSheet() {
  const router = useRouter();
  const activeDealId = useCrmStore((state) => state.activeDealId);
  const getActiveDeal = useCrmStore((state) => state.getActiveDeal);
  const closeDealDetail = useCrmStore((state) => state.closeDealDetail);
  const updateDeal = useCrmStore((state) => state.updateDeal);
  const deleteDeal = useCrmStore((state) => state.deleteDeal);
  const clients = useCrmStore((state) => state.clients);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deal = getActiveDeal();
  const open = activeDealId !== null;

  // Find client name
  const clientName = deal
    ? clients.find((c) => c.id === deal.clientId)?.name || "Unknown Client"
    : "";

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: "",
      description: "",
      value: 0,
      stage: "NEW",
    },
  });

  // Update form when deal changes
  useEffect(() => {
    if (deal) {
      form.reset({
        title: deal.title,
        description: deal.description || "",
        value: deal.value,
        stage: deal.stage,
      });
    }
  }, [deal, form]);

  const onSubmit = async (data: DealFormData) => {
    if (!deal) return;

    setIsSubmitting(true);
    try {
      await updateDeal(deal.id, data);
      closeDealDetail();
    } catch (error) {
      console.error("Failed to update deal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deal) return;
    
    if (!confirm("Are you sure you want to delete this deal? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDeal(deal.id);
      closeDealDetail();
    } catch (error) {
      console.error("Failed to delete deal:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    closeDealDetail();
  };

  const handleClientClick = () => {
    if (deal) {
      router.push(`/crm/clients/${deal.clientId}`);
      closeDealDetail();
    }
  };

  if (!deal) return null;

  return (
    <Sheet open={open} onOpenChange={(open) => !open && closeDealDetail()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Deal Details</SheetTitle>
          <button
            onClick={handleClientClick}
            className="text-sm text-primary hover:underline text-left"
          >
            {clientName}
          </button>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deal Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter deal title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter deal description (optional)"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Value */}
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deal Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stage */}
            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                      <SelectItem value="WON">Won</SelectItem>
                      <SelectItem value="LOST">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Metadata */}
            <div className="text-sm text-muted-foreground">
              Created {formatDistanceToNow(new Date(deal.createdAt), { addSuffix: true })}
            </div>

            <SheetFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete Deal"}
              </Button>
              <div className="flex gap-2 flex-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting || isDeleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isDeleting} className="flex-1">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
