import { apiClient } from './client';

export const crmApi = {
    // Contact submissions -------------------------------------------------
    async getSubmissions() {
        const response = await apiClient.get<ContactSubmission[]>('/crm/submissions');
        // Backend returns double-nested structure: {success: true, data: {success: true, data: []}}
        // Extract the actual array from response.data.data
        const actualData = (response.data as { data?: ContactSubmission[] })?.data || response.data;
        return {
            success: response.success,
            data: actualData,
        };
    },

    async convertSubmission(
        id: string,
        payload: {
            clientName: string;
            dealTitle: string;
            dealValue: number;
        },
    ) {
        const response = await apiClient.post<{
            submission: ContactSubmission;
            client: ClientWithRelations;
        }>(`/crm/submissions/${id}/convert`, payload);

        return {
            success: true,
            data: response,
            message: 'Client and Deal created successfully!',
        };
    },

    async updateSubmissionStatus(
        id: string,
        status: 'NEW' | 'REVIEWED' | 'CONTACTED' | 'CLOSED',
    ) {
        const response = await apiClient.patch<ContactSubmission>(
            `/crm/submissions/${id}`,
            { status }
        );
        return {
            success: response.success,
            data: response.data,
            message: 'Submission status updated',
        };
    },

    async markSubmissionAsSpam(id: string) {
        const response = await apiClient.patch<ContactSubmission>(
            `/crm/submissions/${id}`,
            { isSpam: true, status: 'CLOSED' }
        );
        return {
            success: response.success,
            data: response.data,
            message: 'Marked as spam',
        };
    },

    // Clients -------------------------------------------------------------
    async getClients() {
        const response = await apiClient.get<ClientWithRelations[]>('/crm/clients');
        // Backend returns double-nested structure: {success: true, data: {success: true, data: []}}
        const actualData = (response.data as { data?: ClientWithRelations[] })?.data || response.data;
        return {
            success: response.success,
            data: actualData,
        };
    },

    async getClient(id: string) {
        const response = await apiClient.get<ClientWithRelations>(`/crm/clients/${id}`);
        // Backend returns double-nested structure
        const actualData = (response.data as { data?: ClientWithRelations })?.data || response.data;
        return {
            success: response.success,
            data: actualData,
        };
    },

    async createClient(name: string) {
        const response = await apiClient.post<ClientWithRelations>('/crm/clients', { name });
        return {
            success: true,
            data: response,
        };
    },

    async deleteClient(id: string) {
        const response = await apiClient.delete<{ message: string }>(`/crm/clients/${id}`);
        return {
            success: response.success,
            data: response.data,
            message: response.data?.message,
        };
    },

    // Deals ---------------------------------------------------------------
    async createDeal(payload: {
        clientId: string;
        title: string;
        description?: string;
        value: number;
        stage?: 'NEW' | 'NEGOTIATION' | 'WON' | 'LOST';
    }) {
        const response = await apiClient.post<Deal>('/crm/deals', payload);
        return {
            success: true,
            data: response,
            message: 'Deal created successfully!',
        };
    },

    async updateDeal(
        id: string,
        updates: Partial<{
            title: string;
            description?: string | null;
            value: number;
            stage: 'NEW' | 'NEGOTIATION' | 'WON' | 'LOST';
        }>,
    ) {
        const response = await apiClient.patch<Deal>(`/crm/deals/${id}`, updates);
        return {
            success: response.success,
            data: response.data,
            message: 'Deal updated successfully',
        };
    },

    async deleteDeal(id: string) {
        const response = await apiClient.delete<{ message: string }>(`/crm/deals/${id}`);
        return {
            success: response.success,
            data: response.data,
            message: response.data?.message,
        };
    },
};

// Shared response types -------------------------------------------------
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
    status: 'NEW' | 'REVIEWED' | 'CONTACTED' | 'CLOSED';
    submittedAt: string;
    isSpam: boolean;
    notes?: string | null;
}

export interface Contact {
    id: string;
    clientId: string;
    name: string;
    email: string;
    phone?: string | null;
    position?: string | null;
}

export interface Deal {
    id: string;
    clientId: string;
    title: string;
    description?: string | null;
    value: number;
    stage: 'NEW' | 'NEGOTIATION' | 'WON' | 'LOST';
    createdAt: string;
    updatedAt: string;
}

export interface ClientWithRelations {
    id: string;
    name: string;
    createdAt: string;
    contacts: Contact[];
    deals: Deal[];
}
