import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { journalEntrySchema, journalEntryFiltersSchema } from '@/lib/validations/finance';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const filters = {
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
        dateFrom: req.query.dateFrom as string | undefined,
        dateTo: req.query.dateTo as string | undefined,
        account_id: req.query.account_id as string | undefined,
        sortBy: req.query.sortBy || 'entry_date',
        sortOrder: req.query.sortOrder || 'desc',
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
      };

      const validatedFilters = journalEntryFiltersSchema.parse(filters);
      const { page, pageSize, sortBy, sortOrder, search, status, dateFrom, dateTo } = validatedFilters;
      const offset = (page - 1) * pageSize;

      let query = supabase.from('journal_entries').select('*', { count: 'exact' });

      if (search) {
        query = query.or(`entry_no.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (dateFrom) {
        query = query.gte('entry_date', dateFrom);
      }

      if (dateTo) {
        query = query.lte('entry_date', dateTo);
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      query = query.range(offset, offset + pageSize - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      return res.status(200).json({
        data: data || [],
        pagination: {
          total: count || 0,
          page,
          pageSize,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      });
    } else if (req.method === 'POST') {
      const validatedData = journalEntrySchema.parse(req.body);

      // Calculate totals
      const totalDebit = validatedData.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
      const totalCredit = validatedData.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

      // Double-check debit = credit
      if (Math.abs(totalDebit - totalCredit) >= 0.01) {
        return res.status(400).json({ error: 'Total Debit dan Kredit harus sama' });
      }

      // Create the journal entry
      const { data: journalEntry, error: insertError } = await supabase
        .from('journal_entries')
        .insert([
          {
            entry_date: validatedData.entry_date,
            description: validatedData.description,
            notes: validatedData.notes || null,
            total_debit: totalDebit,
            total_credit: totalCredit,
            status: 'posted', // Auto-post as per MVP requirement
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Insert journal entry lines
      const lines = validatedData.lines.map((line) => ({
        journal_entry_id: journalEntry.id,
        account_id: line.account_id,
        debit: line.debit || 0,
        credit: line.credit || 0,
        description: line.description || null,
        reference_no: line.reference_no || null,
      }));

      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(lines);

      if (linesError) {
        // Rollback journal entry if lines insertion fails
        await supabase.from('journal_entries').delete().eq('id', journalEntry.id);
        throw linesError;
      }

      return res.status(201).json({ ...journalEntry, lines: validatedData.lines });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Data tidak valid', details: error.errors });
    }
    return res.status(500).json({ error: 'Gagal memproses permintaan' });
  }
}
