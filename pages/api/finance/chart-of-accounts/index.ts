import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  chartOfAccountSchema,
  chartOfAccountFiltersSchema,
} from '@/lib/validations/finance';

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
        account_type: req.query.account_type as string | undefined,
        status: req.query.status as string | undefined,
        parent_id: req.query.parent_id as string | undefined,
        sortBy: req.query.sortBy || 'account_code',
        sortOrder: req.query.sortOrder || 'asc',
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
      };

      const validatedFilters = chartOfAccountFiltersSchema.parse(filters);
      const { page, pageSize, sortBy, sortOrder, search, account_type, status } = validatedFilters;
      const offset = (page - 1) * pageSize;

      let query = supabase.from('chart_of_accounts').select('*', { count: 'exact' });

      if (search) {
        query = query.or(`account_code.ilike.%${search}%,account_name.ilike.%${search}%`);
      }

      if (account_type && account_type !== 'all') {
        query = query.eq('account_type', account_type);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
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
      const validatedData = chartOfAccountSchema.parse(req.body);

      // Check if account code already exists
      const { data: existing } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .eq('account_code', validatedData.account_code)
        .single();

      if (existing) {
        return res.status(400).json({ error: 'Kode akun sudah terdaftar' });
      }

      // If parent_id provided, verify it exists
      if (validatedData.parent_id) {
        const { data: parent } = await supabase
          .from('chart_of_accounts')
          .select('id')
          .eq('id', validatedData.parent_id)
          .single();

        if (!parent) {
          return res.status(404).json({ error: 'Akun induk tidak ditemukan' });
        }
      }

      const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert([validatedData])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(data);
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
