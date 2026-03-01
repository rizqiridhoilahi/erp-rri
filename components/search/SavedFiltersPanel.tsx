'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Trash2,
  Copy,
  Share2,
  MoreVertical,
  Clock,
  Lock,
  Globe,
  Star,
} from 'lucide-react';

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filterData: any;
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
  isShared?: boolean;
  sharedWith?: string[]; // User IDs
  shareLink?: string;
  scope: string; // 'products', 'customers', etc
}

interface SavedFiltersPanelProps {
  filters: SavedFilter[];
  onFilterSelect: (filter: SavedFilter) => void;
  onFilterDelete: (filterId: string) => void;
  onFilterUpdate?: (filter: SavedFilter) => void;
  onFilterShare?: (filterId: string, userIds: string[]) => void;
  isLoading?: boolean;
  searchQuery?: string;
}

export function SavedFiltersPanel({
  filters,
  onFilterSelect,
  onFilterDelete,
  onFilterUpdate,
  onFilterShare,
  isLoading = false,
  searchQuery = '',
}: SavedFiltersPanelProps) {
  const handleDeleteClick = (filterId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus filter ini?')) {
      onFilterDelete(filterId);
    }
  };
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const filteredFilters = filters.filter((f) =>
    f.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const favoriteFilters = filteredFilters.filter((f) => f.isFavorite);
  const otherFilters = filteredFilters.filter((f) => !f.isFavorite);

  const handleToggleFavorite = (filter: SavedFilter) => {
    if (onFilterUpdate) {
      onFilterUpdate({
        ...filter,
        isFavorite: !filter.isFavorite,
      });
    }
  };

  const handleCopyLink = (shareLink?: string) => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const FilterCard = ({ filter, showFavorite = true }: { filter: SavedFilter; showFavorite?: boolean }) => (
    <div
      className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer group"
      onClick={() => onFilterSelect(filter)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate text-slate-900 group-hover:text-blue-700">
            {filter.name}
          </h4>
          {filter.description && (
            <p className="text-xs text-slate-600 truncate">{filter.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition">
          {showFavorite && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(filter);
              }}
            >
              {filter.isFavorite ? (
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              ) : (
                <Star className="h-3.5 w-3.5 text-slate-400" />
              )}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {filter.isShared && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyLink(filter.shareLink);
                  }}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Salin Link
                </DropdownMenuItem>
              )}

              {onFilterShare && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareMenuOpen(filter.id);
                  }}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Bagikan
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(filter.id);
                }}
                className="gap-2 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filter Badges */}
      <div className="flex items-center flex-wrap gap-1">
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {formatDate(filter.updatedAt)}
        </Badge>

        {filter.isShared && (
          <Badge variant="outline" className="text-xs gap-1">
            <Globe className="h-3 w-3" />
            Dibagikan
          </Badge>
        )}

        {filter.scope && (
          <Badge className="text-xs bg-blue-100 text-blue-700">
            {filter.scope}
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <Card className="w-full bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3">Filter Tersimpan</h3>
        <Input
          placeholder="Cari filter..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-slate-500">Memuat filter...</div>
            </div>
          ) : filters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <Lock className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Belum ada filter tersimpan</p>
            </div>
          ) : (
            <>
              {/* Favorite Filters */}
              {favoriteFilters.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-600 uppercase mb-2 flex items-center gap-2">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    Favorit
                  </h4>
                  <div className="space-y-2">
                    {favoriteFilters.map((filter) => (
                      <FilterCard key={filter.id} filter={filter} />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Filters */}
              {otherFilters.length > 0 && (
                <div>
                  {favoriteFilters.length > 0 && <div className="border-t my-2" />}
                  <h4 className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Lainnya
                  </h4>
                  <div className="space-y-2">
                    {otherFilters.map((filter) => (
                      <FilterCard key={filter.id} filter={filter} />
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchInput && filteredFilters.length === 0 && (
                <div className="flex items-center justify-center py-8 text-slate-500">
                  <p className="text-sm">Tidak ada filter yang cocok</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>


    </Card>
  );
}
