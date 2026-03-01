import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { journalEntrySchema } from '@/lib/validations/finance';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID tidak valid' });
  }

  try {
    if (req.method === 'GET') {
      const { data: journalEntry, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !journalEntry) {
        return res.status(404).json({ error: 'Jurnal tidak ditemukan' });
      }

      // Fetch journal entry lines with account info
      const { data: lines, error: linesError } = await supabase
        .from('journal_entry_lines')
        .select(`*, chart_of_accounts(id, account_code, account_name, account_type)`)
        .eq('journal_entry_id', id);

      if (linesError) throw linesError;

      return res.status(200).json({ ...journalEntry, lines: lines || [] });
    } else if (req.method === 'PUT') {
      const validatedData = journalEntrySchema.parse(req.body);

      // Check if journal entry can be edited (only draft entries)
      const { data: existing } = await supabase
        .from('journal_entries')
        .select('status')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({ error: 'Jurnal tidak ditemukan' });
      }

      if (existing.status !== 'draft') {
        return res.status(400).json({ error: 'Hanya jurnal dengan status Draft yang dapat diubah' });
      }

      // Calculate totals
      const totalDebit = validatedData.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
      const totalCredit = validatedData.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

      // Double-check debit = credit
      if (Math.abs(totalDebit - totalCredit) >= 0.01) {
        return res.status(400).json({ error: 'Total Debit dan Kredit harus sama' });
      }

      // Update journal entry header
      const { error: updateError } = await supabase
        .from('journal_entries')
        .update({
          entry_date: validatedData.entry_date,
          description: validatedData.description,
          notes: validatedData.notes || null,
          total_debit: totalDebit,
          total_credit: totalCredit,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Delete old lines
      const { error: deleteError } = await supabase
        .from('journal_entry_lines')
        .delete()
        .eq('journal_entry_id', id);

      if (deleteError) throw deleteError;

      // Insert new lines
      const lines = validatedData.lines.map((line) => ({
        journal_entry_id: id,
        account_id: line.account_id,
        debit: line.debit || 0,
        credit: line.credit || 0,
        description: line.description || null,
        reference_no: line.reference_no || null,
      }));

      const { error: insertError } = await supabase
        .from('journal_entry_lines')
        .insert(lines);

      if (insertError) throw insertError;

      // Fetch updated data
      const { data: updatedEntry } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', id)
        .single();

      return res.status(200).json(updatedEntry);
    } else if (req.method === 'DELETE') {
      // Check if journal entry exists and get its status
      const { data: existing } = await supabase
        .from('journal_entries')
        .select('status')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({ error: 'Jurnal tidak ditemukan' });
      }

      // Only allow deletion of draft entries
      if (existing.status !== 'draft') {
        return res.status(400).json({ error: 'Hanya jurnal dengan status Draft yang dapat dihapus' });
      }

      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true });
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
