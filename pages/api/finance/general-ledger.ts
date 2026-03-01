import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { generalLedgerFiltersSchema } from '@/lib/validations/finance';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filters = {
      account_id: req.query.account_id as string || '',
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      sortBy: req.query.sortBy || 'entry_date',
      sortOrder: req.query.sortOrder || 'asc',
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 20,
    };

    const validatedFilters = generalLedgerFiltersSchema.parse(filters);
    const { account_id, dateFrom, dateTo, sortBy, sortOrder, page, pageSize } = validatedFilters;
    const offset = (page - 1) * pageSize;

    // Get account info first
    const { data: account, error: accountError } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('id', account_id)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: 'Akun tidak ditemukan' });
    }

    // Fetch GL entries manually
    let query = supabase
      .from('journal_entry_lines')
      .select(
        `
        id,
        journal_entry_id,
        account_id,
        debit,
        credit,
        description,
        reference_no,
        created_at,
        journal_entries!inner(
          id,
          entry_no,
          entry_date,
          description,
          total_debit,
          total_credit,
          status,
          created_at
        )
      `,
        { count: 'exact' }
      )
      .eq('account_id', account_id)
      .eq('journal_entries.status', 'posted');

    if (dateFrom) {
      query = query.gte('journal_entries.entry_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('journal_entries.entry_date', dateTo);
    }

    query = query.order('journal_entries.entry_date', { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + pageSize - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    // Format data to match GL structure
    const glData = data?.map((line: any) => ({
      id: line.id,
      account_id: line.account_id,
      account_code: account.account_code,
      account_name: account.account_name,
      account_type: account.account_type,
      entry_no: (line.journal_entries as any).entry_no,
      entry_date: (line.journal_entries as any).entry_date,
      entry_description: (line.journal_entries as any).description,
      line_description: line.description,
      debit: line.debit,
      credit: line.credit,
      reference_no: line.reference_no,
      opening_balance: account.opening_balance || 0,
      created_at: line.created_at,
    })) || [];

    return res.status(200).json({
      account,
      data: glData,
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error: any) {
    console.error('Error fetching general ledger:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Data tidak valid', details: error.errors });
    }
    return res.status(500).json({ error: 'Gagal mengambil data buku besar' });
  }
}
