'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    crmApi,
    ClientWithRelations,
    ContactSubmission,
    Deal,
} from '@/lib/api/crm';
import { toast } from 'sonner';

interface ConvertPayload {
    clientName: string;
    dealTitle: string;
    dealValue: number;
}

interface CrmStoreState {
    submissions: ContactSubmission[];
    clients: ClientWithRelations[];
    activeSubmission: ContactSubmission | null;
    activeDealId: string | null;
    isLoading: boolean;
    isConverting: boolean;
    isMutating: boolean;
    loadSubmissions: () => Promise<void>;
    loadClients: () => Promise<void>;
    convertSubmission: (id: string, payload: ConvertPayload) => Promise<void>;
    createDeal: (payload: {
        clientId: string;
        title: string;
        description?: string;
        value: number;
        stage?: Deal['stage'];
    }) => Promise<void>;
    updateDeal: (id: string, updates: Partial<Deal>) => Promise<void>;
    updateDealStage: (dealId: string, newStage: Deal['stage']) => Promise<void>;
    deleteDeal: (id: string) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;
    markAsReviewed: (id: string) => Promise<void>;
    markAsSpam: (id: string) => Promise<void>;
    setActiveSubmission: (submission: ContactSubmission | null) => void;
    openDealDetail: (dealId: string) => void;
    closeDealDetail: () => void;

    // Selectors
    getClientById: (id: string) => ClientWithRelations | undefined;
    getDealsByStage: (stage: Deal['stage']) => Deal[];
    getActiveDeals: () => Deal[];
    getActiveDeal: () => Deal | null;
    getSubmissionById: (id: string) => ContactSubmission | undefined;
    getUnreadCount: () => number;
    getActionRequiredCount: () => number;
}

export const useCrmStore = create<CrmStoreState>()(
    devtools((set, get) => ({
        submissions: [],
        clients: [],
        activeSubmission: null,
        activeDealId: null,
        isLoading: false,
        isConverting: false,
        isMutating: false,

        async loadSubmissions() {
            set({ isLoading: true });
            try {
                const response = await crmApi.getSubmissions();


                if (response.success && response.data) {
                    // Defensive check: ensure data is always an array
                    const submissions = Array.isArray(response.data) ? response.data : [];
                    set({ submissions });
                } else {
                    // Set to empty array on failure to maintain array invariant

                    set({ submissions: [] });
                    toast.error('Failed to fetch submissions');
                }
            } catch (error: unknown) {
                console.error('loadSubmissions', error);
                // Set to empty array on error to maintain array invariant
                set({ submissions: [] });
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch submissions';
                toast.error(errorMessage);
            } finally {

                set({ isLoading: false });
            }
        },

        async loadClients() {
            set({ isLoading: true });
            try {
                const response = await crmApi.getClients();
                if (response.success && response.data) {
                    // Defensive check: ensure data is always an array and filter out null/undefined
                    const clients = Array.isArray(response.data)
                        ? response.data.filter(client => client != null)
                        : [];
                    set({ clients });
                } else {
                    // Set to empty array on failure to maintain array invariant
                    set({ clients: [] });
                    toast.error('Failed to fetch clients');
                }
            } catch (error: unknown) {
                console.error('loadClients', error);
                // Set to empty array on error to maintain array invariant
                set({ clients: [] });
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch clients';
                toast.error(errorMessage);
            } finally {
                set({ isLoading: false });
            }
        },

        async convertSubmission(id, payload) {
            set({ isConverting: true });
            try {
                const response = await crmApi.convertSubmission(id, payload);
                if (response.success && response.data) {
                    set((state) => {
                        const updatedSubmissions = state.submissions.map((submission) =>
                            submission.id === id ? response.data!.submission : submission,
                        );

                        const existingIdx = state.clients.findIndex(
                            (client) => client.id === response.data!.client.id,
                        );

                        let updatedClients: ClientWithRelations[];
                        if (existingIdx === -1) {
                            updatedClients = [...state.clients, response.data!.client];
                        } else {
                            updatedClients = state.clients.slice();
                            updatedClients[existingIdx] = response.data!.client;
                        }

                        return {
                            submissions: updatedSubmissions,
                            clients: updatedClients,
                        };
                    });

                    toast.success(response.message ?? 'Client and Deal created successfully!');
                } else {
                    toast.error('Conversion failed');
                }
            } catch (error: unknown) {
                console.error('convertSubmission', error);
                const errorMessage = error instanceof Error ? error.message : 'Conversion failed';
                toast.error(errorMessage);
            } finally {
                set({ isConverting: false });
            }
        },

        async createDeal(payload) {
            set({ isMutating: true });
            try {
                const response = await crmApi.createDeal(payload);
                if (response.success && response.data) {
                    set((state) => ({
                        clients: state.clients.map((client) =>
                            client.id === payload.clientId
                                ? { ...client, deals: [...client.deals, response.data!] }
                                : client,
                        ),
                    }));

                    toast.success(response.message ?? 'Deal created successfully!');
                } else {
                    toast.error('Failed to create deal');
                }
            } catch (error: unknown) {
                console.error('createDeal', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to create deal';
                toast.error(errorMessage);
            } finally {
                set({ isMutating: false });
            }
        },

        async updateDeal(id, updates) {
            set({ isMutating: true });
            try {
                const response = await crmApi.updateDeal(id, updates);

                if (response.success && response.data) {
                    set((state) => ({
                        clients: state.clients.map((client) => ({
                            ...client,
                            deals: client.deals.map((deal) =>
                                deal.id === id ? { ...deal, ...response.data! } : deal,
                            ),
                        })),
                    }));

                    toast.success(response.message ?? 'Deal updated successfully');
                } else {
                    toast.error('Failed to update deal');
                }
            } catch (error: unknown) {
                console.error('updateDeal', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to update deal';
                toast.error(errorMessage);
            } finally {
                set({ isMutating: false });
            }
        },

        async updateDealStage(dealId, newStage) {
            const previousClients = get().clients;

            try {
                // Optimistic update - move deal to new stage immediately
                set((state) => ({
                    clients: state.clients.map((client) => ({
                        ...client,
                        deals: client.deals.map((deal) =>
                            deal.id === dealId ? { ...deal, stage: newStage } : deal
                        ),
                    })),
                }));

                // API call
                await crmApi.updateDeal(dealId, { stage: newStage });

                toast.success('Deal moved successfully');
            } catch (error: unknown) {
                console.error('updateDealStage', error);
                // Rollback on error
                set({ clients: previousClients });
                const errorMessage = error instanceof Error ? error.message : 'Failed to move deal';
                toast.error(errorMessage);
            }
        },

        async deleteDeal(id) {
            set({ isMutating: true });
            try {
                const response = await crmApi.deleteDeal(id);
                if (response.success) {
                    set((state) => ({
                        clients: state.clients.map((client) => ({
                            ...client,
                            deals: client.deals.filter((deal) => deal.id !== id),
                        })),
                    }));

                    toast.success(response.message ?? 'Deal deleted');
                } else {
                    toast.error('Failed to delete deal');
                }
            } catch (error: unknown) {
                console.error('deleteDeal', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to delete deal';
                toast.error(errorMessage);
            } finally {
                set({ isMutating: false });
            }
        },

        async deleteClient(id) {
            set({ isMutating: true });
            try {
                const response = await crmApi.deleteClient(id);
                if (response.success) {
                    set((state) => ({
                        clients: state.clients.filter((client) => client.id !== id),
                    }));

                    toast.success(response.message ?? 'Client and related data deleted');
                } else {
                    toast.error('Failed to delete client');
                }
            } catch (error: unknown) {
                console.error('deleteClient', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to delete client';
                toast.error(errorMessage);
            } finally {
                set({ isMutating: false });
            }
        },

        async markAsReviewed(id) {
            const previousSubmissions = get().submissions;
            const previousActive = get().activeSubmission;

            try {
                const submission = get().submissions.find((s) => s.id === id);
                if (!submission) return;

                // Only update if status is NEW
                if (submission.status === 'NEW') {
                    // Optimistic update
                    set((state) => ({
                        submissions: state.submissions.map((s) =>
                            s.id === id ? { ...s, status: 'REVIEWED' as const } : s
                        ),
                        activeSubmission:
                            state.activeSubmission?.id === id
                                ? { ...state.activeSubmission, status: 'REVIEWED' as const }
                                : state.activeSubmission,
                    }));

                    // API call
                    await crmApi.updateSubmissionStatus(id, 'REVIEWED');
                }
            } catch (error: unknown) {
                console.error('markAsReviewed', error);
                // Rollback on error
                set({
                    submissions: previousSubmissions,
                    activeSubmission: previousActive,
                });
                const errorMessage = error instanceof Error ? error.message : 'Failed to mark as reviewed';
                toast.error(errorMessage);
            }
        },

        async markAsSpam(id) {
            const previousSubmissions = get().submissions;
            const previousActive = get().activeSubmission;

            try {
                // Optimistic update
                set((state) => ({
                    submissions: state.submissions.map((s) =>
                        s.id === id ? { ...s, isSpam: true, status: 'CLOSED' as const } : s
                    ),
                    activeSubmission:
                        state.activeSubmission?.id === id
                            ? { ...state.activeSubmission, isSpam: true, status: 'CLOSED' as const }
                            : state.activeSubmission,
                }));

                // API call
                await crmApi.markSubmissionAsSpam(id);

                toast.success('Marked as spam');
            } catch (error: unknown) {
                console.error('markAsSpam', error);
                // Rollback on error
                set({
                    submissions: previousSubmissions,
                    activeSubmission: previousActive,
                });
                const errorMessage = error instanceof Error ? error.message : 'Failed to mark as spam';
                toast.error(errorMessage);
            }
        },

        setActiveSubmission(submission) {
            set({ activeSubmission: submission });
        },

        openDealDetail(dealId) {
            set({ activeDealId: dealId });
        },

        closeDealDetail() {
            set({ activeDealId: null });
        },

        // Selectors
        getClientById: (id: string) => {
            return get().clients.find((client) => client.id === id);
        },

        getDealsByStage: (stage: Deal['stage']) => {
            return get()
                .clients.flatMap((client) => client.deals)
                .filter((deal) => deal.stage === stage);
        },

        getActiveDeals: () => {
            return get()
                .clients.flatMap((client) => client.deals)
                .filter((deal) => deal.stage !== 'LOST');
        },

        getActiveDeal: () => {
            const activeDealId = get().activeDealId;
            if (!activeDealId) return null;

            for (const client of get().clients) {
                const deal = client.deals.find((d) => d.id === activeDealId);
                if (deal) return deal;
            }
            return null;
        },

        getSubmissionById: (id: string) => {
            return get().submissions.find((submission) => submission.id === id);
        },

        getUnreadCount: () => {
            return get().submissions.filter((s) => s.status === 'NEW' && !s.isSpam).length;
        },

        getActionRequiredCount: () => {
            return get().submissions.filter(
                (s) =>
                    (s.status === 'NEW' || s.status === 'REVIEWED' || s.status === 'CONTACTED') &&
                    !s.isSpam
            ).length;
        },
    })),
);
