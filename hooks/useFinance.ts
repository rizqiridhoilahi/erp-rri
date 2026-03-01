import { useState, useCallback } from 'react';
import {
  ChartOfAccount,
  ChartOfAccountFilters,
  JournalEntry,
  JournalEntryFilters,
  GeneralLedgerFilters,
  TrialBalanceFilters,
} from '@/lib/validations/finance';

export function useChartOfAccounts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getList = useCallback(
    async (filters?: Partial<ChartOfAccountFilters>) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.account_type) params.append('account_type', filters.account_type);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.sortBy) params.append('sortBy', filters.sortBy);
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
        params.append('page', String(filters?.page || 1));
        params.append('pageSize', String(filters?.pageSize || 10));

        const response = await fetch(`/api/finance/chart-of-accounts?${params}`);
        if (!response.ok) throw new Error('Gagal mengambil data akun');

        const data = await response.json();
        return data;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getOne = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/finance/chart-of-accounts/${id}`);
      if (!response.ok) throw new Error('Akun tidak ditemukan');

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: ChartOfAccount) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/finance/chart-of-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal membuat akun');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: ChartOfAccount) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/finance/chart-of-accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal mengubah akun');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const delete_ = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/finance/chart-of-accounts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal menghapus akun');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getList,
    getOne,
    create,
    update,
    delete: delete_,
  };
}

export function useJournalEntries() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getList = useCallback(
    async (filters?: Partial<JournalEntryFilters>) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) params.append('dateTo', filters.dateTo);
        if (filters?.sortBy) params.append('sortBy', filters.sortBy);
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
        params.append('page', String(filters?.page || 1));
        params.append('pageSize', String(filters?.pageSize || 10));

        const response = await fetch(`/api/finance/journal-entries?${params}`);
        if (!response.ok) throw new Error('Gagal mengambil data jurnal');

        return await response.json();
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getOne = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/finance/journal-entries/${id}`);
      if (!response.ok) throw new Error('Jurnal tidak ditemukan');

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: JournalEntry) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/finance/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal membuat jurnal');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: JournalEntry) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/finance/journal-entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal mengubah jurnal');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const delete_ = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/finance/journal-entries/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal menghapus jurnal');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getList,
    getOne,
    create,
    update,
    delete: delete_,
  };
}

export function useGeneralLedger() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getByAccount = useCallback(
    async (filters: GeneralLedgerFilters) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append('account_id', filters.account_id);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        params.append('page', String(filters.page || 1));
        params.append('pageSize', String(filters.pageSize || 20));

        const response = await fetch(`/api/finance/general-ledger?${params}`);
        if (!response.ok) throw new Error('Gagal mengambil data buku besar');

        return await response.json();
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, getByAccount };
}

export function useTrialBalance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const get = useCallback(
    async (filters?: Partial<TrialBalanceFilters>) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.account_type) params.append('account_type', filters.account_type);
        if (filters?.status) params.append('status', filters.status);
        params.append('showZeroBalance', String(filters?.showZeroBalance || false));

        const response = await fetch(`/api/finance/trial-balance?${params}`);
        if (!response.ok) throw new Error('Gagal mengambil neraca saldo');

        return await response.json();
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, get };
}
