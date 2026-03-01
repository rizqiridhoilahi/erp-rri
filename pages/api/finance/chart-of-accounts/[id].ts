import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { chartOfAccountSchema } from '@/lib/validations/finance';

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
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Akun tidak ditemukan' });
      }

      return res.status(200).json(data);
    } else if (req.method === 'PUT') {
      const validatedData = chartOfAccountSchema.parse(req.body);

      // Check if account code is already used by another account
      if (validatedData.account_code) {
        const { data: existing } = await supabase
          .from('chart_of_accounts')
          .select('id')
          .eq('account_code', validatedData.account_code)
          .neq('id', id)
          .single();

        if (existing) {
          return res.status(400).json({ error: 'Kode akun sudah terdaftar' });
        }
      }

      const { data, error } = await supabase
        .from('chart_of_accounts')
        .update(validatedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json(data);
    } else if (req.method === 'DELETE') {
      // Check if account has any journal entry lines
      const { data: journalLines } = await supabase
        .from('journal_entry_lines')
        .select('id')
        .eq('account_id', id)
        .limit(1);

      if (journalLines && journalLines.length > 0) {
        return res.status(400).json({ error: 'Akun ini sudah memiliki transaksi dan tidak dapat dihapus' });
      }

      // Check if account is a parent to other accounts
      const { data: children } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .eq('parent_id', id)
        .limit(1);

      if (children && children.length > 0) {
        return res.status(400).json({ error: 'Akun ini memiliki sub-akun dan tidak dapat dihapus' });
      }

      const { error } = await supabase
        .from('chart_of_accounts')
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
