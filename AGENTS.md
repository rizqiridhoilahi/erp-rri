# Agent Guidelines for ERP-RRI Repository

## Setup
- `npm install --legacy-peer-deps` — required locally (`vercel.json` overrides installCommand)
- Env vars (no `.env.example` in repo): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `CRON_SECRET_TOKEN`, `R2_DOCUMENTS_ENDPOINT`, `R2_DOCUMENTS_ACCESS_KEY_ID`, `R2_DOCUMENTS_SECRET_ACCESS_KEY`, `R2_DOCUMENTS_BUCKET`, `FONNTE_API_KEY`, `OPENAI_API_KEY` (optional)
- **poppler-utils** required for AI OCR: `sudo apt-get install -y poppler-utils`

## Essential Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint (flat config, Next.js presets)
- `npm run test` — Vitest single run
- `npx vitest run <path>` — Run single test file
- `npm run test:watch` — Vitest watch mode
- **Never run `lint` and `build` in parallel** — sequential only to avoid VPS RAM/CPU crash
- Database migrations: `npx drizzle-kit generate` (schema at `src/lib/db/schema/index.ts`, output to `drizzle/`)
- OpenAPI docs: `npx next-openapi-gen generate`

## Deployment Rules
- **Never run `vercel deploy` without explicit user confirmation**
- Verify with `npm run lint` + `npm run build` only — do not deploy

## Project Structure
All source lives under `src/`:
```
src/app/          — Next.js App Router (pages + API routes under /api/v1/{module}/)
src/components/   — React components (shadcn/ui copied to src/components/ui/)
src/hooks/        — Custom React hooks
src/lib/          — Shared libraries
  api/            — auth.ts, client.ts (apiFetch), errors.ts, supabase-server.ts, role-guard.ts
  db/             — client.ts (supabase + supabaseAdmin lazy Proxy), schema/
  pdf/            — @react-pdf/renderer templates
  storage/        — R2 service (Cloudflare S3 SDK), index.ts exports storageService
  utils/          — Utility functions (document-number, email, rate-limit, etc.)
src/types/        — TypeScript definitions (role.ts, etc.)
src/test/         — Vitest tests (jsdom, setup.ts)
```

## Key Conventions

### API Routes
- All under `/api/v1/{module}/`, plus nested routes (`[id]/`, `[id]/documents/`, `[id]/pdf/`, etc.)
- Every route calls `verifyAuth(request)` — returns `{ user, error }` on failure
- For role checks: `verifyAuthWithRole(request, allowedRoles)` from `src/lib/api/role-guard.ts`
- DB access via `supabaseAdmin` (service role key) from `src/lib/api/supabase-server`
- Request validation via Zod schemas
- **Response format is mandatory**: success → `{ data: ... }`, error → `{ error, code }` with HTTP status
- `apiFetch<T>()` and `apiFetchFormData<T>()` from `src/lib/api/client.ts` expect `{ data: T }` and throw on non-ok

### Document Numbering
- Format: `RRI-{KODE}-{YY}-{MM}-{NNNN}`
- Global single counter shared by all documents via `document_counter` table + `increment_document_counter()` / `increment_global_counter()` PG functions
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
- Use `storageService` from `src/lib/storage/r2.ts` (S3 SDK), not direct R2 calls

### Hybrid Data Pattern
- Server components (list pages) → direct `supabase` queries
- Client components (forms) → API routes via `apiFetch()`

### Supabase Clients
- `supabase` (from `src/lib/db/client.ts`) — anon client with session; use for client-side / server-component reads
- `supabaseAdmin` (from `src/lib/api/supabase-server.ts`) — service role; use for server-side mutations, no RLS
- Both are lazy-initialized Proxies

### Roles & Permissions
- Roles: `owner`, `admin`, `manager`, `sales`, `procurement`, `gudang`, `finance`, `hr`
- Module permissions in `src/types/role.ts` (`MODULE_PERMISSIONS`)

## System Dependencies
- **poppler-utils** required for AI OCR (PDF-to-JPEG): `sudo apt-get install -y poppler-utils`

## Config Quirks
- Tailwind CSS v4 with `@tailwindcss/postcss` in `postcss.config.mjs`; CSS-first config in `src/app/globals.css`
- Next.js 15.5.18 with React 18.3.1
- Path alias `@/*` → `./src/*`
- `sharp` native module may require `libvips` on some Linux distros

## Workflow
After completing changes, update:
1. `PRD.md` — relevant sections
2. `ROADMAP.md` — mark completed items `[x]`, add new items if scope changed
