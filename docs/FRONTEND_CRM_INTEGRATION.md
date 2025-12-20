# CRM Frontend Integration Guide

The backend CRM endpoints are now available from the NestJS service. Use this guide to connect the existing Next.js 16 frontend to those endpoints, replace mock data, and ensure state stays in sync with the database.

> File paths assume the frontend repository mirrors the original brief (App Router, Zustand store in `hooks/use-crm-store.ts`, and dashboard pages in `app/(dashboard)/crm/*`). Adjust the paths if your project structure differs.

---

## 1. Create the CRM API Client

**File:** `lib/api/crm.ts`

```ts
const API_BASE = '/api/crm';

type ApiResponse<T> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}>;

export const crmApi = {
  // Contact submissions -------------------------------------------------
  getSubmissions(): ApiResponse<ContactSubmission[]> {
    return fetch(`${API_BASE}/submissions`, {
      credentials: 'include',
    }).then((res) => res.json());
  },

  convertSubmission(
    id: string,
    payload: {
      clientName: string;
      dealTitle: string;
      dealValue: number;
    },
  ): ApiResponse<{
    submission: ContactSubmission;
    client: ClientWithRelations;
  }> {
    return fetch(`${API_BASE}/submissions/${id}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    }).then((res) => res.json());
  },

  // Clients -------------------------------------------------------------
  getClients(): ApiResponse<ClientWithRelations[]> {
    return fetch(`${API_BASE}/clients`, {
      credentials: 'include',
    }).then((res) => res.json());
  },

  getClient(id: string): ApiResponse<ClientWithRelations> {
    return fetch(`${API_BASE}/clients/${id}`, {
      credentials: 'include',
    }).then((res) => res.json());
  },

  createClient(name: string): ApiResponse<ClientWithRelations> {
    return fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name }),
    }).then((res) => res.json());
  },

  deleteClient(id: string): ApiResponse<{ message: string }> {
    return fetch(`${API_BASE}/clients/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then((res) => res.json());
  },

  // Deals ---------------------------------------------------------------
  createDeal(payload: {
    clientId: string;
    title: string;
    description?: string;
    value: number;
    stage?: 'NEW' | 'NEGOTIATION' | 'WON' | 'LOST';
  }): ApiResponse<Deal> {
    return fetch(`${API_BASE}/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    }).then((res) => res.json());
  },

  updateDeal(
    id: string,
    updates: Partial<{
      title: string;
      description?: string;
      value: number;
      stage: 'NEW' | 'NEGOTIATION' | 'WON' | 'LOST';
    }>,
  ): ApiResponse<Deal> {
    return fetch(`${API_BASE}/deals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    }).then((res) => res.json());
  },

  deleteDeal(id: string): ApiResponse<{ message: string }> {
    return fetch(`${API_BASE}/deals/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then((res) => res.json());
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
```

---

## 2. Update the Zustand Store

Replace the mock-data store with API-driven logic. The example below assumes `react-hot-toast` for notifications; swap for your project’s toast utility if needed.

**File:** `hooks/use-crm-store.ts`

```ts
'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  crmApi,
  ClientWithRelations,
  ContactSubmission,
  Deal,
} from '@/lib/api/crm';
import { toast } from 'react-hot-toast';

interface ConvertPayload {
  clientName: string;
  dealTitle: string;
  dealValue: number;
}

interface CrmStoreState {
  submissions: ContactSubmission[];
  clients: ClientWithRelations[];
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
  deleteDeal: (id: string) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

export const useCrmStore = create<CrmStoreState>()(
  devtools((set, get) => ({
    submissions: [],
    clients: [],
    isLoading: false,
    isConverting: false,
    isMutating: false,

    async loadSubmissions() {
      set({ isLoading: true });
      try {
        const response = await crmApi.getSubmissions();
        if (response.success && response.data) {
          set({ submissions: response.data });
        } else {
          toast.error(response.error ?? 'Failed to fetch submissions');
        }
      } catch (error) {
        console.error('loadSubmissions', error);
        toast.error('Failed to fetch submissions');
      } finally {
        set({ isLoading: false });
      }
    },

    async loadClients() {
      set({ isLoading: true });
      try {
        const response = await crmApi.getClients();
        if (response.success && response.data) {
          set({ clients: response.data });
        } else {
          toast.error(response.error ?? 'Failed to fetch clients');
        }
      } catch (error) {
        console.error('loadClients', error);
        toast.error('Failed to fetch clients');
      } finally {
        set({ isLoading: false });
      }
    },

    async convertSubmission(id, payload) {
      set({ isConverting: true });
      try {
        const response = await crmApi.convertSubmission(id, payload);
        if (!response.success || !response.data) {
          toast.error(response.error ?? 'Conversion failed');
          return;
        }

        set((state) => {
          const updatedSubmissions = state.submissions.map((submission) =>
            submission.id === id ? response.data.submission : submission,
          );

          const existingIdx = state.clients.findIndex(
            (client) => client.id === response.data.client.id,
          );

          let updatedClients: ClientWithRelations[];
          if (existingIdx === -1) {
            updatedClients = [...state.clients, response.data.client];
          } else {
            updatedClients = state.clients.slice();
            updatedClients[existingIdx] = response.data.client;
          }

          return {
            submissions: updatedSubmissions,
            clients: updatedClients,
          };
        });

        toast.success(response.message ?? 'Client and deal created');
      } catch (error) {
        console.error('convertSubmission', error);
        toast.error('Conversion failed');
      } finally {
        set({ isConverting: false });
      }
    },

    async createDeal(payload) {
      set({ isMutating: true });
      try {
        const response = await crmApi.createDeal(payload);
        if (!response.success || !response.data) {
          toast.error(response.error ?? 'Failed to create deal');
          return;
        }

        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === payload.clientId
              ? { ...client, deals: [...client.deals, response.data] }
              : client,
          ),
        }));

        toast.success(response.message ?? 'Deal created successfully');
      } catch (error) {
        console.error('createDeal', error);
        toast.error('Failed to create deal');
      } finally {
        set({ isMutating: false });
      }
    },

    async updateDeal(id, updates) {
      set({ isMutating: true });
      try {
        const response = await crmApi.updateDeal(id, updates);
        if (!response.success || !response.data) {
          toast.error(response.error ?? 'Failed to update deal');
          return;
        }

        set((state) => ({
          clients: state.clients.map((client) => ({
            ...client,
            deals: client.deals.map((deal) =>
              deal.id === id ? { ...deal, ...response.data } : deal,
            ),
          })),
        }));

        toast.success(response.message ?? 'Deal updated successfully');
      } catch (error) {
        console.error('updateDeal', error);
        toast.error('Failed to update deal');
      } finally {
        set({ isMutating: false });
      }
    },

    async deleteDeal(id) {
      set({ isMutating: true });
      try {
        const response = await crmApi.deleteDeal(id);
        if (!response.success) {
          toast.error(response.error ?? 'Failed to delete deal');
          return;
        }

        set((state) => ({
          clients: state.clients.map((client) => ({
            ...client,
            deals: client.deals.filter((deal) => deal.id !== id),
          })),
        }));

        toast.success(response.message ?? 'Deal deleted');
      } catch (error) {
        console.error('deleteDeal', error);
        toast.error('Failed to delete deal');
      } finally {
        set({ isMutating: false });
      }
    },

    async deleteClient(id) {
      set({ isMutating: true });
      try {
        const response = await crmApi.deleteClient(id);
        if (!response.success) {
          toast.error(response.error ?? 'Failed to delete client');
          return;
        }

        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
        }));

        toast.success(response.message ?? 'Client deleted');
      } catch (error) {
        console.error('deleteClient', error);
        toast.error('Failed to delete client');
      } finally {
        set({ isMutating: false });
      }
    },
  })),
);
```

---

## 3. Trigger Data Loads in Dashboard Pages

Each CRM page should request data on mount so the store stays up to date. Only the relevant parts of the components are shown below; keep the existing JSX/markup.

### `app/(dashboard)/crm/submissions/page.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { useCrmStore } from '@/hooks/use-crm-store';

export default function SubmissionsPage() {
  const loadSubmissions = useCrmStore((state) => state.loadSubmissions);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // ... rest of the component
}
```

### `app/(dashboard)/crm/clients/page.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { useCrmStore } from '@/hooks/use-crm-store';

export default function ClientsPage() {
  const loadClients = useCrmStore((state) => state.loadClients);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // ... rest of the component
}
```

### `app/(dashboard)/crm/pipeline/page.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { useCrmStore } from '@/hooks/use-crm-store';

export default function PipelinePage() {
  const loadClients = useCrmStore((state) => state.loadClients);
  const loadSubmissions = useCrmStore((state) => state.loadSubmissions);

  useEffect(() => {
    Promise.all([loadClients(), loadSubmissions()]);
  }, [loadClients, loadSubmissions]);

  // ... rest of the component
}
```

---

## 4. Wire Up UI Actions

Update existing component callbacks to use the new store functions. Examples:

- When submitting the “Convert submission” form, call `convertSubmission(id, payload)` from the store.
- New deal modal/flyout should call `createDeal(payload)` and optionally refresh the board via `loadClients()`.
- Deal stage drag/drop updates should call `updateDeal(id, { stage })`.
- Client deletion actions should call `deleteClient(id)`.
- Any manual refresh buttons should reuse `loadSubmissions()` or `loadClients()` instead of local mocks.

Ensure optimistic UI updates still behave as expected; the store methods already patch state locally on success.

---

## 5. Testing Checklist

1. **Authentication** — verify you stay signed in when hitting `/api/crm/*`; unauthenticated requests should receive 401.
2. **Submission conversion** — converting a submission closes it, creates/updates the client, and persists the new deal.
3. **Manual deal creation** — deals created from the pipeline appear immediately in the kanban view and after a page refresh.
4. **Client deletion** — deleting a client removes associated contacts/deals in the UI and database.
5. **Cross-page sync** — perform an action on one page, navigate elsewhere, and confirm data remains consistent after reload.
6. **Error handling** — temporarily disable the backend or mock failures to ensure toast errors surface correctly.

Following these steps will replace the mock data layer with fully functional API integrations backed by the NestJS CRM service.
