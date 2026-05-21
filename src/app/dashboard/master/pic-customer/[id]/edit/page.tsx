"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { useRouter, usePathname } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const picSchema = z.object({
  customerId: z.string().min(1, { message: "Customer harus dipilih" }),
  nama: z.string().min(2, { message: "Nama PIC harus diisi" }),
  jabatan: z.string().optional(),
  noHp: z.string().optional(),
  email: z.string().email({ message: "Email tidak valid" }).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

type PICFormValues = z.input<typeof picSchema>;

export default function EditPICCustomerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname.split('/').pop();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PICFormValues>({
    resolver: zodResolver(picSchema),
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

        const { data: picData } = await apiFetch<{
          customer_id: string; nama: string; jabatan: string | null;
          no_hp: string | null; email: string | null; is_active: boolean;
        }>(`/api/v1/master/pic-customer/${id}`);

        if (cancelled) return;

        if (picData) {
          reset({
            customerId: picData.customer_id,
            nama: picData.nama,
            jabatan: picData.jabatan || '',
            noHp: picData.no_hp || '',
            email: picData.email || '',
            isActive: picData.is_active,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat data PIC customer');
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

  const onSubmit = async (data: PICFormValues) => {
    if (!id) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch(`/api/v1/master/pic-customer/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          customer_id: data.customerId,
          nama: data.nama,
          jabatan: data.jabatan || null,
          no_hp: data.noHp || null,
          email: data.email || null,
          is_active: data.isActive,
        }),
      });

      setSuccess('PIC Customer berhasil diperbarui!');

      setTimeout(() => {
        router.push('/dashboard/master/pic-customer');
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
        <h1 className="text-2xl font-bold">Edit PIC Customer</h1>
        <p className="text-sm text-gray-500">Formulir untuk mengedit data PIC customer</p>
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
            Nama PIC <span className="text-red-500">*</span>
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
          <label htmlFor="jabatan" className="block text-sm font-medium mb-1">
            Jabatan
          </label>
          <input
            id="jabatan"
            type="text"
            {...register('jabatan')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.jabatan ? 'border-red-500' : ''}`}
          />
          {errors.jabatan && <p className="text-red-500 text-sm mt-1">{errors.jabatan.message}</p>}
        </div>

        <div>
          <label htmlFor="noHp" className="block text-sm font-medium mb-1">
            No. HP
          </label>
          <input
            id="noHp"
            type="text"
            {...register('noHp')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.noHp ? 'border-red-500' : ''}`}
          />
          {errors.noHp && <p className="text-red-500 text-sm mt-1">{errors.noHp.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
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
          <a href="/dashboard/master/pic-customer" className="text-sm text-blue-600 hover:underline">
            Kembali ke Daftar PIC Customer
          </a>
        </div>
      </div>
    </div>
  );
}
