'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  Trash2,
  MoreVertical,
  RefreshCw,
  Zap,
  Search,
  TrendingUp,
} from 'lucide-react';

export interface SearchHistory {
  id: string;
  query: string;
  scope: string; // 'products', 'customers', etc
  timestamp: Date;
  resultCount?: number;
  filterData?: any;
}

interface SearchHistorySidebarProps {
  history: SearchHistory[];
  onSelectHistory: (history: SearchHistory) => void;
  onClearHistory: () => void;
  onDeleteHistory: (historyId: string) => void;
  isLoading?: boolean;
  maxItems?: number;
}

export function SearchHistorySidebar({
  history,
  onSelectHistory,
  onClearHistory,
  onDeleteHistory,
  isLoading = false,
  maxItems = 10,
}: SearchHistorySidebarProps) {
  const handleClearClick = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua riwayat pencarian?')) {
      onClearHistory();
    }
  };

  const handleDeleteClick = (historyId: string) => {
    onDeleteHistory(historyId);
  };

  const displayHistory = history.slice(0, maxItems);

  const getScopeIcon = (scope: string) => {
    const icons: Record<string, React.ReactNode> = {
      products: '📦',
      customers: '👥',
      suppliers: '🏭',
      quotations: '📄',
    };
    return icons[scope] || '🔍';
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}j lalu`;
    if (diffDays < 7) return `${diffDays}h lalu`;

    return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
  };

  const truncateQuery = (query: string, maxLength = 40) => {
    return query.length > maxLength ? `${query.substring(0, maxLength)}...` : query;
  };

  return (
    <Card className="w-full bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Riwayat Pencarian
          </h3>

          {history.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleClearClick()}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus Semua
              </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Stats */}
        {history.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <TrendingUp className="h-3 w-3" />
            <span>{history.length} pencarian</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-slate-500">Memuat riwayat...</div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <Search className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Mulai mencari untuk melihat riwayat</p>
            </div>
          ) : (
            displayHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer group"
                onClick={() => onSelectHistory(item)}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span className="text-lg">{getScopeIcon(item.scope)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-slate-900 group-hover:text-blue-700">
                        {truncateQuery(item.query)}
                      </p>
                      <p className="text-xs text-slate-600">
                        {formatTime(item.timestamp)}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-2 opacity-0 group-hover:opacity-100 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(item.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge className="text-xs bg-slate-100 text-slate-700">
                    {item.scope}
                  </Badge>

                  {item.resultCount !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {item.resultCount} hasil
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}

          {history.length > maxItems && (
            <div className="pt-4 border-t">
              <p className="text-xs text-slate-600 text-center mb-2">
                +{history.length - maxItems} pencarian lagi
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {history.length > 0 && (
        <div className="p-4 border-t space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 justify-center text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Pencarian Terkini
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 justify-center text-xs text-yellow-600 border-yellow-200 hover:bg-yellow-50"
          >
            <Zap className="h-3 w-3" />
            Sarankan Pencarian
          </Button>
        </div>
      )}
    </Card>
  );
}
