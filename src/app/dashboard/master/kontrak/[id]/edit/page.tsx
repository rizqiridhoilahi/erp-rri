"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { useRouter, usePathname } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const kontrakSchema = z.object({
  customerId: z.string().min(1, { message: "Customer harus dipilih" }),
  nama: z.string().min(2, { message: "Nama kontrak harus diisi" }),
  tanggalMulai: z.string().optional(),
  tanggalSelesai: z.string().optional(),
  isActive: z.boolean().default(true),
});

type KontrakFormValues = z.input<typeof kontrakSchema>;

export default function EditKontrakPage() {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname.split('/').pop();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<KontrakFormValues>({
    resolver: zodResolver(kontrakSchema),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customerOptions, setCustomerOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!id) return;
      try {
        const { data: customers } = await apiFetch<Array<{ id: string; nama: string }>>('/api/v1/master/customer');

        if (cancelled) return;

        setCustomerOptions(customers.map(item => ({
          value: item.id,
          label: item.nama,
        })));

        const { data: kontrakData } = await apiFetch<{
          customer_id: string; nama: string;
          tanggal_mulai: string | null; tanggal_selesai: string | null;
          is_active: boolean;
        }>(`/api/v1/master/kontrak/${id}`);

        if (cancelled) return;

        if (kontrakData) {
          reset({
            customerId: kontrakData.customer_id,
            nama: kontrakData.nama,
            tanggalMulai: kontrakData.tanggal_mulai ? kontrakData.tanggal_mulai.split('T')[0] : '',
            tanggalSelesai: kontrakData.tanggal_selesai ? kontrakData.tanggal_selesai.split('T')[0] : '',
            isActive: kontrakData.is_active,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat data kontrak');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, reset]);

  const onSubmit = async (data: KontrakFormValues) => {
    if (!id) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch(`/api/v1/master/kontrak/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          customer_id: data.customerId,
          nama: data.nama,
          tanggal_mulai: data.tanggalMulai ? new Date(data.tanggalMulai).toISOString() : null,
          tanggal_selesai: data.tanggalSelesai ? new Date(data.tanggalSelesai).toISOString() : null,
          is_active: data.isActive,
        }),
      });

      setSuccess('Kontrak berhasil diperbarui!');

      setTimeout(() => {
        router.push('/dashboard/master/kontrak');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent h-12 w-12"></div>
        <p className="ml-4">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Kontrak</h1>
        <p className="text-sm text-gray-500">Formulir untuk mengedit data kontrak</p>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="customerId" className="block text-sm font-medium mb-1">
            Customer <span className="text-red-500">*</span>
          </label>
          <select
            id="customerId"
            {...register('customerId')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.customerId ? 'border-red-500' : ''}`}
          >
            <option value="">Pilih Customer</option>
            {customerOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.customerId && <p className="text-red-500 text-sm mt-1">{errors.customerId.message}</p>}
        </div>

        <div>
          <label htmlFor="nama" className="block text-sm font-medium mb-1">
            Nama Kontrak <span className="text-red-500">*</span>
          </label>
          <input
            id="nama"
            type="text"
            {...register('nama')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nama ? 'border-red-500' : ''}`}
          />
          {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>}
        </div>

        <div>
          <label htmlFor="tanggalMulai" className="block text-sm font-medium mb-1">
            Tanggal Mulai
          </label>
          <input
            id="tanggalMulai"
            type="date"
            {...register('tanggalMulai')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.tanggalMulai ? 'border-red-500' : ''}`}
          />
          {errors.tanggalMulai && <p className="text-red-500 text-sm mt-1">{errors.tanggalMulai.message}</p>}
        </div>

        <div>
          <label htmlFor="tanggalSelesai" className="block text-sm font-medium mb-1">
            Tanggal Selesai
          </label>
          <input
            id="tanggalSelesai"
            type="date"
            {...register('tanggalSelesai')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.tanggalSelesai ? 'border-red-500' : ''}`}
          />
          {errors.tanggalSelesai && <p className="text-red-500 text-sm mt-1">{errors.tanggalSelesai.message}</p>}
        </div>

        <div className="flex items-center">
          <label htmlFor="isActive" className="flex items-center text-sm font-medium mb-0">
            <input
              id="isActive"
              type="checkbox"
              {...register('isActive')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2">Aktif</span>
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Memperbarui...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="flex justify-between items-center">
          <a href="/dashboard/master/kontrak" className="text-sm text-blue-600 hover:underline">
            Kembali ke Daftar Kontrak
          </a>
        </div>
      </div>
    </div>
  );
}
