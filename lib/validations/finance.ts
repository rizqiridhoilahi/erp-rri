import { z } from 'zod';

// Chart of Accounts types
export const chartOfAccountTypeEnum = z.enum([
  'asset',
  'liability',
  'equity',
  'revenue',
  'expense',
  'other_income',
  'other_expense',
]);

export const chartOfAccountStatusEnum = z.enum(['active', 'inactive']);

export const chartOfAccountSchema = z.object({
  id: z.string().uuid().optional(),
  account_code: z
    .string()
    .min(1, 'Kode akun harus diisi')
    .max(20, 'Kode akun maksimal 20 karakter'),
  account_name: z
    .string()
    .min(1, 'Nama akun harus diisi')
    .max(255, 'Nama akun maksimal 255 karakter'),
  account_type: chartOfAccountTypeEnum,
  parent_id: z.string().uuid().optional().nullable(),
  description: z.string().optional(),
  status: chartOfAccountStatusEnum,
  opening_balance: z.number().optional(),
  balance: z.number().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const chartOfAccountFiltersSchema = z.object({
  search: z.string().optional(),
  account_type: z.string().optional(),
  status: z.string().optional(),
  parent_id: z.string().uuid().optional(),
  sortBy: z.enum(['account_code', 'account_name', 'created_at']).default('account_code'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
});

// Journal Entry types
export const journalEntryStatusEnum = z.enum(['draft', 'posted', 'voided']);

export const journalEntryLineSchema = z.object({
  id: z.string().uuid().optional(),
  journal_entry_id: z.string().uuid().optional(),
  account_id: z.string().uuid().min(1, 'Akun harus dipilih'),
  account_code: z.string().optional(),
  account_name: z.string().optional(),
  debit: z
    .number()
    .nonnegative('Debit tidak boleh negatif'),
  credit: z
    .number()
    .nonnegative('Kredit tidak boleh negatif'),
  description: z.string().optional(),
  reference_no: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const journalEntrySchema = z.object({
  id: z.string().uuid().optional(),
  entry_no: z.string().optional(),
  entry_date: z.string().or(z.date()).refine(
    (val) => {
      const date = typeof val === 'string' ? new Date(val) : val;
      return date instanceof Date && !isNaN(date.getTime());
    },
    'Tanggal jurnal harus valid'
  ),
  description: z
    .string()
    .min(1, 'Deskripsi harus diisi')
    .max(500, 'Deskripsi maksimal 500 karakter'),
  notes: z.string().optional(),
  status: journalEntryStatusEnum.optional(),
  total_debit: z.number().optional(),
  total_credit: z.number().optional(),
  lines: z.array(journalEntryLineSchema).min(2, 'Minimal 2 baris jurnal diperlukan'),
  posted_at: z.string().datetime().optional(),
  posted_by: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
}).refine(
  (data) => {
    // Validate that debit total = credit total
    const debitTotal = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const creditTotal = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    return Math.abs(debitTotal - creditTotal) < 0.01; // Allow for floating point precision
  },
  {
    message: 'Total Debit dan Kredit harus sama (Debit = Kredit)',
    path: ['lines'],
  }
);

export const journalEntryFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  account_id: z.string().uuid().optional(),
  sortBy: z.enum(['entry_date', 'created_at']).default('entry_date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
});

// General Ledger types
export const generalLedgerFiltersSchema = z.object({
  account_id: z.string().uuid().min(1, 'Akun harus dipilih'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['entry_date', 'created_at']).default('entry_date'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(20),
});

// Trial Balance types
export const trialBalanceFiltersSchema = z.object({
  account_type: z.string().optional(),
  status: z.string().optional(),
  showZeroBalance: z.boolean().default(false),
  sortBy: z.enum(['account_code', 'account_name']).default('account_code'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Export types for TypeScript
export type ChartOfAccount = z.infer<typeof chartOfAccountSchema>;
export type ChartOfAccountFilters = z.infer<typeof chartOfAccountFiltersSchema>;
export type JournalEntry = z.infer<typeof journalEntrySchema>;
export type JournalEntryLine = z.infer<typeof journalEntryLineSchema>;
export type JournalEntryFilters = z.infer<typeof journalEntryFiltersSchema>;
export type GeneralLedgerFilters = z.infer<typeof generalLedgerFiltersSchema>;
export type TrialBalanceFilters = z.infer<typeof trialBalanceFiltersSchema>;
export type ChartOfAccountType = z.infer<typeof chartOfAccountTypeEnum>;
export type JournalEntryStatus = z.infer<typeof journalEntryStatusEnum>;
