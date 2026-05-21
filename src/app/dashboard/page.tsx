import Link from 'next/link'

const menuItems = [
  { href: '/dashboard/master/barang', label: 'Master Barang', desc: 'Kelola data barang dan inventaris' },
  { href: '/dashboard/master/supplier', label: 'Master Supplier', desc: 'Kelola data supplier' },
  { href: '/dashboard/master/customer', label: 'Master Customer', desc: 'Kelola data customer' },
  { href: '/dashboard/master/kontrak', label: 'Master Kontrak', desc: 'Kelola data kontrak' },
  { href: '/dashboard/master/coa', label: 'Chart of Accounts', desc: 'Kelola akun akuntansi' },
  { href: '/dashboard/master/jabatan', label: 'Master Jabatan', desc: 'Kelola data jabatan' },
  { href: '/dashboard/master/karyawan', label: 'Master Karyawan', desc: 'Kelola data karyawan' },
  { href: '/dashboard/master/kategori-barang', label: 'Kategori Barang', desc: 'Kelola kategori barang' },
  { href: '/dashboard/master/pic-customer', label: 'PIC Customer', desc: 'Kelola PIC customer' },
  { href: '/api-docs', label: 'API Documentation', desc: 'Dokumentasi API dengan Scalar UI' },
]

export default function DashboardPage() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-900">{item.label}</h3>
            <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
