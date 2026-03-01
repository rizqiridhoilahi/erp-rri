'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJournalEntries } from '@/hooks/useFinance';
import { JournalEntryForm } from '@/components/forms/JournalEntryForm';
import { JournalEntry } from '@/lib/validations/finance';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function CreateJournalEntryPage() {
  const router = useRouter();
  const { create, loading } = useJournalEntries();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: JournalEntry) => {
    setSubmitError(null);
    try {
      await create(data);
      router.push('/finance/journal-entries');
    } catch (error: any) {
      setSubmitError(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Buat Jurnal</h1>
        <p className="text-gray-600">Entri jurnal umum baru ke sistem</p>
      </div>

      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <JournalEntryForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
}
