# Week 9 Quotation Implementation - Setup Instructions

## Database Setup

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** → Click **New Query**
4. Copy and paste the SQL from `/supabase/migrations/quotations.sql`
5. Click **Run**

The SQL will create:
- `quotations` table with columns for quotation header info
- `quotation_line_items` table for product line items
- Auto-increment function for quotation numbering (QT-YYYY-0001)
- Timestamps & RLS policies

### Option 2: Using Supabase CLI (If installed)

```bash
# Navigate to project directory
cd /workspaces/erp-rri

# Run migration
supabase db push
```

---

## Schema Overview

### quotations table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| quotation_no | VARCHAR(50) | Auto-generated (QT-2025-001) |
| customer_id | UUID | FK to customers table |
| quotation_date | DATE | Date quotation created |
| valid_until | DATE | Expiry date |
| status | VARCHAR(50) | draft/sent/accepted/rejected/expired |
| notes | TEXT | Notes from seller |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### quotation_line_items table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| quotation_id | UUID | FK to quotations table |
| product_id | UUID | FK to products table |
| quantity | NUMERIC | Quantity ordered |
| unit_price | NUMERIC | Price per unit |
| discount_percent | NUMERIC | Discount % (0-100) |
| line_total | NUMERIC | Auto-calculated (qty × price × (1-discount%)) |
| notes | TEXT | Line item notes |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

---

## Features Implemented

### Backend API
- ✅ `GET /api/quotations` - List with filters (search, status, date range, sorting, pagination)
- ✅ `POST /api/quotations` - Create new quotation with line items
- ✅ `GET /api/quotations/[id]` - Get single quotation detail
- ✅ `PUT /api/quotations/[id]` - Update quotation & all line items
- ✅ `DELETE /api/quotations/[id]` - Delete quotation (cascade delete items)

### Frontend Components
- ✅ `QuotationForm` - Create/Edit form dengan dynamic line items
- ✅ `QuotationTable` - List view with checkbox selection
- ✅ `QuotationFilters` - Search & filter options
- ✅ `useQuotation` hook - All CRUD operations

### Pages
- ✅ `/sales/quotations` - List view
- ✅ `/sales/quotations/create` - Create form
- ✅ `/sales/quotations/[id]` - Detail view
- ✅ `/sales/quotations/[id]/edit` - Edit form

### UI Features
- Real-time calculation (subtotal → tax → total)
- Dynamic line items (add/remove)
- Product dropdown with auto-fill price
- Discount per line item
- Status badges (color-coded)
- Bulk selection & deletion
- Date range filtering
- Sorting & pagination

---

## Testing Checklist

### API Testing (Using REST client or Postman)

1. **Create Quotation**
   ```bash
   POST /api/quotations
   {
     "customerId": "customer-uuid",
     "customerName": "PT Demo",
     "quotationDate": "2025-03-01",
     "validUntil": "2025-04-01",
     "status": "draft",
     "lineItems": [
       {
         "productId": "product-uuid",
         "productName": "Product 1",
         "quantity": 5,
         "unitPrice": 100000,
         "discountPercent": 10
       }
     ],
     "notes": "Test quotation"
   }
   ```

2. **Get List**
   ```
   GET /api/quotations?status=draft&page=1&pageSize=10
   ```

3. **Get Detail**
   ```
   GET /api/quotations/{quotation-id}
   ```

4. **Update**
   ```
   PUT /api/quotations/{quotation-id}
   [Same payload as Create]
   ```

5. **Delete**
   ```
   DELETE /api/quotations/{quotation-id}
   ```

### Frontend Testing

1. Navigate to `/sales/quotations`
2. Test Create form:
   - Select customer
   - Add multiple line items
   - Remove line items
   - Check calculations update automatically
   - Submit creates quotation
3. Test List view:
   - Verify quotations display
   - Test search by quotation number
   - Test filter by status
   - Test date range filtering
   - Verify pagination
4. Test Detail view:
   - View complete quotation
   - Check all line items displayed
   - Verify calculations match
5. Test Edit:
   - Modify quotation
   - Update line items
   - Save changes
6. Test Delete:
   - Delete single quotation
   - Test bulk delete from list

---

## Known Limitations & Future Enhancements

### Phase 1 (Week 9)
- ✅ Basic CRUD operations
- ✅ Dynamic line items
- ✅ Real-time calculations
- ✅ Filtering & sorting

### Phase 2 (Week 10)
- 📋 PDF generation (React-PDF)
- 📋 Email quotation to customer
- 📋 Convert quotation to Sales Order
- 📋 Version history / audit trail
- 📋 Currency support (currently IDR only)

---

## Environment Variables

Make sure `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Build Command

```bash
npm run build
```

Expected output:
- ✅ TypeScript compilation success
- ✅ 24+ routes generated (including new /sales/quotations/* routes)
- ✅ Zero errors

---

## Files Created This Week

### Backend
- `supabase/migrations/quotations.sql` - Database schema
- `pages/api/quotations/index.ts` - List & Create endpoints
- `pages/api/quotations/[id].ts` - Detail, Update, Delete endpoints

### Frontend
- `lib/validations/quotation.ts` - Zod schemas & types
- `hooks/useQuotation.ts` - CRUD hook (calls real API)
- `components/forms/QuotationForm.tsx` - Dynamic form component
- `components/tables/QuotationTable.tsx` - List table
- `components/tables/QuotationFilters.tsx` - Filter controls
- `app/sales/quotations/page.tsx` - List page
- `app/sales/quotations/create/page.tsx` - Create page
- `app/sales/quotations/[id]/page.tsx` - Detail page
- `app/sales/quotations/[id]/edit/page.tsx` - Edit page

**Total Files: 12**
**LOC: ~2,500**

---

## Next Steps (Week 10)

- [ ] PDF generation & download
- [ ] Email integration
- [ ] Convert to Sales Order workflow
- [ ] Advanced reporting
- [ ] API rate limiting & caching

---

Generated: March 1, 2025
