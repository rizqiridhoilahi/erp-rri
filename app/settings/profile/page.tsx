'use client'

import React, { useState } from 'react'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/useToast'
import { Camera } from 'lucide-react'

export default function ProfilePage() {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@erp-rri.com',
    phone: '+62 812 3456 7890',
    department: 'Management',
    role: 'Administrator',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Profil berhasil diperbarui', {
        description: 'Perubahan profil Anda telah disimpan.',
      })
    } catch (error) {
      toast.error('Gagal memperbarui profil', {
        description: 'Terjadi kesalahan saat menyimpan perubahan.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout username={formData.name}>
      <PageHeader
        title="Profile Settings"
        description="Kelola informasi profil dan pengaturan akun Anda"
      />

      <div className="grid gap-6 max-w-2xl">
        {/* Profile Picture Section */}
        <Card className="p-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-md">
              {formData.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Foto Profil
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                PNG, JPG, GIF sampai 10MB
              </p>
              <Button variant="outline" className="gap-2">
                <Camera className="h-4 w-4" />
                Upload Foto
              </Button>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Informasi Pribadi
          </h2>

          <div className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Masukkan email"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Masukkan nomor telepon"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="department">Departemen</Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled
                  placeholder="Departemen"
                  className="bg-gray-50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled
                  placeholder="Role"
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t flex gap-3">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <Button variant="outline">Batal</Button>
          </div>
        </Card>

        {/* Account Security */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Keamanan Akun
          </h2>

          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Ubah Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600">
              Logout dari Semua Device
            </Button>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-6 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Aksi Akun
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Tindakan berbahaya yang dapat mempengaruhi akun Anda
          </p>
          <Button variant="destructive" className="w-full">
            Hapus Akun
          </Button>
        </Card>
      </div>
    </MainLayout>
  )
}
