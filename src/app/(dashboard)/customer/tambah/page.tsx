"use client";

import { useState } from 'react';
import { apiFetch } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const customerSchema = z.object({
  nama: z.string().min(2, { message: "Nama customer harus diisi" }),
  kode: z.string().min(2, { message: "Kode customer harus diisi" }),
  alamat: z.string().optional(),
  kontak: z.string().optional(),
  termsOfPayment: z.enum(['Net 30', 'Net 60', 'Cash', 'Custom'], {
    message: "Pilih terms of payment yang valid",
  }),
  isActive: z.boolean().default(true),
});

type CustomerFormValues = z.input<typeof customerSchema>;

export default function TambahCustomerPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (data: CustomerFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch('/api/v1/master/customer', {
        method: 'POST',
        body: JSON.stringify({
          nama: data.nama,
          kode: data.kode,
          alamat: data.alamat,
          kontak: data.kontak,
          terms_of_payment: data.termsOfPayment,
          is_active: data.isActive,
        }),
      });

      setSuccess('Customer berhasil ditambahkan!');
      reset();
      
      setTimeout(() => {
        router.push('/dashboard/customer');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tambah Customer Baru</h1>
        <p className="text-sm text-gray-500">Formulir untuk menambahkan data customer baru</p>
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
            Nama Customer <span className="text-red-500">*</span>
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
            Kode Customer <span className="text-red-500">*</span>
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
          <label htmlFor="alamat" className="block text-sm font-medium mb-1">
            Alamat
          </label>
          <input
            id="alamat"
            type="text"
            {...register('alamat')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.alamat ? 'border-red-500' : ''
            }`}
          />
          {errors.alamat && <p className="text-red-500 text-sm mt-1">{errors.alamat.message}</p>}
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
            Terms of Payment <span className="text-red-500">*</span>
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
            {loading ? 'Menyimpan...' : 'Simpan Customer'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="flex justify-between items-center">
          <a href="/dashboard/customer" className="text-sm text-blue-600 hover:underline">
            Kembali ke Daftar Customer
          </a>
        </div>
      </div>
    </div>
  );
}
