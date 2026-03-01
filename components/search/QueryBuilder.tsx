'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  X,
  ChevronRight,
  Save,
  Copy,
} from 'lucide-react';

interface QueryCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  valueEnd?: string;
}

interface QueryGroup {
  id: string;
  logicalOperator: 'AND' | 'OR';
  conditions: (QueryCondition | QueryGroup)[];
}

interface QueryBuilderProps {
  onQueryChange?: (query: QueryGroup) => void;
  onSaveQuery?: (name: string, query: QueryGroup) => void;
  fields: { value: string; label: string }[];
  operators?: { value: string; label: string }[];
}

const defaultOperators = [
  { value: 'equals', label: 'Sama dengan' },
  { value: 'contains', label: 'Mengandung' },
  { value: 'startsWith', label: 'Dimulai dengan' },
  { value: 'endsWith', label: 'Berakhir dengan' },
  { value: 'greaterThan', label: 'Lebih besar dari' },
  { value: 'lessThan', label: 'Lebih kecil dari' },
  { value: 'between', label: 'Antara' },
  { value: 'isEmpty', label: 'Kosong' },
  { value: 'isNotEmpty', label: 'Tidak kosong' },
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function isQueryCondition(item: QueryCondition | QueryGroup): item is QueryCondition {
  return 'field' in item && 'operator' in item;
}

interface ConditionRowProps {
  condition: QueryCondition;
  fields: { value: string; label: string }[];
  operators: { value: string; label: string }[];
  onUpdate: (condition: QueryCondition) => void;
  onRemove: (id: string) => void;
}

function ConditionRow({
  condition,
  fields,
  operators,
  onUpdate,
  onRemove,
}: ConditionRowProps) {
  return (
    <div className="flex gap-2 p-3 bg-slate-50 rounded-lg items-end">
      <div className="flex-1">
        <label className="text-xs font-semibold block mb-1">Field</label>
        <Select
          value={condition.field}
          onValueChange={(value) => onUpdate({ ...condition, field: value })}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Pilih field" />
          </SelectTrigger>
          <SelectContent>
            {fields.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <label className="text-xs font-semibold block mb-1">Operator</label>
        <Select
          value={condition.operator}
          onValueChange={(value) => onUpdate({ ...condition, operator: value })}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Pilih operator" />
          </SelectTrigger>
          <SelectContent>
            {operators.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!['isEmpty', 'isNotEmpty'].includes(condition.operator) && (
        <div className="flex-1">
          <label className="text-xs font-semibold block mb-1">Nilai</label>
          <Input
            value={condition.value}
            onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
            placeholder="Nilai"
            className="h-9"
          />
        </div>
      )}

      {condition.operator === 'between' && (
        <div className="flex-1">
          <label className="text-xs font-semibold block mb-1">Sampai</label>
          <Input
            value={condition.valueEnd || ''}
            onChange={(e) => onUpdate({ ...condition, valueEnd: e.target.value })}
            placeholder="Nilai akhir"
            className="h-9"
          />
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(condition.id)}
        className="text-red-500 hover:text-red-700"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function QueryBuilder({
  onQueryChange,
  onSaveQuery,
  fields,
  operators = defaultOperators,
}: QueryBuilderProps) {
  const [query, setQuery] = useState<QueryGroup>({
    id: generateId(),
    logicalOperator: 'AND',
    conditions: [
      {
        id: generateId(),
        field: '',
        operator: 'contains',
        value: '',
      } as QueryCondition,
    ],
  });

  const [queryName, setQueryName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleAddCondition = () => {
    setQuery({
      ...query,
      conditions: [
        ...query.conditions,
        {
          id: generateId(),
          field: '',
          operator: 'contains',
          value: '',
        } as QueryCondition,
      ],
    });
  };

  const handleUpdateCondition = (updatedCondition: QueryCondition) => {
    setQuery({
      ...query,
      conditions: query.conditions.map((c) =>
        isQueryCondition(c) && c.id === updatedCondition.id ? updatedCondition : c
      ),
    });
  };

  const handleRemoveCondition = (id: string) => {
    const conditions = query.conditions.filter((c) =>
      !isQueryCondition(c) || c.id !== id
    );
    if (conditions.length > 0) {
      setQuery({ ...query, conditions });
    }
  };

  const handleSaveQuery = () => {
    if (queryName.trim()) {
      onSaveQuery?.(queryName, query);
      setQueryName('');
      setShowSaveForm(false);
    }
  };

  const handleApplyQuery = () => {
    onQueryChange?.(query);
  };

  const generateQueryString = (): string => {
    const conditions = query.conditions
      .filter(isQueryCondition)
      .map((c) => {
        const fieldLabel = fields.find((f) => f.value === c.field)?.label || c.field;
        const operatorLabel = operators.find((o) => o.value === c.operator)?.label || c.operator;

        if (c.operator === 'between') {
          return `${fieldLabel} ${operatorLabel} ${c.value} dan ${c.valueEnd}`;
        }
        if (['isEmpty', 'isNotEmpty'].includes(c.operator)) {
          return `${fieldLabel} ${operatorLabel}`;
        }
        return `${fieldLabel} ${operatorLabel} ${c.value}`;
      });

    return conditions.join(` ${query.logicalOperator} `);
  };

  return (
    <Card className="w-full p-6 bg-white space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Visual Query Builder</h3>

        {/* Logical Operator */}
        <div className="mb-4 flex items-center gap-2">
          <label className="text-sm font-semibold">Operator Logika:</label>
          <Select
            value={query.logicalOperator}
            onValueChange={(value) =>
              setQuery({ ...query, logicalOperator: value as 'AND' | 'OR' })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conditions */}
        <div className="space-y-3">
          {query.conditions.map((condition, index) => {
            if (!isQueryCondition(condition)) return null;

            return (
              <div key={condition.id}>
                {index > 0 && (
                  <div className="flex items-center my-2">
                    <Badge variant="secondary" className="mx-auto">
                      {query.logicalOperator}
                    </Badge>
                  </div>
                )}
                <ConditionRow
                  condition={condition}
                  fields={fields}
                  operators={operators}
                  onUpdate={handleUpdateCondition}
                  onRemove={handleRemoveCondition}
                />
              </div>
            );
          })}
        </div>

        {/* Add Condition Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddCondition}
          className="mt-4 gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Kondisi
        </Button>
      </div>

      {/* Query Preview */}
      <div className="p-4 bg-slate-50 rounded-lg">
        <p className="text-xs font-semibold text-slate-600 mb-2">QUERY PREVIEW:</p>
        <p className="text-sm font-mono text-slate-700 break-words">{generateQueryString()}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleApplyQuery} className="gap-2">
          <ChevronRight className="h-4 w-4" />
          Terapkan Query
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowSaveForm(!showSaveForm)}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Simpan Query
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            const queryString = generateQueryString();
            navigator.clipboard.writeText(queryString);
          }}
          className="gap-2"
        >
          <Copy className="h-4 w-4" />
          Salin Query
        </Button>
      </div>

      {/* Save Form */}
      {showSaveForm && (
        <div className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Nama query"
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
          />
          <Button onClick={handleSaveQuery}>Simpan</Button>
          <Button
            variant="outline"
            onClick={() => {
              setQueryName('');
              setShowSaveForm(false);
            }}
          >
            Batal
          </Button>
        </div>
      )}
    </Card>
  );
}
