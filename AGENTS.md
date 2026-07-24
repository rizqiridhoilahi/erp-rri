# Agent Guidelines for ERP-RRI Repository

## Essential Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint (flat config, Next.js presets)
- `npm run test` — Vitest single run
- `npm run test:watch` — Vitest watch mode
- **Never run `lint` and `build` in parallel** — sequential only (lint first, then build) to avoid VPS RAM/CPU crash
- Database migrations: `npx drizzle-kit generate` (schema at `src/lib/db/schema/index.ts`, output to `drizzle/`)
- OpenAPI docs: `npx next-openapi-gen generate`

## Deployment Rules
- **Never run `vercel deploy` without explicit user confirmation**
- Verify with `npm run lint` + `npm run build` only — do not deploy

## Project Structure
All source lives under `src/`:
```
src/app/          — Next.js App Router (pages + API routes)
src/components/   — React components (shadcn/ui patterns)
src/hooks/        — Custom React hooks
src/lib/          — Shared libraries
  api/            — auth.ts, client.ts (apiFetch), errors.ts, supabase-server.ts, role-guard.ts
  db/schema/      — Drizzle schema (~90 tables)
  utils/          — Utility functions (document-number, etc.)
src/types/        — TypeScript definitions
src/test/         — Test setup and utilities
```

## Key Conventions

### API Routes
- All under `/api/v1/{module}/route.ts`
- Every route calls `verifyAuth(request)` — returns `auth.error` on failure
- DB access via `supabaseAdmin` (service role key) from `@/lib/api/supabase-server`
- Request validation via Zod schemas
- **Response format is mandatory**: all handlers must wrap in `{ data: ... }` — client uses `apiFetch<T>()` which expects this shape

### Document Numbering
- Format: `RRI-{KODE}-{YY}-{MM}-{NNNN}`
- Global single counter shared by all documents via `document_counter` table + `increment_document_counter()` PG function
- **Only 2 parent entry points** call `generateGlobalDocumentNumber(kodeDokumen)`: RFQC and DI
- Child documents (Quotation, Customer PO, Sales Order, DO, Invoice, Kwitansi, etc.) use `formatChildNumber(parentNumber, kodeDokumen)` — copies parent's number, changes prefix
- Import from `@/lib/utils/document-number`

### PDF Route Handlers
- **Content-Length header is mandatory** for PDF blob responses — without it, Chrome hangs loading forever
- Pattern at `src/app/api/v1/{modul}/[id]/pdf/route.ts`:
  ```typescript
  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(blob.size),
      'Content-Disposition': `inline; filename="..."`,
    },
  })
  ```

### `all_documents` View
- Virtual entries (API-generated PDFs) use ID prefix `pdf-{modul}-{id}` and `fileurl` pointing to API endpoint
- To add a new virtual document type: add `UNION ALL` to the view migration

### Storage (Cloudflare R2)
- Bucket: `erp-documents` — public at `https://files.erp.pt-rri.com/`
- Standard path: `dokumen/{modul}/{recordId}/{file.name}` (no timestamp prefix)
- Email attachments: separate bucket `email-attachments`, path `email-attachments/{emailId}/{uuid}-{filename}`

### Hybrid Data Pattern
- Server components (list pages) → direct Supabase queries
- Client components (forms) → API routes via `apiFetch()`

## System Dependencies
- **poppler-utils** required for AI OCR (PDF-to-JPEG): `sudo apt-get install -y poppler-utils`

## Workflow
After completing changes, update:
1. `PRD.md` — relevant sections
2. `ROADMAP.md` — mark completed items `[x]`, add new items if scope changed
