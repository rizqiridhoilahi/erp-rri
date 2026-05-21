import Link from 'next/link';
import { supabase } from '@/lib/db/client';

export default async function JabatanPage() {
  const { data, error } = await supabase.from('jabatan').select('*').order('nama');

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Jabatan</h1>
        <p className="text-red-500">Error loading data: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Jabatan</h1>
        <Link href="/dashboard/master/jabatan/tambah" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Tambah Jabatan</Link>
      </div>
      {!data || data.length === 0 ? (
        <div className="text-center py-12"><p className="text-gray-500">Belum ada data jabatan.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.keterangan || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link href={`/dashboard/master/jabatan/${item.id}/edit`} className="text-blue-600 hover:text-blue-900">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
