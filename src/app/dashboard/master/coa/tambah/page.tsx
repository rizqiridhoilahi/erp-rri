"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const coaSchema = z.object({
  kode: z.string().min(1, { message: "Kode akun harus diisi" }),
  nama: z.string().min(2, { message: "Nama akun harus diisi" }),
  tipe: z.string().min(1, { message: "Tipe akun harus dipilih" }),
  indukId: z.string().optional(),
  keterangan: z.string().optional(),
});

type COAFormValues = z.infer<typeof coaSchema>;

const TIPE_OPTIONS = [
  { value: 'Asset', label: 'Asset' },
  { value: 'Liability', label: 'Liability' },
  { value: 'Equity', label: 'Equity' },
  { value: 'Revenue', label: 'Revenue' },
  { value: 'Expense', label: 'Expense' },
];

export default function TambahCOAPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<COAFormValues>({
    resolver: zodResolver(coaSchema),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [parentOptions, setParentOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiFetch<Array<{ id: string; kode: string; nama: string }>>('/api/v1/master/coa');
        setParentOptions(data.map(item => ({
          value: item.id,
          label: `${item.kode} - ${item.nama}`,
        })));
      } catch (err) {
        console.error('Error loading COA:', err);
      }
    })();
  }, []);

  const onSubmit = async (data: COAFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch('/api/v1/master/coa', {
        method: 'POST',
        body: JSON.stringify({
          kode: data.kode,
          nama: data.nama,
          tipe: data.tipe,
          induk_id: data.indukId || null,
          keterangan: data.keterangan || null,
        }),
      });

      setSuccess('Akun berhasil ditambahkan!');
      reset();

      setTimeout(() => {
        router.push('/dashboard/master/coa');
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
        <h1 className="text-2xl font-bold">Tambah Akun Baru</h1>
        <p className="text-sm text-gray-500">Formulir untuk menambahkan data akun (COA) baru</p>
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
          <label htmlFor="kode" className="block text-sm font-medium mb-1">
            Kode Akun <span className="text-red-500">*</span>
          </label>
          <input
            id="kode"
            type="text"
            {...register('kode')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.kode ? 'border-red-500' : ''}`}
          />
          {errors.kode && <p className="text-red-500 text-sm mt-1">{errors.kode.message}</p>}
        </div>

        <div>
          <label htmlFor="nama" className="block text-sm font-medium mb-1">
            Nama Akun <span className="text-red-500">*</span>
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
          <label htmlFor="tipe" className="block text-sm font-medium mb-1">
            Tipe Akun <span className="text-red-500">*</span>
          </label>
          <select
            id="tipe"
            {...register('tipe')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.tipe ? 'border-red-500' : ''}`}
          >
            <option value="">Pilih Tipe Akun</option>
            {TIPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.tipe && <p className="text-red-500 text-sm mt-1">{errors.tipe.message}</p>}
        </div>

        <div>
          <label htmlFor="indukId" className="block text-sm font-medium mb-1">
            Akun Induk
          </label>
          <select
            id="indukId"
            {...register('indukId')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.indukId ? 'border-red-500' : ''}`}
          >
            <option value="">Tidak Ada (Akun Utama)</option>
            {parentOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.indukId && <p className="text-red-500 text-sm mt-1">{errors.indukId.message}</p>}
        </div>

        <div>
          <label htmlFor="keterangan" className="block text-sm font-medium mb-1">
            Keterangan
          </label>
          <textarea
            id="keterangan"
            {...register('keterangan')}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.keterangan ? 'border-red-500' : ''}`}
          />
          {errors.keterangan && <p className="text-red-500 text-sm mt-1">{errors.keterangan.message}</p>}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Akun'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="flex justify-between items-center">
          <a href="/dashboard/master/coa" className="text-sm text-blue-600 hover:underline">
            Kembali ke Daftar Akun
          </a>
        </div>
      </div>
    </div>
  );
}
