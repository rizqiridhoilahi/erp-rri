# Frontend Development Roadmap - ERP RRI
## PT. Rizqi Ridho Ilahi (dengan RRI AI Chatbot)

**Version:** 1.0  
**Last Updated:** 28 Februari 2026  
**Stack:** Next.js 14+ (Pages Router), TypeScript, Tailwind CSS, shadcn/ui, React Query, Zustand

---

## 📋 Daftar Isi
1. [Arsitektur Frontend](#arsitektur-frontend)
2. [Struktur Folder Project](#struktur-folder-project)
3. [Phase-by-Phase Development Roadmap](#phase-by-phase-development-roadmap)
4. [Component Library & UI Pattern](#component-library--ui-pattern)
5. [Pages & Routes Breakdown](#pages--routes-breakdown)
6. [State Management Strategy](#state-management-strategy)
7. [API Integration Layer](#api-integration-layer)
8. [Performance & Optimization](#performance--optimization)
9. [Testing Strategy](#testing-strategy)
10. [Development Setup & Tools](#development-setup--tools)

---

## 🏗️ Arsitektur Frontend

### Technology Stack
```
Frontend Framework:   Next.js 14+ (Pages Router)
Language:             TypeScript
Styling:              Tailwind CSS + shadcn/ui components
State Management:     Zustand (simple) + React Context (auth)
Data Fetching:        React Query (TanStack Query)
Form Management:      React Hook Form + Zod validation
Charts/Visualization: Recharts, Chart.js
PDF Generation:       React-PDF, html2pdf
Image Compression:    browser-image-compression
Icons:                Lucide React (shadcn/ui default)
Date Handling:        date-fns
Notifications:        Sonner or React Toastify
```

### Design Principles
- **Component-First**: Reusable shadcn/ui components + custom components
- **Mobile-Responsive**: Tailwind breakpoints (sm, md, lg, xl, 2xl)
- **Performance**: Code splitting, lazy loading, image optimization
- **Accessibility**: WCAG 2.1 AA standards, semantic HTML
- **DRY (Don't Repeat Yourself)**: Custom hooks, composition patterns
- **Type Safety**: 100% TypeScript coverage

---

## 📁 Struktur Folder Project

```
erp-rri/
├── public/
│   ├── images/
│   ├── logos/
│   └── icons/
├── src/
│   ├── pages/                    # Next.js Pages Router
│   │   ├── index.tsx             # Landing/Dashboard
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── dashboard/
│   │   │   ├── index.tsx
│   │   │   ├── analytics.tsx
│   │   │   └── [dashboardId].tsx
│   │   ├── master-data/
│   │   │   ├── products/
│   │   │   │   ├── index.tsx     # Product List
│   │   │   │   ├── [id].tsx      # Product Detail/Edit
│   │   │   │   └── create.tsx
│   │   │   ├── customers/
│   │   │   ├── suppliers/
│   │   │   └── services/
│   │   ├── sales/
│   │   │   ├── quotations/
│   │   │   ├── sales-orders/
│   │   │   ├── delivery-orders/
│   │   │   └── rfq/
│   │   ├── purchasing/
│   │   │   ├── purchase-orders/
│   │   │   ├── requisitions/
│   │   │   └── suppliers/
│   │   ├── finance/
│   │   │   ├── invoices/
│   │   │   ├── chart-of-accounts/
│   │   │   ├── general-ledger/
│   │   │   ├── financial-statements/
│   │   │   └── reports/
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── settings/
│   │   │   └── audit-log/
│   │   └── api/
│   │       ├── auth/
│   │       ├── products/
│   │       ├── sales/
│   │       ├── finance/
│   │       └── ai/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── forms/
│   │   │   ├── ProductForm.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── QuotationForm.tsx
│   │   │   ├── InvoiceForm.tsx
│   │   │   └── SearchFilterForm.tsx
│   │   ├── tables/
│   │   │   ├── ProductTable.tsx
│   │   │   ├── InvoiceTable.tsx
│   │   │   ├── DataTable.tsx (reusable)
│   │   │   └── PaginationComponent.tsx
│   │   ├── charts/
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── SalesChart.tsx
│   │   │   ├── InventoryChart.tsx
│   │   │   └── FinancialRatioChart.tsx
│   │   ├── modals/
│   │   │   ├── UploadImageModal.tsx
│   │   │   ├── ImportExcelModal.tsx
│   │   │   └── ExportModal.tsx
│   │   ├── ai-chat/
│   │   │   ├── ChatWidget.tsx
│   │   │   ├── ChatBubble.tsx
│   │   │   └── ChatHistory.tsx
│   │   └── shadcn-custom/
│   │       ├── CustomButton.tsx
│   │       ├── CustomInput.tsx
│   │       └── CustomSelect.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProducts.ts
│   │   ├── useSales.ts
│   │   ├── useFinance.ts
│   │   ├── useNotification.ts
│   │   ├── usePagination.ts
│   │   ├── useSearch.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   ├── store/
│   │   ├── authStore.ts          # Zustand auth state
│   │   ├── productStore.ts
│   │   ├── saleStore.ts
│   │   ├── filterStore.ts
│   │   ├── dashboardStore.ts
│   │   └── notificationStore.ts
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts         # Axios/Fetch client setup
│   │   │   ├── auth.ts
│   │   │   ├── products.ts
│   │   │   ├── customers.ts
│   │   │   ├── sales.ts
│   │   │   ├── finance.ts
│   │   │   ├── suppliers.ts
│   │   │   ├── ai.ts
│   │   │   └── webhook.ts
│   │   ├── storage/
│   │   │   ├── imageUpload.ts
│   │   │   ├── excelImport.ts
│   │   │   └── excelExport.ts
│   │   └── utils/
│   │       ├── formatting.ts
│   │       ├── validation.ts
│   │       ├── calculations.ts
│   │       └── date-helpers.ts
│   ├── types/
│   │   ├── index.ts              # Global types
│   │   ├── product.ts
│   │   ├── customer.ts
│   │   ├── sales.ts
│   │   ├── finance.ts
│   │   ├── user.ts
│   │   ├── api.ts
│   │   └── ai.ts
│   ├── constants/
│   │   ├── routes.ts
│   │   ├── api-endpoints.ts
│   │   ├── messages.ts
│   │   ├── roles.ts
│   │   └── currencies.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── NotificationContext.tsx
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── animations.css
│   └── lib/
│       ├── utils.ts              # Tailwind merge, cn() helper
│       ├── queryClient.ts
│       └── supabase.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── jest.config.js
└── README.md
```

---

## 🚀 Phase-by-Phase Development Roadmap

### **PHASE 1: MVP (Bulan 1-2)**

#### Week 1-2: Project Setup & Core Infrastructure
- [x] Initialize Next.js project dengan TypeScript
- [x] Setup Tailwind CSS + shadcn/ui component library
- [x] Configure Supabase client (authentication, database)
- [x] Setup React Query (TanStack Query) untuk data fetching
- [x] Setup Zustand untuk state management
- [x] Configure ESLint, Prettier, Husky
- [x] Setup folder structure & naming conventions
- [x] Create basic layout components (Header, Sidebar, MainLayout)

**Deliverables:**
- Project repository dengan struktur folder lengkap
- Base components ready untuk reuse
- Development environment setup

#### Week 3-4: Authentication & Authorization
- [x] Design Login/Register pages (AuthLayout)
- [x] Implement Supabase Auth integration
  - [x] Email/Password login
  - [x] Session management
  - [x] Remember me functionality
  - [x] Password reset flow
- [x] Create authentication context & custom hooks (useAuth)
- [x] Implement protected routes (private pages)
- [x] Design role-based UI visibility (Admin, Sales, Finance)
- [x] User profile page setup

**Components to Build:**
- LoginForm (email, password, remember me, forgot password link)
- RegisterForm (email, password, confirm password, terms acceptance)
- ProtectedRoute wrapper
- AuthLayout dengan logo & branding

**Deliverables:**
- Authentication flow working
- Protected routes implementation
- User session persistence

#### Week 5-6: Master Data - Products Management (Phase 1)
- [x] Design & implement Product List page
  - [x] Table with pagination (10, 20, 50 items per page)
  - [x] Full-text search (debounce 300-500ms)
  - [x] Filter by category, brand, status
  - [x] Sort by name, price, stock
  - [x] Bulk action checkboxes
- [x] Design & implement Product Detail page
- [x] Design & implement Product Create/Edit form
  - [x] Form fields validation (Zod)
  - [x] Image upload with compression (browser-image-compression)
  - [x] Price formatting (Rp 1.234.567)
  - [x] Stock input validation
- [x] Implement Product API integration
  - [x] GET /products (list dengan filters)
  - [x] GET /products/:id (detail)
  - [x] POST /products (create)
  - [x] PUT /products/:id (update)
  - [x] DELETE /products/:id (delete)

**Components to Build:**
- ProductTable (reusable DataTable component)
- ProductForm (React Hook Form + Zod)
- ProductFilters
- ImageUploadField
- PaginationComponent

**Deliverables:**
- Full CRUD untuk products
- Search & filter working
- Image upload integration

#### Week 7-8: Master Data - Customers & Suppliers (Phase 1)
- [x] Customer List page (similar to products)
- [x] Customer Create/Edit form
- [x] Supplier List page
- [x] Supplier Create/Edit form
- [x] API integration untuk customers & suppliers

**Components to Build:**
- CustomerTable
- CustomerForm
- SupplierTable
- SupplierForm
- ContactInfoSection

**Deliverables:**
- CRUD untuk customers & suppliers
- List, search, filter, pagination working

#### Week 9: Sales Module - Quotation (Part 1)
- [x] Design Quotation List page
- [x] Design Quotation Create/Edit form
  - [x] Dynamic line items (add/remove)
  - [x] Automatic subtotal calculation
  - [x] PPN toggle (11%)
  - [x] Grand total calculation
- [x] API integration untuk quotations
- [x] PDF generation setup (API2PDF integration)

**Components to Build:**
- QuotationTable
- QuotationForm dengan DynamicLineItems
- LineItemRow component (product select, quantity, price, remarks)
- TaxToggle component
- PriceDisplay component (formatted Rp)

**Deliverables:**
- Quotation CRUD working
- Dynamic form with calculations
- PDF generation setup

#### Week 10: Financial Module Phase 1
- [x] Chart of Accounts setup page
- [x] General Ledger view (read-only in Phase 1)
- [x] Journal Entry basic form
- [x] API integration untuk COA & GL

**Components to Build:**
- ChartOfAccountsSetup
- GeneralLedgerTable
- JournalEntryForm

**Deliverables:**
- Basic financial module structure
- COA & GL display

#### Week 11: Dashboard & Reports Basic
- [x] Design main Dashboard page
- [x] KPI widgets (Total Revenue, Pending Orders, Low Stock)
- [x] Basic charts (Revenue trend, Sales by category)
- [x] User profile access from header

**Components to Build:**
- [x] DashboardPage layout
- [x] KPIWidget (reusable)
- [x] RevenueChart (Recharts)
- [x] SalesChart

**Deliverables:**
- [x] Main dashboard working
- [x] Basic KPI display

#### Week 12: UI Polish & Testing
- [x] Responsive design testing (mobile, tablet, desktop)
- [x] Error handling & error pages (404, 500, etc)
- [x] Loading states for all pages
- [x] Toast notifications (Sonner)
- [x] Unit tests untuk hooks & utilities
- [x] E2E tests untuk happy path scenarios

**Deliverables:**
- [x] MVP ready for testing
- [x] Close to 80% test coverage
- [x] Responsive design verified

---

### **PHASE 2: Enhancement (Bulan 3-4)**

#### Week 1-2: Advanced Search & Filters
- [ ] Full-text search across all master data
- [ ] Advanced query builder UI
- [ ] Search history & suggestions
- [ ] Saved filters functionality
- [ ] Filter sharing capability

**Components to Build:**
- AdvancedSearchForm
- QueryBuilder (visual UI)
- SavedFiltersPanel
- SearchHistorySidebar

**Deliverables:**
- Advanced search working across all modules
- Saved filters & sharing

#### Week 3-4: Quotation SO DO Workflow
- [ ] Sales Order create from Quotation
- [ ] Delivery Order create from Sales Order
- [ ] Document upload fields (PO, Delivery Slip)
- [ ] Status workflow visualization
- [ ] Automatic number generation integration

**Components to Build:**
- QuotationToSOConverter
- DocumentUploadField
- WorkflowStatusBadge
- DeliveryOrderForm

**Deliverables:**
- Full Sales workflow (Quotation → SO → DO)
- Document upload working

#### Week 5-6: Notifications & Alerts System
- [ ] In-app notification center
- [ ] Email notification setup (SendGrid/Nodemailer)
- [ ] Notification preferences page
- [ ] Alert rules configuration (admin only)
- [ ] Email templates customization

**Components to Build:**
- NotificationBell (header)
- NotificationCenter (modal/drawer)
- NotificationPreferences
- AlertRulesConfiguration
- EmailTemplateEditor

**Deliverables:**
- Multi-channel notifications working
- Notification preferences per user

#### Week 7-8: Advanced Dashboard Customization
- [ ] Drag-drop dashboard widget builder
- [ ] Multiple dashboard layouts
- [ ] Widget threshold alerts (green/yellow/red)
- [ ] Dashboard sharing per user/role
- [ ] Scheduled dashboard email export

**Components to Build:**
- DashboardBuilder (drag-drop)
- Widget (generic container)
- DashboardSelector
- WidgetThresholdSetter
- DashboardShareModal

**Deliverables:**
- Customizable dashboards
- Dashboard sharing & scheduling

#### Week 9-10: Financial Statements Phase 1
- [ ] Income Statement (P&L) page
- [ ] Balance Sheet page
- [ ] Trial Balance page
- [ ] Auto-calculation dari GL entries
- [ ] Period selection (monthly, quarterly, yearly)
- [ ] Year-over-year comparison

**Components to Build:**
- IncomeStatementTable
- BalanceSheetTable
- TrialBalanceTable
- PeriodSelector
- ComparisonChart

**Deliverables:**
- Financial statements auto-generating
- Period comparison working

#### Week 11-12: Data Import/Export Excel
- [ ] Excel import template download
- [ ] Excel file upload with validation
- [ ] Import preview before commit
- [ ] Error reporting for failed rows
- [ ] Excel export with templates
- [ ] Scheduled exports setup

**Components to Build:**
- ExcelImportModal
- ImportPreviewTable
- ImportErrorReport
- ExcelExportModal
- ExportScheduler

**Deliverables:**
- Excel import/export working
- Bulk data operations available

---

### **PHASE 3: Advanced Features (Bulan 5-6)**

#### Week 1-2: Supplier Management & RFQ
- [ ] Supplier scorecard page
- [ ] RFQ management (create, send to multiple suppliers)
- [ ] Quote comparison tool
- [ ] Purchase requisition workflow
- [ ] Supplier performance dashboard

**Components to Build:**
- SupplierScorecard
- RFQForm
- QuoteComparison Table
- PurchaseRequisitionForm
- SupplierPerformanceChart

**Deliverables:**
- Full supplier management module
- RFQ & procurement workflow

#### Week 3-4: Advanced Alerts & Multi-Channel Notifications
- [ ] SMS alerts setup (Twilio integration)
- [ ] Push notifications (browser)
- [ ] Custom alert rules engine (complex conditions)
- [ ] Escalation paths (manager notification jika not acknowledged)
- [ ] Bulk notifications to teams/departments

**Components to Build:**
- AlertRulesBuilder (visual rule editor)
- EscalationPathSelector
- BulkNotificationWizard
- NotificationLog (view history)

**Deliverables:**
- Multi-channel alerts fully working
- Escalation & bulk notifications

#### Week 5-6: User Activity & Audit Trail
- [ ] User activity dashboard (manager view)
- [ ] Login history dengan geo-location
- [ ] Field-level change tracking
- [ ] Suspicious activity detection/alerts
- [ ] Audit report generation

**Components to Build:**
- ActivityDashboard
- LoginHistoryTable
- ChangeLog (field-level history)
- SuspiciousActivityAlert
- AuditReportGenerator

**Deliverables:**
- Complete activity tracking
- Audit reports generated

#### Week 7-8: Advanced Financial Reports
- [ ] Cash Flow statement
- [ ] Financial ratio analysis dashboard
- [ ] Budget vs actual tracking
- [ ] Comparative period analysis
- [ ] Professional report templates
- [ ] Scheduled report emails

**Components to Build:**
- CashFlowStatement
- RatioAnalysisDashboard
- BudgetVsActualChart
- ReportTemplateManager
- ScheduledReportList

**Deliverables:**
- Advanced financial reporting
- Professional PDF/Excel exports

#### Week 9-10: RRI AI Chatbot Integration
- [ ] AI Chat widget UI (floating chat)
- [ ] Chat message display (bubbles)
- [ ] Chat history panel
- [ ] Context-aware AI responses (showing page context)
- [ ] Typing indicators & loading states
- [ ] Chat persistence (save conversations)
- [ ] Knowledge base document upload

**Components to Build:**
- ChatWidget (floating)
- ChatBubble (message display)
- ChatInput (with attachments)
- ChatHistory (conversations list)
- KnowledgeBaseUpload

**Deliverables:**
- AI chat widget fully functional
- Backend integration ready

#### Week 11-12: Invoice & AR Management
- [ ] Invoice list with AR aging
- [ ] Invoice detail page
- [ ] Payment tracking (amount paid, status)
- [ ] Invoice generation from SO
- [ ] Invoice PDF download/email
- [ ] Payment proof upload
- [ ] Dunning reminders setup

**Components to Build:**
- InvoiceTable (dengan AR aging)
- InvoiceDetail
- PaymentProofUpload
- ARAgingReport
- DunningReminderConfig

**Deliverables:**
- Invoice & AR management complete
- Payment tracking working

---

### **PHASE 4: Integration & Optimization (Bulan 7-8)**

#### Week 1-2: Webhook & API Foundation
- [ ] Webhook event configuration UI (admin)
- [ ] Webhook test & monitoring dashboard
- [ ] Event log viewer
- [ ] Webhook retry mechanism visualization
- [ ] API documentation viewer (Swagger/OpenAPI)

**Components to Build:**
- WebhookConfiguration
- WebhookMonitoringDashboard
- EventLogViewer
- APIDocumentationViewer

**Deliverables:**
- Webhook system ready for integration
- API documentation accessible

#### Week 3-4: Customer Portal Setup
- [ ] Customer login/authentication (separate portal)
- [ ] Order history view for customers
- [ ] Invoice download & payment proof upload
- [ ] Order status tracking
- [ ] Delivery tracking (if logistics integrated)

**Pages/Components to Build:**
- /customer-portal/login
- /customer-portal/orders
- /customer-portal/invoices
- /customer-portal/deliveries
- /customer-portal/profile

**Deliverables:**
- Customer portal functional
- Self-service capabilities

#### Week 5-6: Performance Optimization
- [ ] Code splitting & lazy loading
- [ ] Image optimization (Next.js Image component)
- [ ] Bundle size analysis & optimization
- [ ] API caching strategy (React Query)
- [ ] Virtual scrolling untuk large datasets
- [ ] Database query optimization insights
- [ ] Lighthouse score optimization (>90)

**Deliverables:**
- Performance optimized
- Fast load times
- High Lighthouse scores

#### Week 7-8: Mobile Responsiveness & Polish
- [ ] Mobile UI testing (iOS, Android)
- [ ] Touch optimization (buttons, forms)
- [ ] Mobile navigation improvements
- [ ] Tablet-specific layouts
- [ ] Dark mode support (if requested)
- [ ] Print styles optimization
- [ ] Final UI/UX polish

**Deliverables:**
- Fully responsive design
- Mobile-optimized experience

---

### **PHASE 5: Future Enhancement (Bulan 9+)**

- [ ] REST API public endpoints implementation
- [ ] Mobile app (PWA or React Native)
- [ ] Advanced ML features (forecasting, churn prediction)
- [ ] Barcode/QR code scanning (WMS)
- [ ] Real-time collaboration features
- [ ] Advanced reporting engine
- [ ] Integration dengan third-party services

---

## 🎨 Component Library & UI Pattern

### Core Components dari shadcn/ui
```typescript
// Buttons & Forms
Button, Input, Select, Textarea, Checkbox, RadioGroup, Switch, Label

// Layout
Card, Separator, Skeleton, AspectRatio

// Navigation
Tabs, Breadcrumb

// Data Display
Table, Badge, Progress, Alert

// Feedback
Tooltip, AlertDialog, Dialog, Popover, DropdownMenu

// Modals & Drawers
Sheet (drawer), Dialog

// Complex Components untuk Build
- DataTable (custom pagination, sorting, filtering)
- DynamicForm (form builder)
- FileUpload (drag-drop)
```

### Custom Component Patterns

**1. Form Component Pattern**
```typescript
// pages/master-data/products/create.tsx
interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Product) => Promise<void>;
  isLoading?: boolean;
}

export function ProductForm({ product, onSubmit, isLoading }: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product || {},
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField control={form.control} name="sku" render={...} />
      <FormField control={form.control} name="name" render={...} />
      {/* More fields */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Product'}
      </Button>
    </form>
  );
}
```

**2. Data Table Pattern**
```typescript
// components/tables/DataTable.tsx
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: { page: number; pageSize: number; total: number };
  onPaginationChange?: (page: number) => void;
  onSort?: (sortBy: string, order: 'asc' | 'desc') => void;
}

export function DataTable<T>({ columns, data, pagination, ...props }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({ columns, data, state: { sorting }, ... });
  
  return (
    <div>
      <Table>
        {/* header & body */}
      </Table>
      <PaginationComponent pagination={pagination} />
    </div>
  );
}
```

**3. API Hook Pattern**
```typescript
// hooks/useProducts.ts
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductInput) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

---

## 📄 Pages & Routes Breakdown

### Authentication Routes
```
/login                          Login page
/register                       Register page
/forgot-password                Password reset
/reset-password/[token]         Reset password confirmation
/verify-email/[token]           Email verification
```

### Dashboard Routes
```
/dashboard                      Main dashboard dengan KPI
/dashboard/[dashboardId]        Custom dashboard view
/dashboard/analytics            Advanced analytics page
```

### Master Data Routes
```
/master-data/products                  Product list
/master-data/products/create           Create product
/master-data/products/[id]             Product detail & edit
/master-data/products/[id]/delete      Delete confirmation

/master-data/customers                 Customer list
/master-data/customers/create          Create customer
/master-data/customers/[id]            Customer detail & edit

/master-data/suppliers                 Supplier list
/master-data/suppliers/create          Create supplier
/master-data/suppliers/[id]            Supplier detail & edit

/master-data/services                  Service list
/master-data/services/create           Create service
/master-data/services/[id]             Service detail & edit
```

### Sales Routes
```
/sales/quotations                      Quotation list
/sales/quotations/create               Create quotation
/sales/quotations/[id]                 Quotation detail
/sales/quotations/[id]/edit            Edit quotation
/sales/quotations/[id]/pdf             PDF preview

/sales/sales-orders                    Sales order list
/sales/sales-orders/[id]               Sales order detail

/sales/delivery-orders                 Delivery order list
/sales/delivery-orders/[id]            Delivery order detail

/sales/rfq                             RFQ management
/sales/rfq/create                      Create RFQ
/sales/rfq/[id]                        RFQ detail
```

### Purchasing Routes
```
/purchasing/purchase-orders            PO list
/purchasing/purchase-orders/create     Create PO
/purchasing/purchase-orders/[id]       PO detail

/purchasing/requisitions               Purchase requisition list
/purchasing/requisitions/create        Create requisition

/purchasing/suppliers                  Supplier management
/purchasing/suppliers/[id]/scorecard   Supplier scorecard
```

### Finance Routes
```
/finance/invoices                      Invoice list
/finance/invoices/[id]                 Invoice detail
/finance/invoices/[id]/pdf             Invoice PDF

/finance/chart-of-accounts             COA setup & management
/finance/general-ledger                GL view

/finance/financial-statements          Financial reports
/finance/financial-statements/income   Income statement
/finance/financial-statements/balance  Balance sheet
/finance/financial-statements/cash     Cash flow statement
/finance/financial-statements/trial    Trial balance

/finance/reports                       Custom reports
/finance/reports/[reportId]            Report detail
```

### Admin Routes
```
/admin/users                           User management
/admin/users/[id]                      User detail & edit

/admin/roles                           Role & permission management
/admin/roles/[id]                      Role detail & edit

/admin/settings                        System settings
/admin/settings/company                Company info
/admin/settings/notifications          Notification settings
/admin/settings/email-templates        Email template editor
/admin/settings/webhooks               Webhook configuration

/admin/audit-log                       Audit trail viewer
/admin/activity                        User activity dashboard
```

### Settings Routes
```
/settings/profile                      User profile
/settings/preferences                  User preferences
/settings/security                     Security settings
/settings/saved-filters                My saved filters
```

### Customer Portal Routes
```
/customer-portal/login                 Customer login
/customer-portal/dashboard             Customer dashboard
/customer-portal/orders                Order history
/customer-portal/invoices              Invoice list & download
/customer-portal/deliveries            Delivery tracking
/customer-portal/profile               Profile settings
```

---

## 🧠 State Management Strategy

### Zustand Store Structure

```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  login: async (email, password) => { /* ... */ },
  logout: () => set({ user: null }),
  setUser: (user) => set({ user }),
}));

// store/filterStore.ts - Persistent filters
interface FilterState {
  filters: Record<string, any>;
  savedFilters: SavedFilter[];
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  saveFilter: (name: string) => void;
}

export const useFilterStore = create<FilterState>(
  persist(
    (set) => ({ /* ... */ }),
    { name: 'app-filters' } // LocalStorage persistence
  )
);

// store/dashboardStore.ts - Dashboard customization
interface DashboardState {
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  createDashboard: (name: string) => void;
  updateDashboard: (id: string, updates: Partial<Dashboard>) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  /* ... */
}));
```

### React Query Setup

```typescript
// lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// pages/_app.tsx
<QueryClientProvider client={queryClient}>
  <Component {...pageProps} />
  <ReactQueryDevtools />
</QueryClientProvider>
```

---

## 🔌 API Integration Layer

### API Client Setup

```typescript
// services/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Service Class Pattern

```typescript
// services/api/products.ts
import apiClient from './client';

class ProductService {
  async getProducts(filters?: ProductFilters) {
    const { data } = await apiClient.get<Product[]>('/products', {
      params: filters,
    });
    return data;
  }

  async getProduct(id: string) {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  }

  async createProduct(data: CreateProductInput) {
    const response = await apiClient.post<Product>('/products', data);
    return response;
  }

  async updateProduct(id: string, data: UpdateProductInput) {
    const response = await apiClient.put<Product>(`/products/${id}`, data);
    return response;
  }

  async deleteProduct(id: string) {
    await apiClient.delete(`/products/${id}`);
  }
}

export const productService = new ProductService();
```

### API Error Handling

```typescript
// services/errorHandler.ts
export function handleApiError(error: AxiosError) {
  const status = error.response?.status;
  
  switch (status) {
    case 400:
      return { title: 'Bad Request', message: error.response?.data?.message };
    case 401:
      return { title: 'Unauthorized', message: 'Silakan login kembali' };
    case 403:
      return { title: 'Forbidden', message: 'Anda tidak memiliki akses' };
    case 404:
      return { title: 'Not Found', message: 'Data tidak ditemukan' };
    case 409:
      return { title: 'Conflict', message: 'Data sudah ada' };
    case 422:
      return { 
        title: 'Validation Error', 
        errors: error.response?.data?.errors 
      };
    case 500:
      return { 
        title: 'Server Error', 
        message: 'Terjadi kesalahan pada server' 
      };
    default:
      return { 
        title: 'Error', 
        message: 'Terjadi kesalahan' 
      };
  }
}
```

---

## ⚡ Performance & Optimization

### Image Optimization Strategy
```typescript
// components/OptimizedImage.tsx
import Image from 'next/image';

export function OptimizedImage({ src, alt, ...props }: ImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      quality={75}
      placeholder="blur"
      blurDataURL={placeholderDataUrl}
      {...props}
    />
  );
}
```

### Code Splitting Strategy
```typescript
// pages/index.tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton className="w-full h-96" />,
  ssr: false, // Don't render on server untuk heavy components
});

export default function Dashboard() {
  return (
    <div>
      <HeavyChart />
    </div>
  );
}
```

### Virtual Scrolling untuk Large Lists
```typescript
// components/VirtualizedTable.tsx
import { FixedSizeList } from 'react-window';

export function VirtualizedProductTable({ products }: Props) {
  return (
    <FixedSizeList
      height={600}
      itemCount={products.length}
      itemSize={60}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style} key={products[index].id}>
          <ProductRow product={products[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

### React Query Optimization
```typescript
// hooks/useProducts.ts dengan pagination
export function useProducts(page: number, pageSize: number) {
  return useQuery({
    queryKey: ['products', page, pageSize],
    queryFn: () => productService.getProducts({ page, pageSize }),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true, // Show old data while fetching new
  });
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// tests/unit/utils/formatting.test.ts
describe('formatCurrency', () => {
  it('should format currency dengan Rp', () => {
    expect(formatCurrency(1234567)).toBe('Rp 1.234.567');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-1000)).toBe('-Rp 1.000');
  });
});

// tests/unit/hooks/useProducts.test.ts
describe('useProducts', () => {
  it('should fetch products successfully', async () => {
    const { result } = renderHook(() => useProducts());
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

### Integration Tests
```typescript
// tests/integration/ProductForm.test.tsx
describe('ProductForm', () => {
  it('should submit form dengan data yang benar', async () => {
    const onSubmit = jest.fn();
    render(<ProductForm onSubmit={onSubmit} />);
    
    await userEvent.type(screen.getByLabelText('SKU'), 'PROD001');
    await userEvent.click(screen.getByText('Save'));
    
    expect(onSubmit).toHaveBeenCalled();
  });
});
```

### E2E Tests
```typescript
// tests/e2e/product.spec.ts (Cypress/Playwright)
describe('Product Management Flow', () => {
  it('should create and view product', () => {
    cy.visit('/master-data/products');
    cy.contains('Create Product').click();
    cy.get('input[name="sku"]').type('TEST001');
    cy.get('input[name="name"]').type('Test Product');
    cy.contains('Save').click();
    cy.contains('Product created successfully').should('be.visible');
  });
});
```

---

## 🛠️ Development Setup & Tools

### Initial Setup Commands
```bash
# Create Next.js project
npx create-next-app@latest erp-rri --typescript --tailwind

# Install dependencies
npm install @supabase/supabase-js @tanstack/react-query zustand react-hook-form zod
npm install @hookform/resolvers sonner axios date-fns
npm install browser-image-compression recharts react-markdown

# Install shadcn/ui
npx shadcn-ui@latest init

# Install dev dependencies
npm install -D @testing-library/react @testing-library/jest-dom jest vitest
npm install -D cypress playwright @playwright/test
npm install -D typescript @types/node @types/react

# Setup husky
npx husky install
npx husky add .husky/pre-commit "npm run lint"
```

### .env.local Variables Required
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
OPENROUTER_API_KEY=your_openrouter_key
NEXT_PUBLIC_APP_NAME=ERP RRI
NEXT_PUBLIC_APP_VERSION=2.2.0
```

### npm Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### VS Code Extensions Recommended
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin
- Prettier Code Formatter
- ESLint
- REST Client

---

## 📋 Implementation Checklist - Phase 1

### Week 1-2
- [ ] Project initialized dengan Next.js + TypeScript
- [ ] Tailwind CSS configured
- [ ] shadcn/ui components installed
- [ ] React Query setup
- [ ] Zustand store structure created
- [ ] Folder structure created
- [ ] Supabase client configured
- [ ] ESLint + Prettier configured
- [ ] Husky pre-commit hooks setup

### Week 3-4
- [ ] Login page designed & functional
- [ ] Register page functional
- [ ] Authentication context implemented
- [ ] Protected routes working
- [ ] useAuth hook working
- [ ] User profile page created
- [ ] Role-based UI visibility implemented

### Week 5-6
- [ ] Product List page completed
- [ ] Product detail page completed
- [ ] Product Create/Edit form completed
- [ ] Product API integration completed
- [ ] Search functionality working
- [ ] Filter functionality working
- [ ] Pagination working
- [ ] Image upload functionality working

### Week 7-8
- [ ] Customer List page completed
- [ ] Customer Form completed
- [ ] Supplier List page completed
- [ ] Supplier Form completed
- [ ] API integration untuk customers/suppliers

### Week 9
- [ ] Quotation List page completed
- [ ] Quotation Form dengan dynamic line items
- [ ] Automatic calculation working
- [ ] PPN toggle working
- [ ] API integration untuk quotations
- [ ] PDF generation setup

### Week 10
- [ ] Chart of Accounts page created
- [ ] General Ledger view created
- [ ] Basic financial module structure

### Week 11
- [ ] Main Dashboard created
- [ ] KPI widgets displayed
- [ ] Basic charts working
- [ ] User profile accessible from header

### Week 12
- [ ] Responsive design tested
- [ ] Error pages created (404, 500)
- [ ] Loading states implemented
- [ ] Toast notifications working
- [ ] Unit tests written
- [ ] E2E tests for happy paths
- [ ] MVP ready for testing

---

## 📊 Component Count & Complexity

**Phase 1 Target:**
- ~50 components
- ~30 pages/routes
- ~15 custom hooks
- ~8 Zustand stores
- ~15 API service methods
- 70%+ Typescript coverage
- ~60% test coverage

---

## 🎯 Success Criteria

### Phase 1 MVP
- ✅ Authentication working
- ✅ All master data CRUD working
- ✅ Basic sales workflow (Quotation → SO)
- ✅ Financial module basic structure
- ✅ Dashboard displaying KPIs
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Zero critical bugs
- ✅ Performance score >80 (Lighthouse)

---

## 📝 Notes for Development Team

### Code Standards
- Use `const` and `let` (no `var`)
- Functional components only (no class components)
- Proper TypeScript typing (no `any` types)
- Async/await untuk promises
- Component naming: PascalCase
- Variable/function naming: camelCase
- Constant naming: UPPER_SNAKE_CASE

### Git Workflow
- Feature branches: `feature/feature-name`
- Bugfix branches: `bugfix/bug-name`
- Commit message: `feat: description` atau `fix: description`
- PR required sebelum merge ke main
- At least 1 approval required

### Comments & Documentation
- Comment complex logic
- Document props dengan JSDoc
- Keep README updated
- Maintain CHANGELOG.md

---

**Tertulis oleh:** Development Team  
**Last Review:** 28 Februari 2026  
**Next Review Target:** Setelah Phase 1 completion
