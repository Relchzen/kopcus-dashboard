# CRM Backend Implementation Instructions

You are tasked with implementing a backend API for a CRM (Customer Relationship Management) system. The **frontend is already complete** and currently uses mock data. Your job is to create the backend API endpoints and integrate them with the existing frontend.

## Project Context

**Tech Stack:**
- **Frontend Framework**: Next.js 16 App Router with API routes (`app/api`)
- **Database**: Prisma ORM (PostgreSQL/MySQL - check existing setup)
- **Authentication**: NextAuth.js (already configured)
- **TypeScript**: Strict mode enabled

**Frontend State Management:**
- Uses Zustand store at `hooks/use-crm-store.ts`
- Currently has mock data that needs to be replaced with API calls

## Your Tasks

### Task 1: Create Database Schema

Create Prisma models in `prisma/schema.prisma`:

```prisma
model ContactSubmission {
  id                String   @id @default(cuid())
  fullName          String
  email             String
  phone             String
  company           String?
  projectType       String
  estimatedTimeline String?
  budgetRange       String
  description       String   @db.Text
  status            SubmissionStatus @default(NEW)
  submittedAt       DateTime @default(now())
  isSpam            Boolean  @default(false)
  notes             String?  @db.Text
}

enum SubmissionStatus {
  NEW
  REVIEWED
  CONTACTED
  CLOSED
}

model Client {
  id       String    @id @default(cuid())
  name     String    @unique
  contacts Contact[]
  deals    Deal[]
  createdAt DateTime @default(now())
}

model Contact {
  id       String  @id @default(cuid())
  clientId String
  client   Client  @relation(fields: [clientId], references: [id], onDelete: Cascade)
  name     String
  email    String
  phone    String?
  position String?
  
  @@index([clientId])
}

model Deal {
  id          String    @id @default(cuid())
  clientId    String
  client      Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  title       String
  description String?   @db.Text
  value       Int       // Store as integer (IDR)
  stage       DealStage @default(NEW)
  createdAt   DateTime  @default(now())
  
  @@index([clientId])
  @@index([stage])
}

enum DealStage {
  NEW
  NEGOTIATION
  WON
  LOST
}
```

**Commands to run:**
```bash
npx prisma migrate dev --name add_crm_tables
npx prisma generate
```

---

### Task 2: Create API Routes

Create these files in `app/api/crm/`:

#### 1. `app/api/crm/submissions/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma'; // adjust path if needed

// GET /api/crm/submissions
export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { submittedAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: submissions });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
```

#### 2. `app/api/crm/submissions/[id]/convert/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const body = await req.json();
  const { clientName, dealTitle, dealValue } = body;

  try {
    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get submission
      const submission = await tx.contactSubmission.findUnique({
        where: { id }
      });

      if (!submission) {
        throw new Error('Submission not found');
      }

      // 2. Update submission status
      const updatedSubmission = await tx.contactSubmission.update({
        where: { id },
        data: { status: 'CLOSED' }
      });

      // 3. Find or create client
      let client = await tx.client.findUnique({
        where: { name: clientName }
      });

      if (!client) {
        client = await tx.client.create({
          data: {
            name: clientName,
            contacts: {
              create: {
                name: submission.fullName,
                email: submission.email,
                phone: submission.phone,
                position: null
              }
            },
            deals: {
              create: {
                title: dealTitle,
                description: submission.description,
                value: dealValue,
                stage: 'NEW'
              }
            }
          },
          include: {
            contacts: true,
            deals: true
          }
        });
      } else {
        // Add contact and deal to existing client
        await tx.contact.create({
          data: {
            clientId: client.id,
            name: submission.fullName,
            email: submission.email,
            phone: submission.phone
          }
        });

        await tx.deal.create({
          data: {
            clientId: client.id,
            title: dealTitle,
            description: submission.description,
            value: dealValue,
            stage: 'NEW'
          }
        });

        // Re-fetch client with relations
        client = await tx.client.findUnique({
          where: { id: client.id },
          include: {
            contacts: true,
            deals: true
          }
        });
      }

      return {
        submission: updatedSubmission,
        client
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Client and Deal created successfully!'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Conversion failed' },
      { status: 500 }
    );
  }
}
```

#### 3. `app/api/crm/clients/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// GET /api/crm/clients
export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const clients = await prisma.client.findMany({
      include: {
        contacts: true,
        deals: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: clients });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch clients' }, { status: 500 });
  }
}

// POST /api/crm/clients
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name } = body;

  try {
    const client = await prisma.client.create({
      data: { name },
      include: {
        contacts: true,
        deals: true
      }
    });

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create client' }, { status: 500 });
  }
}
```

#### 4. `app/api/crm/clients/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        contacts: true,
        deals: true
      }
    });

    if (!client) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch client' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    await prisma.client.delete({
      where: { id }
      // Cascade delete will handle contacts and deals
    });

    return NextResponse.json({
      success: true,
      message: 'Client and related data deleted'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete client' }, { status: 500 });
  }
}
```

#### 5. `app/api/crm/deals/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// POST /api/crm/deals
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, title, description, value, stage } = body;

  try {
    const deal = await prisma.deal.create({
      data: {
        clientId,
        title,
        description,
        value,
        stage
      }
    });

    return NextResponse.json({
      success: true,
      data: deal,
      message: 'Deal created successfully!'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create deal' }, { status: 500 });
  }
}
```

#### 6. `app/api/crm/deals/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const body = await req.json();

  try {
    const deal = await prisma.deal.update({
      where: { id },
      data: body
    });

    return NextResponse.json({
      success: true,
      data: deal,
      message: 'Deal updated successfully'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update deal' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    await prisma.deal.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Deal deleted'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete deal' }, { status: 500 });
  }
}
```

---

### Task 3: Create API Service Layer

Create `lib/api/crm.ts`:

```typescript
// Frontend API client for calling backend endpoints

const API_BASE = '/api/crm';

export const crmApi = {
  // Submissions
  getSubmissions: async () => {
    const res = await fetch(`${API_BASE}/submissions`);
    return res.json();
  },

  convertSubmission: async (id: string, payload: {
    clientName: string;
    dealTitle: string;
    dealValue: number;
  }) => {
    const res = await fetch(`${API_BASE}/submissions/${id}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Clients
  getClients: async () => {
    const res = await fetch(`${API_BASE}/clients`);
    return res.json();
  },

  getClient: async (id: string) => {
    const res = await fetch(`${API_BASE}/clients/${id}`);
    return res.json();
  },

  createClient: async (name: string) => {
    const res = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return res.json();
  },

  deleteClient: async (id: string) => {
    const res = await fetch(`${API_BASE}/clients/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Deals
  createDeal: async (payload: {
    clientId: string;
    title: string;
    description?: string;
    value: number;
    stage: 'NEW' | 'NEGOTIATION' | 'WON' | 'LOST';
  }) => {
    const res = await fetch(`${API_BASE}/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  updateDeal: async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/deals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  deleteDeal: async (id: string) => {
    const res = await fetch(`${API_BASE}/deals/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};
```

---

### Task 4: Update Zustand Store to Use API

Update `hooks/use-crm-store.ts` - replace the actions with API calls:

```typescript
// Example: Replace convertSubmission action
convertSubmission: async (submissionId, payload) => {
  try {
    const response = await crmApi.convertSubmission(submissionId, payload);
    
    if (response.success) {
      // Update local state with server response
      set((state) => ({
        submissions: state.submissions.map(s =>
          s.id === submissionId ? response.data.submission : s
        ),
        clients: state.clients.some(c => c.id === response.data.client.id)
          ? state.clients.map(c => c.id === response.data.client.id ? response.data.client : c)
          : [...state.clients, response.data.client]
      }));
      
      toast.success(response.message);
    } else {
      toast.error(response.error);
    }
  } catch (error) {
    toast.error('Failed to convert submission');
  }
}
```

**Do this for all actions:**
- `convertSubmission`
- `createDeal`
- `deleteClient`
- `deleteDeal`
- `deleteSubmission`

Also add initial data fetching:
```typescript
// Add to the store
interface CrmStoreState {
  isLoading: boolean;
  loadSubmissions: () => Promise<void>;
  loadClients: () => Promise<void>;
}

// Implementation
loadSubmissions: async () => {
  set({ isLoading: true });
  try {
    const response = await crmApi.getSubmissions();
    if (response.success) {
      set({ submissions: response.data });
    }
  } finally {
    set({ isLoading: false });
  }
}
```

---

### Task 5: Add Initial Data Loading

Update pages to fetch data on mount:

In `app/(dashboard)/crm/submissions/page.tsx`:
```typescript
'use client';

import { useEffect } from 'react';
import { useCrmStore } from '@/hooks/use-crm-store';

export default function SubmissionsPage() {
  const loadSubmissions = useCrmStore((state) => state.loadSubmissions);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // ... rest of component
}
```

Do similar for clients and pipeline pages.

---

## Testing Checklist

After implementation, test these flows:

1. **Submission Conversion**:
   - Navigate to `/crm/submissions`
   - Convert a submission to a deal
   - Verify it appears in `/crm/clients` and `/crm/pipeline`
   - Check database to confirm data persisted

2. **Manual Deal Creation**:
   - Go to `/crm/pipeline`
   - Click "Create Deal"
   - Select client and create deal
   - Verify appears in kanban board

3. **Client Deletion**:
   - Delete a client from `/crm/clients`
   - Verify contacts and deals are cascade deleted
   - Check database

4. **Cross-Page Persistence**:
   - Create deal in one page
   - Navigate to another page
   - Refresh browser
   - Data should persist (from database)

---

## Important Notes

1. **Prisma Client Path**: Adjust `@/lib/prisma` import path to match your project structure
2. **Authentication**: Uses existing NextAuth setup - verify session checks work
3. **Error Handling**: All endpoints have basic error handling - enhance as needed
4. **Validation**: Consider adding Zod validation on backend using schemas from `lib/schemas/crm.ts`
5. **Environment**: Ensure `.env` has correct DATABASE_URL

---

## Success Criteria

✅ All 10 API endpoints working  
✅ Database schema created and migrated  
✅ Frontend successfully calls backend APIs  
✅ Data persists across page refreshes  
✅ Toast notifications show success/error messages  
✅ No console errors in frontend  

Once complete, the CRM will be fully functional with real database persistence!
