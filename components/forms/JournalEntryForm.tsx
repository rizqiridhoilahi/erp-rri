import React, { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { journalEntrySchema, JournalEntry } from '@/lib/validations/finance';
import { useChartOfAccounts } from '@/hooks/useFinance';
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
import { Trash2, Plus } from 'lucide-react';

interface JournalEntryFormProps {
  initialData?: JournalEntry & { lines?: any[] };
  onSubmit: (data: JournalEntry) => Promise<void>;
  isLoading?: boolean;
}

export function JournalEntryForm({
  initialData,
  onSubmit,
  isLoading = false,
}: JournalEntryFormProps) {
  const { getList } = useChartOfAccounts();
  const [accounts, setAccounts] = React.useState<any[]>([]);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<JournalEntry>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: initialData || {
      entry_date: new Date().toISOString().split('T')[0],
      description: '',
      notes: '',
      lines: [
        { account_id: '', debit: 0, credit: 0, description: '' },
        { account_id: '', debit: 0, credit: 0, description: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const lines = watch('lines');

  // Fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const result = await getList({ pageSize: 100 });
        setAccounts(result.data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };
    fetchAccounts();
  }, [getList]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!lines) return { debit: 0, credit: 0, difference: 0 };

    const debit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
    const credit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
    const difference = Math.abs(debit - credit);

    return { debit, credit, difference };
  }, [lines]);

  const addLineItem = () => {
    append({ account_id: '', debit: 0, credit: 0, description: '' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Jurnal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entry_date">Tanggal Jurnal *</Label>
              <Input
                id="entry_date"
                type="date"
                {...register('entry_date')}
                disabled={isLoading}
              />
              {errors.entry_date && (
                <span className="text-red-500 text-sm">{errors.entry_date.message}</span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Deskripsi *</Label>
            <Input
              id="description"
              placeholder="Contoh: Pembayaran Gaji Karyawan"
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <span className="text-red-500 text-sm">{errors.description.message}</span>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan (opsional)"
              {...register('notes')}
              disabled={isLoading}
              rows={3}
            />
            {errors.notes && (
              <span className="text-red-500 text-sm">{errors.notes.message}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Detail Jurnal</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLineItem}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Baris
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="p-4 border border-gray-200">
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`lines.${index}.account_id`}>Akun *</Label>
                  <Controller
                    control={control}
                    name={`lines.${index}.account_id`}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger disabled={isLoading}>
                          <SelectValue placeholder="Pilih akun" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.account_code} - {account.account_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.lines?.[index]?.account_id && (
                    <span className="text-red-500 text-sm">
                      {errors.lines[index]?.account_id?.message}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`lines.${index}.debit`}>Debit</Label>
                    <Input
                      id={`lines.${index}.debit`}
                      type="number"
                      step="0.01"
                      {...register(`lines.${index}.debit`, { valueAsNumber: true })}
                      disabled={isLoading}
                    />
                    {errors.lines?.[index]?.debit && (
                      <span className="text-red-500 text-sm">
                        {errors.lines[index]?.debit?.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`lines.${index}.credit`}>Kredit</Label>
                    <Input
                      id={`lines.${index}.credit`}
                      type="number"
                      step="0.01"
                      {...register(`lines.${index}.credit`, { valueAsNumber: true })}
                      disabled={isLoading}
                    />
                    {errors.lines?.[index]?.credit && (
                      <span className="text-red-500 text-sm">
                        {errors.lines[index]?.credit?.message}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor={`lines.${index}.description`}>Keterangan</Label>
                  <Input
                    id={`lines.${index}.description`}
                    placeholder="Keterangan untuk baris ini"
                    {...register(`lines.${index}.description`)}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex justify-end pt-2 border-t">
                  {fields.length > 2 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {errors.lines && typeof errors.lines === 'object' && 'message' in errors.lines && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {(errors.lines as any).message}
            </div>
          )}

          {/* Totals */}
          <Card className="bg-gray-50 p-4 mt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Total Debit</div>
                <div className="text-lg font-semibold">
                  {totals.debit.toLocaleString('id-ID', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Total Kredit</div>
                <div className="text-lg font-semibold">
                  {totals.credit.toLocaleString('id-ID', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Selisih</div>
                <div
                  className={`text-lg font-semibold ${
                    totals.difference < 0.01 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {totals.difference.toLocaleString('id-ID', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={isLoading}>
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading || totals.difference >= 0.01}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Menyimpan...' : 'Simpan Jurnal'}
        </Button>
      </div>
    </form>
  );
}
