import { Link } from 'next/link';
import { supabase } from '@/lib/db/client';

export default async function KontrakPage() {
  // Fetch kontrak data from database
  const { data: kontrakData, error } = await supabase
    .from('kontrak')
    .select(`
      id,
      nama,
      customer!inner(nama),
      tanggal_mulai,
      tanggal_selesai,
      is_active,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching kontrak:', error);
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Data Kontrak</h1>
        <p className="text-red-500">Error loading data: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Data Kontrak</h1>
        <Link href="/dashboard/master/kontrak/tambah" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          Tambah Kontrak
        </Link>
      </div>

      {!kontrakData || kontrakData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Belum ada data kontrak. Silakan tambah kontrak pertama.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Kontrak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Mulai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Selesai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kontrakData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.customer?.nama || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tanggal_mulai || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tanggal_selesai || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.is_active ? 'Active' : 'Non-Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link 
                      href={`/dashboard/master/kontrak/${item.id}/edit`} 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
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

// Placeholder function for delete
async function handleDelete(id: string) {
  if (window.confirm('Apakah Anda yakin ingin menghapus kontrak ini?')) {
    alert('Delete functionality will be implemented with Server Actions');
    window.location.reload();
  }
}