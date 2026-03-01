'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Settings,
  BarChart3,
  LogOut,
  ChevronDown,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  href: string
  isActive: boolean
  badge?: number
}

interface MenuGroupProps {
  title: string
  items: MenuItemProps[]
}

const MenuItem = ({ icon, label, href, isActive, badge }: MenuItemProps) => (
  <Link href={href}>
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
        isActive
          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
          : 'text-gray-700 hover:bg-gray-100'
      )}
    >
      <span className="h-5 w-5">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </div>
  </Link>
)

const MenuGroup = ({ title, items }: MenuGroupProps) => (
  <div className="mb-6">
    <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
      {title}
    </h3>
    <div className="space-y-1">
      {items.map((item) => (
        <MenuItem key={item.href} {...item} />
      ))}
    </div>
  </div>
)

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => (pathname || '').startsWith(href)

  const masterDataItems = [
    { icon: <Package className="h-5 w-5" />, label: 'Products', href: '/master-data/products' },
    { icon: <Users className="h-5 w-5" />, label: 'Customers', href: '/master-data/customers' },
    { icon: <Users className="h-5 w-5" />, label: 'Suppliers', href: '/master-data/suppliers' },
  ]

  const salesItems = [
    { icon: <ShoppingCart className="h-5 w-5" />, label: 'Quotations', href: '/sales/quotations' },
    { icon: <ShoppingCart className="h-5 w-5" />, label: 'Sales Orders', href: '/sales/sales-orders' },
    { icon: <ShoppingCart className="h-5 w-5" />, label: 'Delivery Orders', href: '/sales/delivery-orders' },
  ]

  const financeItems = [
    { icon: <DollarSign className="h-5 w-5" />, label: 'Invoices', href: '/finance/invoices' },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Financial Statements',
      href: '/finance/financial-statements',
    },
    { icon: <DollarSign className="h-5 w-5" />, label: 'Chart of Accounts', href: '/finance/chart-of-accounts' },
  ]

  const adminItems = [
    { icon: <Users className="h-5 w-5" />, label: 'Users', href: '/admin/users' },
    { icon: <Settings className="h-5 w-5" />, label: 'Settings', href: '/admin/settings' },
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Audit Log', href: '/admin/audit-log' },
  ]

  const handleLogout = () => {
    // Handle logout logic
    router.push('/login')
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 overflow-y-auto border-r bg-white pt-16 shadow-lg transition-transform duration-200 md:relative md:translate-x-0 md:pt-0 md:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 md:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Sidebar content */}
        <div className="p-4 space-y-6">
          {/* Dashboard */}
          <MenuItem
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Dashboard"
            href="/dashboard"
            isActive={isActive('/dashboard') && !isActive('/master-data') && !isActive('/sales') && !isActive('/finance') && !isActive('/admin')}
          />

          {/* Master Data */}
          <MenuGroup title="Master Data" items={masterDataItems.map((item) => ({
            ...item,
            isActive: isActive(item.href),
          }))} />

          {/* Sales */}
          <MenuGroup title="Sales" items={salesItems.map((item) => ({
            ...item,
            isActive: isActive(item.href),
          }))} />

          {/* Finance */}
          <MenuGroup title="Finance" items={financeItems.map((item) => ({
            ...item,
            isActive: isActive(item.href),
          }))} />

          {/* Admin (if user has permission) */}
          <MenuGroup title="Admin" items={adminItems.map((item) => ({
            ...item,
            isActive: isActive(item.href),
          }))} />
        </div>

        {/* Logout button at bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  )
}
