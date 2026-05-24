"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import Link from 'next/link';
import { supabase } from '@/lib/db/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

export default function SupplierPage() {
  const [supplierData, setSupplierData] = useState<Array<{
    id: string;
    nama: string;
    kode: string;
    nama_toko: string;
    link_toko: string;
    no_rekening: string;
    kontak: string;
    terms_of_payment: string;
    is_marketplace: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const { data, error } = await supabase
        .from('supplier')
        .select(`
          id,
          nama,
          kode,
          nama_toko,
          link_toko,
          no_rekening,
          kontak,
          terms_of_payment,
          is_marketplace,
          is_active,
          created_at,
          updated_at
        `)
        .order('nama', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setSupplierData(data || []);
      }
    };

    fetchSuppliers();
  }, []);

  if (error) {
    return <div>Error: {error?.toString()}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Supplier</h1>
        <Link href="/dashboard/supplier/tambah">
          <Button>Tambah Supplier</Button>
        </Link>
      </div>

      {supplierData.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Tidak ada data supplier</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Nama Toko</TableHead>
                  <TableHead>No. Rekening</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>TOP</TableHead>
                  <TableHead>Marketplace</TableHead>
                  <TableHead>Aktif</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierData.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.kode}</TableCell>
                    <TableCell>{supplier.nama}</TableCell>
                    <TableCell>{supplier.nama_toko || '-'}</TableCell>
                    <TableCell>{supplier.no_rekening || '-'}</TableCell>
                    <TableCell>{supplier.kontak || '-'}</TableCell>
                    <TableCell>{supplier.terms_of_payment || '-'}</TableCell>
                    <TableCell>
                      {supplier.is_marketplace ? 'Ya' : 'Tidak'}
                    </TableCell>
                    <TableCell>
                      {supplier.is_active ? (
                        <Badge variant="success">Aktif</Badge>
                      ) : (
                        <Badge variant="destructive">Nonaktif</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/supplier/${supplier.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
