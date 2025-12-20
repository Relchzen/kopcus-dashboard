import { z } from "zod";

// Convert Submission to Deal Schema
export const ConvertToDealSchema = z.object({
    clientName: z.string().min(1, "Client name is required"),
    dealTitle: z.string().min(1, "Deal title is required"),
    dealValue: z.number().positive("Deal value must be a positive number"),
});

export type ConvertToDealFormData = z.infer<typeof ConvertToDealSchema>;

// Create Deal Schema
export const CreateDealSchema = z.object({
    clientId: z.string().min(1, "Client is required"),
    title: z.string().min(1, "Deal title is required"),
    description: z.string().optional(),
    value: z.number().positive("Deal value must be a positive number"),
    stage: z.enum(['NEW', 'NEGOTIATION', 'WON', 'LOST']),
});

export type CreateDealFormData = z.infer<typeof CreateDealSchema>;

// Client Form Schema
export const ClientFormSchema = z.object({
    name: z.string().min(1, "Client name is required"),
});

export type ClientFormData = z.infer<typeof ClientFormSchema>;

// Contact Form Schema
export const ContactFormSchema = z.object({
    name: z.string().min(1, "Contact name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    position: z.string().optional(),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

// Deal Update Schema
export const DealUpdateSchema = z.object({
    title: z.string().min(1, "Deal title is required").optional(),
    description: z.string().optional(),
    value: z.number().positive("Deal value must be a positive number").optional(),
    stage: z.enum(['NEW', 'NEGOTIATION', 'WON', 'LOST']).optional(),
});

export type DealUpdateFormData = z.infer<typeof DealUpdateSchema>;
