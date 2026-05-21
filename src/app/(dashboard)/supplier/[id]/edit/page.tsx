"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { useRouter, usePathname } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const supplierSchema = z.object({
  nama: z.string().min(2, { message: "Nama supplier harus diisi" }),
  kode: z.string().min(2, { message: "Kode supplier harus diisi" }),
  namaToko: z.string().optional(),
  linkToko: z.string().optional(),
  noRekening: z.string().optional(),
  kontak: z.string().optional(),
  termsOfPayment: z.enum(['Net 30', 'Net 60', 'Cash', 'Custom'], {
    message: "Pilih terms of payment yang valid",
  }).optional(),
  isMarketplace: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type SupplierFormValues = z.input<typeof supplierSchema>;

export default function EditSupplierPage() {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname.split('/').pop();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!id) return;
      try {
        const { data } = await apiFetch<{
          nama: string; kode: string; nama_toko: string | null;
          link_toko: string | null; no_rekening: string | null;
          kontak: string | null; terms_of_payment: string | null;
          is_marketplace: boolean; is_active: boolean;
        }>(`/api/v1/master/supplier/${id}`);

        if (cancelled) return;

        if (data) {
          reset({
            nama: data.nama,
            kode: data.kode,
            namaToko: data.nama_toko || '',
            linkToko: data.link_toko || '',
            noRekening: data.no_rekening || '',
            kontak: data.kontak || '',
            termsOfPayment: (data.terms_of_payment || undefined) as "Net 30" | "Net 60" | "Cash" | "Custom" | undefined,
            isMarketplace: data.is_marketplace,
            isActive: data.is_active,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat data supplier');
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

  const onSubmit = async (data: SupplierFormValues) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch(`/api/v1/master/supplier/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nama: data.nama,
          kode: data.kode,
          nama_toko: data.namaToko,
          link_toko: data.linkToko,
          no_rekening: data.noRekening,
          kontak: data.kontak,
          terms_of_payment: data.termsOfPayment,
          is_marketplace: data.isMarketplace,
          is_active: data.isActive,
        }),
      });

      setSuccess('Supplier berhasil diperbarui!');
      
      setTimeout(() => {
        router.push('/dashboard/supplier');
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
        <h1 className="text-2xl font-bold">Edit Supplier</h1>
        <p className="text-sm text-gray-500">Formulir untuk mengedit data supplier</p>
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
          <label htmlFor="nama" className="block text-sm font-medium mb-1">
            Nama Supplier <span className="text-red-500">*</span>
          </label>
          <input
            id="nama"
            type="text"
            {...register('nama')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.nama ? 'border-red-500' : ''
            }`}
          />
          {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>}
        </div>

        <div>
          <label htmlFor="kode" className="block text-sm font-medium mb-1">
            Kode Supplier <span className="text-red-500">*</span>
          </label>
          <input
            id="kode"
            type="text"
            {...register('kode')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.kode ? 'border-red-500' : ''
            }`}
          />
          {errors.kode && <p className="text-red-500 text-sm mt-1">{errors.kode.message}</p>}
        </div>

        <div>
          <label htmlFor="namaToko" className="block text-sm font-medium mb-1">
            Nama Toko (Marketplace)
          </label>
          <input
            id="namaToko"
            type="text"
            {...register('namaToko')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.namaToko ? 'border-red-500' : ''
            }`}
          />
          {errors.namaToko && <p className="text-red-500 text-sm mt-1">{errors.namaToko.message}</p>}
        </div>

        <div>
          <label htmlFor="linkToko" className="block text-sm font-medium mb-1">
            Link Toko (Marketplace)
          </label>
          <input
            id="linkToko"
            type="text"
            {...register('linkToko')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.linkToko ? 'border-red-500' : ''
            }`}
          />
          {errors.linkToko && <p className="text-red-500 text-sm mt-1">{errors.linkToko.message}</p>}
        </div>

        <div>
          <label htmlFor="noRekening" className="block text-sm font-medium mb-1">
            No. Rekening
          </label>
          <input
            id="noRekening"
            type="text"
            {...register('noRekening')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.noRekening ? 'border-red-500' : ''
            }`}
          />
          {errors.noRekening && <p className="text-red-500 text-sm mt-1">{errors.noRekening.message}</p>}
        </div>

        <div>
          <label htmlFor="kontak" className="block text-sm font-medium mb-1">
            Kontak
          </label>
          <input
            id="kontak"
            type="text"
            {...register('kontak')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.kontak ? 'border-red-500' : ''
            }`}
          />
          {errors.kontak && <p className="text-red-500 text-sm mt-1">{errors.kontak.message}</p>}
        </div>

        <div>
          <label htmlFor="termsOfPayment" className="block text-sm font-medium mb-1">
            Terms of Payment
          </label>
          <select
            id="termsOfPayment"
            {...register('termsOfPayment')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.termsOfPayment ? 'border-red-500' : ''
            }`}
          >
            <option value="">Pilih Terms of Payment</option>
            <option value="Net 30">Net 30</option>
            <option value="Net 60">Net 60</option>
            <option value="Cash">Cash</option>
            <option value="Custom">Custom</option>
          </select>
          {errors.termsOfPayment && <p className="text-red-500 text-sm mt-1">{errors.termsOfPayment.message}</p>}
        </div>

        <div className="flex items-center">
          <label htmlFor="isMarketplace" className="flex items-center text-sm font-medium mb-0">
            <input
              id="isMarketplace"
              type="checkbox"
              {...register('isMarketplace')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2">Supplier Marketplace (Shopee/Tokopedia)</span>
          </label>
        </div>

        <div className="flex items-center mt-2">
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
          <a href="/dashboard/supplier" className="text-sm text-blue-600 hover:underline">
            Kembali ke Daftar Supplier
          </a>
        </div>
      </div>
    </div>
  );
}
