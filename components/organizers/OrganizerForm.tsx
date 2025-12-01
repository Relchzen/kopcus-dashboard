"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { User, Building2, Mic2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateOrganizerDto } from "@/lib/api/organizers";

interface OrganizerFormProps {
  onSubmit: (data: CreateOrganizerDto) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ORGANIZER_TYPES = [
  { value: "ARTIST", label: "artist", icon: Mic2 },
  { value: "COMPANY", label: "Company", icon: Building2 },
  { value: "INDIVIDUAL", label: "Individual", icon: User },
  { value: "SPONSOR", label: "Sponsor", icon: Star },
];

const organizerFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  type: z.enum(["ARTIST", "COMPANY", "INDIVIDUAL", "SPONSOR"]),
  description: z.string().optional(),
  website: z.url("Invalid URL").optional().or(z.literal("")),
  email: z.email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
});

type OrganizerFormValues = z.infer<typeof organizerFormSchema>;

export function OrganizerForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: OrganizerFormProps) {
  const form = useForm<OrganizerFormValues>({
    resolver: zodResolver(organizerFormSchema),
    defaultValues: {
      name: "",
      type: "ARTIST",
      description: "",
      website: "",
      email: "",
      phone: "",
    },
  });

  const handleSubmit = async (data: OrganizerFormValues) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter organizer name"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Type <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-2">
                  {ORGANIZER_TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      disabled={isSubmitting}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 border rounded-lg transition-all",
                        field.value === value
                          ? "border-primary bg-primary/5 text-primary"
                          : "hover:bg-accent",
                        isSubmitting && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Brief description (optional)"
                  rows={3}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Website */}
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="url"
                  placeholder="https://example.com"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="contact@example.com"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Creating..." : "Create Organizer"}
          </Button>
        </div>
      </div>
    </Form>
  );
}
