// CRM Type Definitions
export type SubmissionStatus = 'NEW' | 'REVIEWED' | 'CONTACTED' | 'CLOSED';
export type DealStage = 'NEW' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface ContactSubmission {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    company?: string | null;
    projectType: string;
    estimatedTimeline?: string | null;
    budgetRange: string;
    description: string;
    status: SubmissionStatus;
    submittedAt: string; // ISO string
    isSpam: boolean;
    notes?: string | null;
}

export interface Contact {
    id: string;
    clientId: string;
    name: string;
    email: string;
    phone: string | null;
    position: string | null;
}

export interface Deal {
    id: string;
    clientId: string;
    title: string;
    description?: string | null;
    value: number;
    stage: DealStage;
    createdAt: string; // ISO string
}

export interface Client {
    id: string;
    name: string;
    contacts: Contact[];
    deals: Deal[];
}

// Form payloads
export interface ConvertToDealPayload {
    clientName: string;
    dealTitle: string;
    dealValue: number;
}

export interface CreateDealPayload {
    clientId: string;
    title: string;
    description?: string;
    value: number;
    stage: DealStage;
}
