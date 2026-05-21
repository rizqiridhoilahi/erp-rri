"use client";

import { useState } from 'react';
import { apiFetch } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({ nama: z.string().min(2, { message: "Nama jabatan harus diisi" }), keterangan: z.string().optional() });
type FormValues = z.input<typeof schema>;

export default function TambahJabatanPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setLoading(true); setError(null); setSuccess(null);
    try {
      await apiFetch('/api/v1/master/jabatan', { method: 'POST', body: JSON.stringify({ nama: data.nama, keterangan: data.keterangan || null }) });
      setSuccess('Jabatan berhasil ditambahkan!'); reset();
      setTimeout(() => router.push('/dashboard/master/jabatan'), 2000);
    } catch (err) { setError(err instanceof Error ? err.message : 'Terjadi kesalahan'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6"><h1 className="text-2xl font-bold">Tambah Jabatan</h1></div>
      {success && <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500"><p className="text-green-700">{success}</p></div>}
      {error && <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500"><p className="text-red-700">{error}</p></div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Jabatan <span className="text-red-500">*</span></label>
          <input type="text" {...register('nama')} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nama ? 'border-red-500' : ''}`} />
          {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Keterangan</label>
          <textarea {...register('keterangan')} rows={3} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="pt-4">
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Simpan Jabatan'}
          </button>
        </div>
      </form>
      <div className="mt-6">
        <a href="/dashboard/master/jabatan" className="text-sm text-blue-600 hover:underline">Kembali ke Daftar Jabatan</a>
      </div>
    </div>
  );
}
