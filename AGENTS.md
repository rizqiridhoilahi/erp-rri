# Agent Guidelines for ERP-RRI Repository

## Essential Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technology Stack
- **Framework**: Next.js 15.5.18 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand + TanStack React Query
- **Forms**: React Hook Form + Zod
- **Database**: Drizzle ORM with Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **PDF Generation**: @react-pdf/renderer

## Project Structure
- `/app` - Next.js App Router pages
- `/components` - React components
- `/lib` - Shared library code (database, utils, etc.)
  - `/db` - Database configuration and schemas
  - `/utils` - Utility functions
- `/public` - Static assets

## Key Configuration Files
- `next.config.ts` - Next.js configuration (minimal)
- `postcss.config.mjs` - Tailwind CSS configuration
- `eslint.config.mjs` - ESLint configuration with Next.js presets
- `package.json` - Dependencies and scripts

## Database Workflow
1. Database schema located in `/lib/db/schema/`
2. Migrations managed via Drizzle ORM in `/lib/db/migrations/`
3. Database client in `/lib/db/client.ts`
4. Required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`

## Development Notes
- Standard Next.js file-based routing applies
- Tailwind CSS utility-first approach
- Components should follow shadcn/ui patterns where applicable
- API routes should follow `/api/v1/` versioning pattern
- No special testing framework configured yet

## Important Conventions from PRD
### Document Numbering
- Format: `{KODE}/{RRI}/{YY}/{MM}/{0000}`
- Examples: `SPH/RRI/26/05/0001`, `SJ/RRI/26/05/0001`
- Reset automatically at year boundary
- Implemented via `document_counter` table

### Storage Structure
- `avatars/` → User profile images
- `barang/` → Product images
- `dokumen/` → PDF documents (contracts, RFQ, etc.)
- `temporary/` → Auto-deleted after 24 hours

### Image Processing Pipeline
1. Client-side validation (type & size)
2. Compress with `browser-image-compression`
3. Convert to WebP
4. Delete existing file if present
5. Upload to Supabase Storage
6. Store public URL in database

### API Structure
All API endpoints under `/api/v1/`:
- `/api/v1/master/barang`
- `/api/v1/pre-sales/quotation`
- `/api/v1/sales/delivery-order`