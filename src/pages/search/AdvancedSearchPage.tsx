import { useState } from 'react';
import { mindmapApi, type PaperSearchItem, type PagedResult } from '../../lib/api';

type SearchTab = 'keyword' | 'author' | 'journal';

const AdvancedSearchPage = () => {
  const [tab, setTab] = useState<SearchTab>('keyword');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PagedResult<PaperSearchItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      let data: PagedResult<PaperSearchItem>;
      if (tab === 'keyword') data = await mindmapApi.searchPapers(query.trim());
      else if (tab === 'author') data = await mindmapApi.searchByAuthor(query.trim());
      else data = await mindmapApi.searchByJournal(query.trim());
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi kết nối BE');
    } finally {
      setLoading(false);
    }
  }

  const tabs: { id: SearchTab; label: string; placeholder: string }[] = [
    { id: 'keyword', label: 'Keyword Search', placeholder: 'machine learning' },
    { id: 'author', label: 'Author Search', placeholder: 'Yoshua Bengio' },
    { id: 'journal', label: 'Journal Search', placeholder: 'Nature Machine Intelligence' },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800">Filter Results</h2>
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500">YEAR RANGE</p>
          <input type="range" min={2015} max={2025} className="mt-2 w-full" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>2015</span>
            <span>2025</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500">RESEARCH FIELD</p>
          {['Computer Science', 'Artificial Intelligence', 'Mathematics', 'Physics'].map((f) => (
            <label key={f} className="mt-2 flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" defaultChecked={f !== 'Mathematics' && f !== 'Physics'} />
              {f}
            </label>
          ))}
        </div>
      </aside>

      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Research Discovery</h1>
        </div>

        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setResults(null); setQuery(''); }}
              className={`px-3 py-2 text-sm ${
                tab === t.id
                  ? 'border-b-2 border-indigo-700 font-semibold text-indigo-700'
                  : 'text-gray-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            placeholder={tabs.find(t => t.id === tab)?.placeholder}
            className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
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
      </section>
    </div>
  );
};

export default AdvancedSearchPage;
