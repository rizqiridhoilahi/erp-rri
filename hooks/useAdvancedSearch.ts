'use client';

import { useState, useCallback, useEffect } from 'react';
import { SearchHistory } from '@/components/search/SearchHistorySidebar';
import { SavedFilter } from '@/components/search/SavedFiltersPanel';
import { AdvancedSearchFormData } from '@/components/search/AdvancedSearchForm';

const SEARCH_HISTORY_KEY = 'search_history';
const SAVED_FILTERS_KEY = 'saved_filters';
const MAX_HISTORY = 50;

interface UseAdvancedSearchResult {
  // Search Results
  results: any[];
  totalResults: number;
  isLoading: boolean;
  error: string | null;

  // History
  searchHistory: SearchHistory[];
  addToHistory: (query: string, scope: string, resultCount?: number, filterData?: any) => void;
  deleteFromHistory: (historyId: string) => void;
  clearHistory: () => void;

  // Saved Filters
  savedFilters: SavedFilter[];
  saveFilter: (name: string, filterData: AdvancedSearchFormData, scope: string) => void;
  deleteFilter: (filterId: string) => void;
  updateFilter: (filter: SavedFilter) => void;
  loadSavedFilters: () => void;

  // Search Suggestions
  suggestions: string[];
  getSuggestions: (query: string, scope: string) => void;

  // Utils
  performSearch: (filterData: AdvancedSearchFormData) => Promise<void>;
  clearSearch: () => void;
}

export function useAdvancedSearch(): UseAdvancedSearchResult {
  // Search Results
  const [results, setResults] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // History
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  // Saved Filters
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    loadSearchHistory();
    loadSavedFilters();
  }, []);

  // ==================== Search History ====================
  const loadSearchHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setSearchHistory(parsed);
      }
    } catch (err) {
      console.error('Error loading search history:', err);
    }
  }, []);

  const addToHistory = useCallback(
    (query: string, scope: string, resultCount?: number, filterData?: any) => {
      const newHistory: SearchHistory = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        query,
        scope,
        timestamp: new Date(),
        resultCount,
        filterData,
      };

      setSearchHistory((prev) => {
        const updated = [newHistory, ...prev];
        // Keep only last MAX_HISTORY items
        const limited = updated.slice(0, MAX_HISTORY);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limited));
        return limited;
      });
    },
    []
  );

  const deleteFromHistory = useCallback((historyId: string) => {
    setSearchHistory((prev) => {
      const updated = prev.filter((h) => h.id !== historyId);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }, []);

  // ==================== Saved Filters ====================
  const loadSavedFilters = useCallback(() => {
    try {
      const stored = localStorage.getItem(SAVED_FILTERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        setSavedFilters(parsed);
      }
    } catch (err) {
      console.error('Error loading saved filters:', err);
    }
  }, []);

  const saveFilter = useCallback(
    (name: string, filterData: AdvancedSearchFormData, scope: string) => {
      const newFilter: SavedFilter = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        filterData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
        isShared: false,
        scope,
      };

      setSavedFilters((prev) => {
        const updated = [newFilter, ...prev];
        localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const deleteFilter = useCallback((filterId: string) => {
    setSavedFilters((prev) => {
      const updated = prev.filter((f) => f.id !== filterId);
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateFilter = useCallback((filter: SavedFilter) => {
    setSavedFilters((prev) => {
      const updated = prev.map((f) =>
        f.id === filter.id ? { ...filter, updatedAt: new Date() } : f
      );
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ==================== Search ====================
  const performSearch = useCallback(async (filterData: AdvancedSearchFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query string from filters
      const queryParts: string[] = [];
      filterData.filters.forEach((filter) => {
        if (filter.field && filter.value) {
          queryParts.push(`${filter.field}:${filter.value}`);
        }
      });
      const queryString = queryParts.join(` ${filterData.logicalOperator} `);

      // Simulate API call - replace with actual API
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryString,
          filters: filterData.filters,
          scope: filterData.searchIn,
          logicalOperator: filterData.logicalOperator,
        }),
      });

      if (!response.ok) {
        throw new Error('Pencarian gagal');
      }

      const data = await response.json();
      setResults(data.results || []);
      setTotalResults(data.total || 0);

      // Add to history
      addToHistory(
        queryString,
        filterData.searchIn,
        data.total,
        filterData
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(errorMessage);
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [addToHistory]);

  const clearSearch = useCallback(() => {
    setResults([]);
    setTotalResults(0);
    setError(null);
  }, []);

  // ==================== Suggestions ====================
  const getSuggestions = useCallback((query: string, scope: string) => {
    // Get suggestions from search history
    const relatedHistory = searchHistory
      .filter((h) => h.scope === scope && h.query.toLowerCase().includes(query.toLowerCase()))
      .map((h) => h.query)
      .filter((q, i, arr) => arr.indexOf(q) === i) // Remove duplicates
      .slice(0, 5);

    setSuggestions(relatedHistory);
  }, [searchHistory]);

  return {
    // Search Results
    results,
    totalResults,
    isLoading,
    error,

    // History
    searchHistory,
    addToHistory,
    deleteFromHistory,
    clearHistory,

    // Saved Filters
    savedFilters,
    saveFilter,
    deleteFilter,
    updateFilter,
    loadSavedFilters,

    // Suggestions
    suggestions,
    getSuggestions,

    // Utils
    performSearch,
    clearSearch,
  };
}
