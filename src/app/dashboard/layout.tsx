import { ReactNode } from 'react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r border-gray-200">
        <div className="p-4">
          <Link href="/" className="flex items-center space-x-3 mb-6">
            <span className="text-xl font-bold text-blue-600">ERP RRI</span>
          </Link>
          <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              Dashboard
            </Link>
            <Link href="/dashboard/master/barang" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              Master Barang
            </Link>
            <Link href="/dashboard/master/supplier" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              Master Supplier
            </Link>
            <Link href="/dashboard/master/customer" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              Master Customer
            </Link>
            <Link href="/dashboard/master/pic-customer" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              Master PIC Customer
            </Link>
            <Link href="/dashboard/master/coa" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              Chart of Accounts
            </Link>
            <Link href="/dashboard/master/kontrak" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              Master Kontrak
            </Link>
            <Link href="/dashboard/master/kategori-barang" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              Kategori Barang
            </Link>
            <Link href="/dashboard/master/jabatan" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              Master Jabatan
            </Link>
            <Link href="/dashboard/master/karyawan" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              Master Karyawan
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome to ERP RRI System</p>
        </div>
        {children}
      </main>
    </div>
  );
}