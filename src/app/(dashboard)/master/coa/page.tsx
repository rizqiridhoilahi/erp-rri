import { Link } from 'next/link';
import { supabase } from '@/lib/db/client';

export default async function CoaPage() {
  // Fetch coa data from database
  const { data: coaData, error } = await supabase
    .from('coa')
    .select(`
      id,
      kode,
      nama,
      tipe,
      induk!inner(nama),
      keterangan,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching coa:', error);
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Chart of Accounts</h1>
        <p className="text-red-500">Error loading data: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chart of Accounts</h1>
        <Link href="/dashboard/master/coa/tambah" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          Tambah Akun
        </Link>
      </div>

      {!coaData || coaData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Belum ada data akun. Silakan tambah akun pertama.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Akun
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akun Induk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keterangan
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
              {coaData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.kode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tipe}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.induk?.nama || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.keterangan || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      true  // Assuming all COA entries are active by default
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link 
                      href={`/dashboard/master/coa/${item.id}/edit`} 
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
  if (window.confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
    alert('Delete functionality will be implemented with Server Actions');
    window.location.reload();
  }
}