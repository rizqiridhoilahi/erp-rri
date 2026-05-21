"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { useRouter, usePathname } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  nama: z.string().min(2, { message: "Nama kategori harus diisi" }),
  keterangan: z.string().optional(),
});

type FormValues = z.input<typeof schema>;

export default function EditKategoriPage() {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname.split('/').pop();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      try {
        const { data } = await apiFetch<{ nama: string; keterangan: string | null }>(`/api/v1/master/kategori-barang/${id}`);
        if (cancelled) return;
        if (data) reset({ nama: data.nama, keterangan: data.keterangan || '' });
      } catch (err) { if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat data'); }
      finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [id, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!id) return;
    setLoading(true); setError(null); setSuccess(null);
    try {
      await apiFetch(`/api/v1/master/kategori-barang/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ nama: data.nama, keterangan: data.keterangan || null }),
      });
      setSuccess('Kategori berhasil diperbarui!');
      setTimeout(() => router.push('/dashboard/master/kategori-barang'), 2000);
    } catch (err) { setError(err instanceof Error ? err.message : 'Terjadi kesalahan'); }
    finally { setLoading(false); }
  };

  if (isLoading) return <div className="min-h-[200px] flex items-center justify-center"><div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent h-12 w-12"></div><p className="ml-4">Memuat data...</p></div>;

  return (
    <div className="max-w-xl">
      <div className="mb-6"><h1 className="text-2xl font-bold">Edit Kategori Barang</h1></div>
      {success && <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500"><p className="text-green-700">{success}</p></div>}
      {error && <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500"><p className="text-red-700">{error}</p></div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="nama" className="block text-sm font-medium mb-1">Nama Kategori <span className="text-red-500">*</span></label>
          <input id="nama" type="text" {...register('nama')} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nama ? 'border-red-500' : ''}`} />
          {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>}
        </div>
        <div>
          <label htmlFor="keterangan" className="block text-sm font-medium mb-1">Keterangan</label>
          <textarea id="keterangan" {...register('keterangan')} rows={3} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="pt-4">
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Memperbarui...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
      <div className="mt-6">
        <a href="/dashboard/master/kategori-barang" className="text-sm text-blue-600 hover:underline">Kembali ke Daftar Kategori</a>
      </div>
    </div>
  );
}
