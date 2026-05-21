"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const barangSchema = z.object({
  nama: z.string().min(2, { message: "Nama barang harus diisi" }),
  kode: z.string().min(2, { message: "Kode barang harus diisi" }),
  kategori_id: z.string().min(1, { message: "Kategori harus dipilih" }),
  satuan: z.string().min(1, { message: "Satuan harus diisi" }),
  spesifikasi: z.string().optional(),
  harga_beli_default: z.coerce.number().nonnegative().optional(),
  harga_jual_default: z.coerce.number().nonnegative().optional(),
  stok_minimum: z.coerce.number().nonnegative().default(0),
  is_active: z.boolean().default(true),
});
type BarangFormValues = z.input<typeof barangSchema>;

export default function TambahBarangPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<BarangFormValues>({ resolver: zodResolver(barangSchema) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [kategoriOptions, setKategoriOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiFetch<Array<{ id: string; nama: string }>>('/api/v1/master/kategori-barang');
        setKategoriOptions((data ?? []).map(item => ({ value: item.id, label: item.nama })));
      } catch { /* ignore */ }
    })();
  }, []);

  const onSubmit = async (data: BarangFormValues) => {
    setLoading(true); setError(null); setSuccess(null);
    try {
      await apiFetch('/api/v1/master/barang', { method: 'POST', body: JSON.stringify(data) });
      setSuccess('Barang berhasil ditambahkan!'); reset();
      setTimeout(() => router.push('/dashboard/master/barang'), 2000);
    } catch (err) { setError(err instanceof Error ? err.message : 'Terjadi kesalahan'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6"><h1 className="text-2xl font-bold">Tambah Barang</h1></div>
      {success && <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500"><p className="text-green-700">{success}</p></div>}
      {error && <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500"><p className="text-red-700">{error}</p></div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Barang <span className="text-red-500">*</span></label>
            <input type="text" {...register('nama')} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nama ? 'border-red-500' : ''}`} />
            {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kode Barang <span className="text-red-500">*</span></label>
            <input type="text" {...register('kode')} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.kode ? 'border-red-500' : ''}`} />
            {errors.kode && <p className="text-red-500 text-sm mt-1">{errors.kode.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kategori <span className="text-red-500">*</span></label>
          <select {...register('kategori_id')} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.kategori_id ? 'border-red-500' : ''}`}>
            <option value="">Pilih Kategori</option>
            {kategoriOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          {errors.kategori_id && <p className="text-red-500 text-sm mt-1">{errors.kategori_id.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Satuan <span className="text-red-500">*</span></label>
            <input type="text" {...register('satuan')} placeholder="pcs, kg, liter" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.satuan ? 'border-red-500' : ''}`} />
            {errors.satuan && <p className="text-red-500 text-sm mt-1">{errors.satuan.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stok Minimum</label>
            <input type="number" min="0" {...register('stok_minimum')} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Spesifikasi</label>
          <textarea {...register('spesifikasi')} rows={2} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Harga Beli Default</label>
            <input type="number" min="0" step="0.01" {...register('harga_beli_default')} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Harga Jual Default</label>
            <input type="number" min="0" step="0.01" {...register('harga_jual_default')} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex items-center">
          <label className="flex items-center text-sm font-medium">
            <input type="checkbox" {...register('is_active')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <span className="ml-2">Aktif</span>
          </label>
        </div>
        <div className="pt-4">
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Simpan Barang'}
          </button>
        </div>
      </form>
      <div className="mt-6">
        <a href="/dashboard/master/barang" className="text-sm text-blue-600 hover:underline">Kembali ke Daftar Barang</a>
      </div>
    </div>
  );
}
