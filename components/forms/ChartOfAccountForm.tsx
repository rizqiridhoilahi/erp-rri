import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { chartOfAccountSchema, ChartOfAccount, chartOfAccountTypeEnum } from '@/lib/validations/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface ChartOfAccountFormProps {
  initialData?: ChartOfAccount & { parentOptions?: any[] };
  parentOptions?: any[];
  onSubmit: (data: ChartOfAccount) => Promise<void>;
  isLoading?: boolean;
}

const accountTypes = [
  { value: 'asset', label: 'Aktiva (Asset)' },
  { value: 'liability', label: 'Kewajiban (Liability)' },
  { value: 'equity', label: 'Modal (Equity)' },
  { value: 'revenue', label: 'Pendapatan (Revenue)' },
  { value: 'expense', label: 'Beban (Expense)' },
  { value: 'other_income', label: 'Penghasilan Lain (Other Income)' },
  { value: 'other_expense', label: 'Beban Lain (Other Expense)' },
];

export function ChartOfAccountForm({
  initialData,
  parentOptions = [],
  onSubmit,
  isLoading = false,
}: ChartOfAccountFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ChartOfAccount>({
    resolver: zodResolver(chartOfAccountSchema),
    defaultValues: initialData || {
      account_code: '',
      account_name: '',
      account_type: 'asset',
      status: 'active',
      opening_balance: 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? 'Edit Akun' : 'Buat Akun Baru'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account_code">Kode Akun *</Label>
              <Input
                id="account_code"
                placeholder="Contoh: 1100"
                {...register('account_code')}
                disabled={isLoading}
              />
              {errors.account_code && (
                <span className="text-red-500 text-sm">{errors.account_code.message}</span>
              )}
            </div>

            <div>
              <Label htmlFor="account_type">Tipe Akun *</Label>
              <Controller
                control={control}
                name="account_type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="account_type" disabled={isLoading}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.account_type && (
                <span className="text-red-500 text-sm">{errors.account_type.message}</span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="account_name">Nama Akun *</Label>
            <Input
              id="account_name"
              placeholder="Contoh: Kas"
              {...register('account_name')}
              disabled={isLoading}
            />
            {errors.account_name && (
              <span className="text-red-500 text-sm">{errors.account_name.message}</span>
            )}
          </div>

          <div>
            <Label htmlFor="parent_id">Akun Induk (Opsional)</Label>
            <Controller
              control={control}
              name="parent_id"
              render={({ field }) => (
                <Select value={field.value || ''} onValueChange={(val) => field.onChange(val || null)}>
                  <SelectTrigger id="parent_id" disabled={isLoading}>
                    <SelectValue placeholder="Pilih akun induk (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tidak ada (Top Level)</SelectItem>
                    {parentOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.account_code} - {option.account_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label htmlFor="opening_balance">Saldo Awal</Label>
            <Input
              id="opening_balance"
              type="number"
              step="0.01"
              placeholder="0"
              {...register('opening_balance', { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.opening_balance && (
              <span className="text-red-500 text-sm">{errors.opening_balance.message}</span>
            )}
          </div>

          <div>
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi akun..."
              {...register('description')}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? 'Menyimpan...' : 'Simpan Akun'}
        </Button>
      </div>
    </form>
  );
}
