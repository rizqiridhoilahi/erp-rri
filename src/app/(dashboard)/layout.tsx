import { ReactNode } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - will be implemented later */}
      <aside className="hidden md:block w-64 bg-white border-r border-gray-200">
        Sidebar placeholder
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome to ERP RRI System</p>
        </div>
        {children}
      </main>
    </div>
  );
}