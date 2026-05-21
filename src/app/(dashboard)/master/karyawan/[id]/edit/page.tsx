"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { useRouter, usePathname } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  nik: z.string().min(2, { message: "NIK harus diisi" }),
  nama: z.string().min(2, { message: "Nama harus diisi" }),
  email: z.string().email({ message: "Email tidak valid" }),
  noHp: z.string().optional(),
  jabatanId: z.string().min(1, { message: "Jabatan harus dipilih" }),
  gajiPokok: z.coerce.number().nonnegative().optional(),
  tanggalMasuk: z.string().optional(),
  isActive: z.boolean().default(true),
});
type FormValues = z.input<typeof schema>;

export default function EditKaryawanPage() {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname.split('/').pop();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [jabatanOptions, setJabatanOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      try {
        const { data: jabatan } = await apiFetch<Array<{ id: string; nama: string }>>('/api/v1/master/jabatan');
        if (cancelled) return;
        setJabatanOptions(jabatan.map(item => ({ value: item.id, label: item.nama })));

        const { data } = await apiFetch<{
          nik: string; nama: string; email: string; no_hp: string | null;
          jabatan_id: string; gaji_pokok: number | null;
          tanggal_masuk: string | null; is_active: boolean;
        }>(`/api/v1/master/karyawan/${id}`);
        if (cancelled) return;
        if (data) {
          reset({
            nik: data.nik, nama: data.nama, email: data.email,
            noHp: data.no_hp || '', jabatanId: data.jabatan_id,
            gajiPokok: data.gaji_pokok || undefined,
            tanggalMasuk: data.tanggal_masuk ? data.tanggal_masuk.split('T')[0] : '',
            isActive: data.is_active,
          });
        }
      } catch (err) { if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat data karyawan'); }
      finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [id, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!id) return;
    setLoading(true); setError(null); setSuccess(null);
    try {
      await apiFetch(`/api/v1/master/karyawan/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nik: data.nik, nama: data.nama, email: data.email,
          no_hp: data.noHp || null, jabatan_id: data.jabatanId,
          gaji_pokok: data.gajiPokok || null,
          tanggal_masuk: data.tanggalMasuk ? new Date(data.tanggalMasuk).toISOString() : null,
          is_active: data.isActive,
        }),
      });
      setSuccess('Karyawan berhasil diperbarui!');
      setTimeout(() => router.push('/dashboard/master/karyawan'), 2000);
    } catch (err) { setError(err instanceof Error ? err.message : 'Terjadi kesalahan'); }
    finally { setLoading(false); }
  };

  if (isLoading) return <div className="min-h-[200px] flex items-center justify-center"><div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent h-12 w-12"></div><p className="ml-4">Memuat data...</p></div>;

  return (
    <div className="max-w-xl">
      <div className="mb-6"><h1 className="text-2xl font-bold">Edit Karyawan</h1></div>
      {success && <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500"><p className="text-green-700">{success}</p></div>}
      {error && <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500"><p className="text-red-700">{error}</p></div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">NIK <span className="text-red-500">*</span></label>
            <input type="text" {...register('nik')} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nik ? 'border-red-500' : ''}`} />
            {errors.nik && <p className="text-red-500 text-sm mt-1">{errors.nik.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nama <span className="text-red-500">*</span></label>
            <input type="text" {...register('nama')} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nama ? 'border-red-500' : ''}`} />
            {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" {...register('email')} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`} />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">No. HP</label>
            <input type="text" {...register('noHp')} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Jabatan <span className="text-red-500">*</span></label>
            <select {...register('jabatanId')} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.jabatanId ? 'border-red-500' : ''}`}>
              <option value="">Pilih Jabatan</option>
              {jabatanOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {errors.jabatanId && <p className="text-red-500 text-sm mt-1">{errors.jabatanId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gaji Pokok</label>
            <input type="number" min="0" step="0.01" {...register('gajiPokok')} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tanggal Masuk</label>
          <input type="date" {...register('tanggalMasuk')} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center">
          <label className="flex items-center text-sm font-medium">
            <input type="checkbox" {...register('isActive')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <span className="ml-2">Aktif</span>
          </label>
        </div>
        <div className="pt-4">
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Memperbarui...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
      <div className="mt-6">
        <a href="/dashboard/master/karyawan" className="text-sm text-blue-600 hover:underline">Kembali ke Daftar Karyawan</a>
      </div>
    </div>
  );
}
