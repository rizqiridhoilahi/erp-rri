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
  BarChart3,
  ChevronDown,
  X,
  Upload,
  Download,
  FileText,
  ClipboardList,
  Truck,
  Receipt,
  TrendingUp,
  Scale,
  ListOrdered,
  BookOpen,
  UserCog,
  Truck as TruckIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface MenuItemProps {
  icon: React.ReactNode
  iconColor?: string
  label: string
  href: string
  isActive: boolean
  badge?: number
}

interface MenuGroupProps {
  title: string
  items: MenuItemProps[]
}

const MenuItem = ({ icon, iconColor = 'text-gray-500', label, href, isActive, badge }: MenuItemProps) => (
  <Link href={href}>
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
        isActive
          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
          : 'text-gray-700 hover:bg-gray-100'
      )}
    >
      <span className={cn('h-5 w-5', isActive ? 'text-blue-600' : iconColor)}>{icon}</span>
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
    { icon: <Package className="h-5 w-5" />, iconColor: 'text-green-600', label: 'Products', href: '/master-data/products' },
    { icon: <Users className="h-5 w-5" />, iconColor: 'text-purple-600', label: 'Customers', href: '/master-data/customers' },
    { icon: <UserCog className="h-5 w-5" />, iconColor: 'text-orange-600', label: 'Suppliers', href: '/master-data/suppliers' },
  ]

  const salesItems = [
    { icon: <FileText className="h-5 w-5" />, iconColor: 'text-blue-600', label: 'Quotations', href: '/sales/quotations' },
    { icon: <ClipboardList className="h-5 w-5" />, iconColor: 'text-indigo-600', label: 'Sales Orders', href: '/sales/sales-orders' },
    { icon: <Truck className="h-5 w-5" />, iconColor: 'text-teal-600', label: 'Delivery Orders', href: '/sales/delivery-orders' },
  ]

  const financeItems = [
    { icon: <Receipt className="h-5 w-5" />, iconColor: 'text-green-600', label: 'Invoices', href: '/finance/invoices' },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      iconColor: 'text-emerald-600',
      label: 'Income Statement',
      href: '/finance/income-statement',
    },
    {
      icon: <Scale className="h-5 w-5" />,
      iconColor: 'text-cyan-600',
      label: 'Balance Sheet',
      href: '/finance/balance-sheet',
    },
    {
      icon: <ListOrdered className="h-5 w-5" />,
      iconColor: 'text-sky-600',
      label: 'Trial Balance',
      href: '/finance/trial-balance',
    },
    { icon: <BookOpen className="h-5 w-5" />, iconColor: 'text-amber-600', label: 'Chart of Accounts', href: '/finance/chart-of-accounts' },
  ]

  const dataToolsItems = [
    { icon: <Upload className="h-5 w-5" />, iconColor: 'text-violet-600', label: 'Import Data', href: '/data-import' },
    { icon: <Download className="h-5 w-5" />, iconColor: 'text-pink-600', label: 'Export Data', href: '/data-export' },
  ]

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
          'fixed left-0 top-0 z-50 h-screen w-64 overflow-y-auto border-r bg-white shadow-lg transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
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
        <div className="p-4 space-y-2">
          {/* Dashboard */}
          <MenuItem
            icon={<LayoutDashboard className="h-5 w-5" />}
            iconColor="text-blue-600"
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

          {/* Data Tools */}
          <MenuGroup title="Data Tools" items={dataToolsItems.map((item) => ({
            ...item,
            isActive: isActive(item.href),
          }))} />
        </div>
      </aside>
    </>
  )
}
