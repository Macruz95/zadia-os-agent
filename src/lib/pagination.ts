/**
 * ZADIA OS - Pagination Utilities
 * 
 * Reusable pagination helpers for Firestore queries
 * Supports cursor-based and offset-based pagination
 */

import {
  Query,
  DocumentData,
  QueryDocumentSnapshot,
  query,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  getDocs,
  getCountFromServer,
  QueryConstraint,
} from 'firebase/firestore';

// ============================================
// Types
// ============================================

export interface PaginationParams {
  pageSize: number;
  cursor?: string | null;
  direction?: 'next' | 'prev';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextCursor: string | null;
    prevCursor: string | null;
    totalCount?: number;
    currentPage?: number;
    totalPages?: number;
  };
}

export interface CursorInfo {
  docId: string;
  timestamp?: number;
  fieldValue?: unknown;
}

// ============================================
// Constants
// ============================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// ============================================
// Pagination Service
// ============================================

export class PaginationService {
  /**
   * Execute a paginated Firestore query using cursors
   */
  static async paginateQuery<T extends DocumentData>(
    baseQuery: Query<DocumentData>,
    params: PaginationParams,
    transformFn: (doc: QueryDocumentSnapshot<DocumentData>) => T
  ): Promise<PaginatedResult<T>> {
    const { pageSize = DEFAULT_PAGE_SIZE, cursor, direction = 'next' } = params;
    const safePageSize = Math.min(pageSize, MAX_PAGE_SIZE);

    // Build constraints
    const constraints: QueryConstraint[] = [];

    // Fetch one extra to check if there are more pages
    const fetchSize = safePageSize + 1;

    if (cursor) {
      // Decode cursor
      const cursorInfo = this.decodeCursor(cursor);
      
      if (direction === 'next') {
        constraints.push(startAfter(cursorInfo.docId));
        constraints.push(limit(fetchSize));
      } else {
        constraints.push(endBefore(cursorInfo.docId));
        constraints.push(limitToLast(fetchSize));
      }
    } else {
      constraints.push(limit(fetchSize));
    }

    // Execute query
    const paginatedQuery = query(baseQuery, ...constraints);
    const snapshot = await getDocs(paginatedQuery);

    // Transform documents
    const docs = snapshot.docs.map(transformFn);

    // Determine pagination state
    const hasMore = docs.length > safePageSize;
    const data = hasMore ? docs.slice(0, safePageSize) : docs;

    // Get cursors
    const firstDoc = snapshot.docs[0];
    const lastDoc = snapshot.docs[Math.min(snapshot.docs.length - 1, safePageSize - 1)];

    return {
      data,
      pagination: {
        hasNextPage: direction === 'next' ? hasMore : !!cursor,
        hasPrevPage: direction === 'prev' ? hasMore : !!cursor,
        nextCursor: lastDoc ? this.encodeCursor({ docId: lastDoc.id }) : null,
        prevCursor: firstDoc ? this.encodeCursor({ docId: firstDoc.id }) : null,
      },
    };
  }

  /**
   * Get total count for a query (use sparingly - costs a read)
   */
  static async getTotalCount(baseQuery: Query<DocumentData>): Promise<number> {
    const countSnapshot = await getCountFromServer(baseQuery);
    return countSnapshot.data().count;
  }

  /**
   * Execute paginated query with total count
   */
  static async paginateWithCount<T extends DocumentData>(
    baseQuery: Query<DocumentData>,
    params: PaginationParams & { page?: number },
    transformFn: (doc: QueryDocumentSnapshot<DocumentData>) => T
  ): Promise<PaginatedResult<T>> {
    const [result, totalCount] = await Promise.all([
      this.paginateQuery(baseQuery, params, transformFn),
      this.getTotalCount(baseQuery),
    ]);

    const pageSize = params.pageSize || DEFAULT_PAGE_SIZE;
    const currentPage = params.page || 1;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      ...result,
      pagination: {
        ...result.pagination,
        totalCount,
        currentPage,
        totalPages,
      },
    };
  }

  /**
   * Encode cursor for URL-safe transmission
   */
  static encodeCursor(info: CursorInfo): string {
    return Buffer.from(JSON.stringify(info)).toString('base64');
  }

  /**
   * Decode cursor from URL-safe format
   */
  static decodeCursor(cursor: string): CursorInfo {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      return { docId: cursor };
    }
  }

  /**
   * Calculate offset for offset-based pagination (less efficient)
   */
  static calculateOffset(page: number, pageSize: number): number {
    return Math.max(0, (page - 1) * pageSize);
  }
}

// ============================================
// React Hook for Pagination
// ============================================

import { useState, useCallback, useMemo } from 'react';

interface UsePaginationOptions {
  initialPageSize?: number;
  initialPage?: number;
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  cursor: string | null;
  direction: 'next' | 'prev';
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: (cursor: string) => void;
  prevPage: (cursor: string) => void;
  reset: () => void;
  offset: number;
}

/**
 * React hook for managing pagination state
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { initialPageSize = DEFAULT_PAGE_SIZE, initialPage = 1 } = options;

  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [cursor, setCursor] = useState<string | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, newPage));
  }, []);

  const setPageSize = useCallback((size: number) => {
    const safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
    setPageSizeState(safeSize);
    setPageState(1);
    setCursor(null);
  }, []);

  const nextPage = useCallback((nextCursor: string) => {
    setCursor(nextCursor);
    setDirection('next');
    setPageState(p => p + 1);
  }, []);

  const prevPage = useCallback((prevCursor: string) => {
    setCursor(prevCursor);
    setDirection('prev');
    setPageState(p => Math.max(1, p - 1));
  }, []);

  const reset = useCallback(() => {
    setPageState(initialPage);
    setCursor(null);
    setDirection('next');
  }, [initialPage]);

  const offset = useMemo(() => 
    PaginationService.calculateOffset(page, pageSize), 
    [page, pageSize]
  );

  return {
    page,
    pageSize,
    cursor,
    direction,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    reset,
    offset,
  };
}

// ============================================
// Infinite Scroll Hook
// ============================================

interface UseInfiniteScrollOptions<T> {
  fetchFn: (cursor: string | null) => Promise<PaginatedResult<T>>;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * React hook for infinite scroll pagination
 */
export function useInfiniteScroll<T>(
  options: UseInfiniteScrollOptions<T>
): UseInfiniteScrollReturn<T> {
  const { fetchFn, enabled = true } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(cursor);
      
      setData(prev => cursor ? [...prev, ...result.data] : result.data);
      setCursor(result.pagination.nextCursor);
      setHasMore(result.pagination.hasNextPage);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [fetchFn, cursor, loading, hasMore, enabled]);

  const refresh = useCallback(async () => {
    setCursor(null);
    setHasMore(true);
    setData([]);
    setInitialized(false);
  }, []);

  // Initial load
  useState(() => {
    if (enabled && !initialized) {
      loadMore();
    }
  });

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

// ============================================
// UI Components (Types for integration)
// ============================================

export interface PaginationControlsProps {
  page: number;
  pageSize: number;
  totalCount?: number;
  totalPages?: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  onPageSizeChange: (size: number) => void;
  onPageChange?: (page: number) => void;
  loading?: boolean;
}
