import { useState, useEffect, useRef } from 'react';
import { mindmapApi, type PaperSearchItem, type PagedResult } from '../../lib/api';

const RECENT_KEY = 'recentSearches';

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); } catch { return []; }
}
function saveRecent(terms: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(terms.slice(0, 10)));
}

const StandardSearchPage = () => {
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState<PagedResult<PaperSearchItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const items = await mindmapApi.suggestKeywords(query.trim());
        setSuggestions(items);
        setShowSuggestions(items.length > 0);
      } catch { setSuggestions([]); }
    }, 300);
  }, [query]);

  async function handleSearch(term: string) {
    if (!term.trim()) return;
    setShowSuggestions(false);
    setLoading(true);
    setError(null);
    try {
      const data = await mindmapApi.searchPapers(term.trim());
      setResults(data);
      const updated = [term, ...recent.filter(r => r !== term)];
      setRecent(updated);
      saveRecent(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi kết nối BE');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Standard Search</h1>
        <p className="text-sm text-gray-500">Search papers by keyword, DOI, or OpenAlex ID.</p>
      </div>

      <div className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(query); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search papers by keyword, DOI, or OpenAlex ID..."
            className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            onClick={() => handleSearch(query)}
            disabled={loading}
            className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute left-4 right-4 z-10 mt-1 divide-y divide-gray-100 rounded-md border border-gray-200 bg-white shadow-lg">
            {suggestions.map((s) => (
              <li
                key={s}
                onMouseDown={() => { setQuery(s); handleSearch(s); }}
                className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {results && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs text-gray-500">{results.totalCount} kết quả</p>
          <div className="space-y-3">
            {results.items.map((paper) => (
              <div key={paper.paperId} className="rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                <a
                  href={paper.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-indigo-700 hover:underline"
                >
                  {paper.title}
                </a>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                  {paper.year && <span>{paper.year}</span>}
                  {paper.journalName && <span>{paper.journalName}</span>}
                  {paper.quartile && (
                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-medium text-indigo-700">
                      {paper.quartile}
                    </span>
                  )}
                  <span>{paper.citationCount} citations</span>
                </div>
              </div>
            ))}
            {results.items.length === 0 && (
              <p className="text-sm text-gray-400">Không tìm thấy kết quả.</p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Recent Searches</h2>
          <button
            onClick={() => { setRecent([]); saveRecent([]); }}
            className="text-xs text-red-600 hover:underline"
          >
            Clear history
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {recent.map((term) => (
            <button
              key={term}
              onClick={() => { setQuery(term); handleSearch(term); }}
              className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700"
            >
              {term}
            </button>
          ))}
          {recent.length === 0 && <p className="text-xs text-gray-400">No recent searches.</p>}
        </div>
      </div>
    </div>
  );
};

export default StandardSearchPage;
