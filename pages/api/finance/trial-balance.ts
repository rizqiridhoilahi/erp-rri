import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { trialBalanceFiltersSchema } from '@/lib/validations/finance';

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
      account_type: req.query.account_type as string | undefined,
      status: req.query.status as string | undefined,
      showZeroBalance: req.query.showZeroBalance === 'true' ? true : false,
      sortBy: req.query.sortBy || 'account_code',
      sortOrder: req.query.sortOrder || 'asc',
    };

    const validatedFilters = trialBalanceFiltersSchema.parse(filters);
    const { account_type, status, showZeroBalance, sortBy, sortOrder } = validatedFilters;

    // Get all active accounts
    let query = supabase.from('chart_of_accounts').select('*');

    if (account_type && account_type !== 'all') {
      query = query.eq('account_type', account_type);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    } else {
      query = query.eq('status', 'active');
    }

    const { data: accounts, error: accountsError } = await query;

    if (accountsError) throw accountsError;

    // Fetch all journal entry lines for posted entries
    const { data: journalLines } = await supabase
      .from('journal_entry_lines')
      .select(
        `
        account_id,
        debit,
        credit,
        journal_entries!inner(status)
      `
      )
      .eq('journal_entries.status', 'posted');

    // Group by account and calculate balances
    const balanceMap: { [key: string]: { debit: number; credit: number } } = {};

    journalLines?.forEach((line: any) => {
      const accountId = line.account_id;
      if (!balanceMap[accountId]) {
        balanceMap[accountId] = { debit: 0, credit: 0 };
      }
      balanceMap[accountId].debit += line.debit || 0;
      balanceMap[accountId].credit += line.credit || 0;
    });

    // Build trial balance
    const trialBalanceData = accounts
      ?.map((account: any) => {
        const balance = balanceMap[account.id];
        const opening = account.opening_balance || 0;

        // Calculate balance based on account type
        let debitBalance = 0;
        let creditBalance = 0;

        const netBalance =
          account.account_type === 'asset' ||
          account.account_type === 'expense' ||
          account.account_type === 'other_expense'
            ? (balance?.debit || 0) - (balance?.credit || 0) + opening
            : (balance?.credit || 0) - (balance?.debit || 0) + opening;

        if (netBalance >= 0) {
          debitBalance =
            account.account_type === 'liability' ||
            account.account_type === 'equity' ||
            account.account_type === 'revenue' ||
            account.account_type === 'other_income'
              ? 0
              : netBalance;
          creditBalance =
            account.account_type === 'liability' ||
            account.account_type === 'equity' ||
            account.account_type === 'revenue' ||
            account.account_type === 'other_income'
              ? netBalance
              : 0;
        } else {
          debitBalance = Math.abs(netBalance);
          creditBalance = 0;
        }

        return {
          id: account.id,
          account_code: account.account_code,
          account_name: account.account_name,
          account_type: account.account_type,
          opening_balance: opening,
          balance: netBalance,
          debit_balance: debitBalance,
          credit_balance: creditBalance,
        };
      })
      .filter((row: any) => (showZeroBalance ? true : Math.abs(row.balance) > 0.01));

    // Sort
    const sorted = trialBalanceData?.sort((a: any, b: any) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'account_code' || sortBy === 'account_name') {
        return sortOrder === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // Calculate totals
    const totalDebit = sorted?.reduce((sum: number, row: any) => sum + (row.debit_balance || 0), 0) || 0;
    const totalCredit = sorted?.reduce((sum: number, row: any) => sum + (row.credit_balance || 0), 0) || 0;

    return res.status(200).json({
      data: sorted || [],
      totals: {
        total_debit: totalDebit,
        total_credit: totalCredit,
        difference: Math.abs(totalDebit - totalCredit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching trial balance:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Data tidak valid', details: error.errors });
    }
    return res.status(500).json({ error: 'Gagal mengambil data neraca saldo' });
  }
}
