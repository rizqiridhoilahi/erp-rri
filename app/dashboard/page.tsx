'use client'

import React from 'react'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { KPIWidget } from '@/components/dashboard/KPIWidget'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { TrendingUp, ShoppingCart, Users, DollarSign } from 'lucide-react'

export default function DashboardPage() {
  return (
    <MainLayout username="Admin">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your business overview."
        actions={
          <Button>Generate Report</Button>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <KPIWidget
          title="Total Revenue"
          value="Rp 125.750.000"
          change={12.5}
          icon={<DollarSign className="h-6 w-6" />}
          description="Vs bulan lalu"
        />
        <KPIWidget
          title="Total Orders"
          value="248"
          change={8.2}
          icon={<ShoppingCart className="h-6 w-6" />}
          description="Vs bulan lalu"
        />
        <KPIWidget
          title="Active Customers"
          value="1.248"
          change={3.1}
          icon={<Users className="h-6 w-6" />}
          description="Vs bulan lalu"
        />
        <KPIWidget
          title="Growth Rate"
          value="15.3%"
          change={5.4}
          icon={<TrendingUp className="h-6 w-6" />}
          description="Vs bulan lalu"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {/* Revenue Chart */}
        <div className="md:col-span-2">
          <RevenueChart type="line" title="Revenue Trend (6 Bulan)" />
        </div>

        {/* Sales Chart */}
        <SalesChart type="pie" title="Sales Distribution" />
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {/* Recent Orders */}
        <Card className="md:col-span-2">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Order #{1000 + i}</p>
                    <p className="text-sm text-gray-600">Customer {i} • {2} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      Rp {(1000000 * i).toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-green-600">Completed</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4">
              View All Orders →
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-3">
            <Button variant="outline" className="w-full justify-start">
              New Quotation
            </Button>
            <Button variant="outline" className="w-full justify-start">
              New Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Add Customer
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Add Product
            </Button>
          </div>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <p className="text-sm font-medium text-gray-900">API Server</p>
              </div>
              <p className="mt-1 text-sm text-gray-600">All systems operational</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <p className="text-sm font-medium text-gray-900">Database</p>
              </div>
              <p className="mt-1 text-sm text-gray-600">All systems operational</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <p className="text-sm font-medium text-gray-900">AI Services</p>
              </div>
              <p className="mt-1 text-sm text-gray-600">RRI AI is ready</p>
            </div>
          </div>
        </div>
      </Card>
    </MainLayout>
  )
}
