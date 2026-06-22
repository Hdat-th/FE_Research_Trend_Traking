import { useState, useEffect } from 'react';
import RequireFeature from '../../routes/RequireFeature';
import { useFeature } from '../../hooks/useFeature';
import { FeaturePermission } from '../../types/permissions';
import { trendApi, type TrendTopItem, type TrendSeries } from '../../lib/api';

const YEARS = Array.from({ length: 5 }, (_, i) => 2022 + i);

const DirectionBadge = ({ dir }: { dir: string }) => {
  const map: Record<string, string> = {
    rising: 'bg-green-100 text-green-700',
    falling: 'bg-red-100 text-red-700',
    stable: 'bg-gray-100 text-gray-600',
  };
  const icon = dir === 'rising' ? '↑' : dir === 'falling' ? '↓' : '→';
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${map[dir] ?? map.stable}`}>
      {icon} {dir}
    </span>
  );
};

const TrendDashboardPage = () => {
  const canExportCsv = useFeature(FeaturePermission.EXPORT_CSV);

  const [fromYear, setFromYear] = useState(2022);
  const [toYear, setToYear] = useState(2026);
  const [topKeywords, setTopKeywords] = useState<TrendTopItem[]>([]);
  const [topLoading, setTopLoading] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  const [seriesQuery, setSeriesQuery] = useState('');
  const [series, setSeries] = useState<TrendSeries | null>(null);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [seriesError, setSeriesError] = useState<string | null>(null);

  useEffect(() => {
    setTopLoading(true);
    setTopError(null);
    trendApi.top('keyword', fromYear, toYear, 10)
      .then(setTopKeywords)
      .catch(e => setTopError(e instanceof Error ? e.message : 'Lỗi kết nối BE'))
      .finally(() => setTopLoading(false));
  }, [fromYear, toYear]);

  async function handleSeriesSearch() {
    if (!seriesQuery.trim()) return;
    setSeriesLoading(true);
    setSeriesError(null);
    setSeries(null);
    try {
      const data = await trendApi.series('keyword', seriesQuery.trim(), fromYear, toYear);
      setSeries(data);
    } catch (e) {
      setSeriesError(e instanceof Error ? e.message : 'Không tìm thấy keyword');
    } finally {
      setSeriesLoading(false);
    }
  }

  const maxShare = topKeywords.length > 0 ? Math.max(...topKeywords.map(k => k.share)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Journal & Keywords · Trend Analytics Dashboard
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Trend Dashboard</h1>
        </div>

        <button
          disabled={!canExportCsv}
          title={!canExportCsv ? 'Nâng cấp Premium để xuất CSV' : undefined}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
            canExportCsv
              ? 'bg-indigo-700 text-white hover:bg-indigo-800'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
        >
          ⬇ Export Data (CSV)
        </button>
      </div>

      {/* Year filter */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <span className="text-sm text-gray-600">Năm:</span>
        <select value={fromYear} onChange={e => setFromYear(Number(e.target.value))}
          className="rounded border border-gray-200 px-2 py-1 text-sm">
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span className="text-sm text-gray-400">→</span>
        <select value={toYear} onChange={e => setToYear(Number(e.target.value))}
          className="rounded border border-gray-200 px-2 py-1 text-sm">
          {[...YEARS, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Top Keywords - DASHBOARD_BASIC */}
      <RequireFeature feature={FeaturePermission.DASHBOARD_BASIC} featureLabel="Top Trending Keywords">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Top Trending Keywords</h2>
          <p className="text-sm text-gray-500">Từ khóa nổi bật theo tần suất xuất hiện trong bài báo.</p>
          {topLoading && <p className="mt-4 text-sm text-gray-400">Đang tải...</p>}
          {topError && <p className="mt-4 text-sm text-red-600">{topError}</p>}
          {!topLoading && !topError && (
            <div className="mt-4 space-y-2">
              {topKeywords.map(kw => (
                <div key={kw.name} className="flex items-center gap-3">
                  <button
                    onClick={() => { setSeriesQuery(kw.name); }}
                    className="w-40 truncate text-left text-xs font-medium text-indigo-700 hover:underline"
                  >
                    {kw.name}
                  </button>
                  <div className="flex-1 rounded-full bg-gray-100 h-2">
                    <div
                      className="h-2 rounded-full bg-indigo-600"
                      style={{ width: `${(kw.share / maxShare) * 100}%` }}
                    />
                  </div>
                  <DirectionBadge dir={kw.direction} />
                  <span className="w-12 text-right text-xs text-gray-400">{kw.count}</span>
                </div>
              ))}
              {topKeywords.length === 0 && <p className="text-sm text-gray-400">Không có dữ liệu.</p>}
            </div>
          )}
        </div>
      </RequireFeature>

      {/* Trend Series - DASHBOARD_ADVANCED */}
      <RequireFeature
        feature={FeaturePermission.DASHBOARD_ADVANCED}
        featureLabel="Keyword Trend Series"
        description="Xem xu hướng theo thời gian của từng keyword khi nâng cấp Premium."
      >
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Keyword Trend Series</h2>
          <p className="text-sm text-gray-500">Xem xu hướng share theo năm của 1 keyword cụ thể.</p>

          <div className="mt-4 flex gap-2">
            <input
              value={seriesQuery}
              onChange={e => setSeriesQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSeriesSearch(); }}
              placeholder="Nhập keyword (vd: machine learning)..."
              className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
            />
            <button
              onClick={handleSeriesSearch}
              disabled={seriesLoading}
              className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-50"
            >
              {seriesLoading ? '...' : 'Xem'}
            </button>
          </div>

          {seriesError && <p className="mt-3 text-sm text-red-600">{seriesError}</p>}

          {series && (
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">{series.value}</span>
                <DirectionBadge dir={series.direction} />
                <span className="text-xs text-gray-500">{series.totalPapers} bài</span>
              </div>
              <div className="flex items-end gap-1 h-32">
                {series.series.map(pt => {
                  const maxCount = Math.max(...series.series.map(p => p.count), 1);
                  return (
                    <div key={pt.period} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-indigo-500"
                        style={{ height: `${(pt.count / maxCount) * 100}%` }}
                        title={`${pt.period}: ${pt.count} bài (${(pt.share * 100).toFixed(2)}%)`}
                      />
                      <span className="text-xs text-gray-400">{pt.period}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </RequireFeature>
    </div>
  );
};

export default TrendDashboardPage;
