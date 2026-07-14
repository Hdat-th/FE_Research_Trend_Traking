const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5024';

async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(BASE_URL + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }
  const body = await res.json();
  return body.data as T;
}

async function post<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(BASE_URL + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), { method: 'POST' });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }
  const body = await res.json();
  return body.data as T;
}

// ---- Types ----

export interface PaperSearchItem {
  paperId: string;
  title: string;
  year: number | null;
  citationCount: number;
  journalName: string;
  quartile: string;
  sourceUrl: string;
  keywordCount: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface TrendPoint {
  period: string;
  count: number;
  periodTotal: number;
  share: number;
}

export interface TrendSeries {
  dimension: string;
  value: string;
  groupBy: string;
  totalPapers: number;
  series: TrendPoint[];
  slope: number;
  direction: 'rising' | 'falling' | 'stable';
}

export interface TrendTopItem {
  name: string;
  count: number;
  rangeTotal: number;
  share: number;
  slope: number;
  direction: 'rising' | 'falling' | 'stable';
}

export interface MindmapNode {
  id: string;
  type: string;
  label: string;
  level?: number;
  paperCount?: number;
  trendScore?: number;
  year?: number | null;
  citationCount?: number;
  quartile?: string;
  sourceUrl?: string;
}

export interface MindmapEdge {
  source: string;
  target: string;
}

export interface MindmapGraph {
  searchQuery: string;
  totalNodes: number;
  totalEdges: number;
  nodes: MindmapNode[];
  edges: MindmapEdge[];
}

// ---- Mindmap API ----

export const mindmapApi = {
  searchPapers: (q: string, page = 1, pageSize = 20) =>
    get<PagedResult<PaperSearchItem>>('/api/mindmap/search', { q, page, pageSize }),

  searchByAuthor: (author: string, page = 1, pageSize = 20) =>
    get<PagedResult<PaperSearchItem>>('/api/mindmap/search/author', { author, page, pageSize }),

  searchByJournal: (journal: string, page = 1, pageSize = 20) =>
    get<PagedResult<PaperSearchItem>>('/api/mindmap/search/journal', { journal, page, pageSize }),

  suggestKeywords: (q: string, limit = 10) =>
    get<string[]>('/api/mindmap/keywords/suggest', { q, limit }),

  keywordTree: (keyword: string, maxBranches = 6, maxSubBranches = 3) =>
    get<MindmapGraph>('/api/mindmap/tree/keyword', { keyword, maxBranches, maxSubBranches }),

  graphByPaper: (paperId: string, maxSiblings = 5) =>
    get<MindmapGraph>(`/api/mindmap/graph/paper/${encodeURIComponent(paperId)}`, { maxSiblings }),

  papersByKeyword: (keyword: string, distinctFrom?: string, limit = 10) =>
    get<PaperSearchItem[]>('/api/mindmap/papers/keyword', { keyword, distinctFrom, limit }),
};

// ---- Trend API ----

export const trendApi = {
  series: (dimension: string, value: string, fromYear = 2022, toYear = 2026, groupBy = 'year') =>
    get<TrendSeries>('/api/trend/series', { dimension, value, fromYear, toYear, groupBy }),

  top: (dimension: string, fromYear = 2022, toYear = 2026, topN = 20, minPapers = 3, sortBy = 'share') =>
    get<TrendTopItem[]>('/api/trend/top', { dimension, fromYear, toYear, topN, minPapers, sortBy }),
};

// ---- Admin API ----

export const adminApi = {
  aiStatus: () => get<object>('/api/admin/ai-status'),
  reprocessStatus: () => get<object>('/api/admin/reprocess-status'),
  reprocessAll: (delayMs = 0) => post<object>('/api/admin/reprocess-all', { delayMs }),
  runWeeklyNow: () => post<object>('/api/admin/run-weekly-now'),
  resetKeywords: () => post<object>('/api/admin/reset-keywords', { confirm: true }),
  backfillBalanced: (perYear = 2500, fromYear = 2022, toYear = 2026) =>
    post<object>('/api/admin/backfill-balanced', { perYear, fromYear, toYear }),
};
