import { useState } from 'react';
import AdminModal from '../../components/admin/AdminModal';
import AdminSectionCard from '../../components/admin/AdminSectionCard';
import AdminTable from '../../components/admin/AdminTable';
import AdminToast from '../../components/admin/AdminToast';
import {
  repositoryCategories as seedKeywords,
  repositoryPapers,
  type RepositoryCategory,
  type RepositoryPaper,
} from '../../mock/admin';

const AdminRepositoryPage = () => {
  const [activeTab, setActiveTab] = useState<'papers' | 'keywords'>('papers');
  const [keywords, setKeywords] = useState<RepositoryCategory[]>(seedKeywords);
  const [papers, setPapers] = useState<RepositoryPaper[]>(repositoryPapers);
  const [query, setQuery] = useState('');
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [keywordName, setKeywordName] = useState('');
  const [keywordDescription, setKeywordDescription] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const filteredPapers = papers.filter((paper) =>
    `${paper.id} ${paper.title} ${paper.authors} ${paper.doi} ${paper.journal} ${paper.year} ${paper.citations}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  // Ô CSV phải bọc ngoặc kép khi chứa dấu phẩy/ngoặc kép/xuống dòng, nếu không cột sẽ bị vỡ
  const csvCell = (value: string | number) => {
    const s = String(value ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const exportRepository = () => {
    const header = ['Paper ID', 'Title', 'Authors', 'Journal', 'Year', 'Citations', 'DOI'];
    const rows = papers.map((paper) =>
      [paper.id, paper.title, paper.authors, paper.journal, paper.year, paper.citations, paper.doi]
        .map(csvCell)
        .join(','),
    );

    // BOM để Excel nhận đúng UTF-8 (tên bài báo/tạp chí có ký tự ngoài ASCII)
    const blob = new Blob(
      ['\uFEFF' + [header.join(','), ...rows].join('\r\n')],
      { type: 'text/csv;charset=utf-8;' },
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'article-repository.csv';
    anchor.click();

    URL.revokeObjectURL(url);
    setToast('Article repository exported.');
  };

  const ingestPaper = () => {
    const nextPaper: RepositoryPaper = {
      id: `AIS-W${Math.floor(Math.random() * 90000 + 10000)}`,
      title: 'Newly Ingested OpenAlex Metadata Record',
      authors: 'OpenAlex Metadata Import',
      doi: `10.5555/demo.${Date.now().toString().slice(-5)}`,
      journal: 'OpenAlex Imported Source',
      year: 2026,
      citations: 0,
    };

    setPapers((current) => [nextPaper, ...current]);
    setActiveTab('papers');
    setToast('New OpenAlex metadata record ingested.');
  };

  const createKeyword = () => {
    if (!keywordName.trim()) {
      setToast('Keyword name is required.');
      return;
    }

    const nextKeyword: RepositoryCategory = {
      id: `KEY-${String(keywords.length + 1).padStart(3, '0')}`,
      name: keywordName.trim(),
      description: keywordDescription.trim() || 'New keyword used for trend tracking',
      fields: 0,
      status: 'DRAFT',
    };

    setKeywords((current) => [...current, nextKeyword]);
    setKeywordName('');
    setKeywordDescription('');
    setShowKeywordModal(false);
    setToast('New keyword created.');
  };

  return (
    <div className="space-y-5">
      <AdminToast message={toast} onClose={() => setToast(null)} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Article Repository
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Manage OpenAlex paper metadata, journals, citations and research keywords.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportRepository}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-indigo-700"
          >
            ⇩ Export
          </button>

          <button
            onClick={ingestPaper}
            className="rounded-md bg-indigo-700 hover:bg-indigo-800 px-4 py-2 text-xs font-bold text-white"
          >
            Ingest Now
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-8 text-sm font-bold text-gray-500">
          <button
            onClick={() => setActiveTab('papers')}
            className={`pb-3 hover:text-indigo-700 ${activeTab === 'papers' ? 'border-b-2 border-indigo-700 text-indigo-800' : ''}`}
          >
            Research Papers
          </button>

          <button
            onClick={() => setActiveTab('keywords')}
            className={`pb-3 hover:text-indigo-700 ${activeTab === 'keywords' ? 'border-b-2 border-indigo-700 text-indigo-800' : ''}`}
          >
            Keywords
          </button>
        </div>
      </div>

      {activeTab === 'papers' ? (
        <AdminSectionCard
          title="Research Papers"
          subtitle="Manage imported paper metadata from OpenAlex."
          action={
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by title, journal, year, citation or DOI..."
              className="w-72 rounded-md border border-gray-200 px-3 py-2 text-xs outline-none focus:border-indigo-700"
            />
          }
        >
          <AdminTable headers={['Paper ID', 'Title', 'Authors', 'Journal', 'Year', 'Citations', 'DOI']}>
            {filteredPapers.map((paper) => (
              <tr key={paper.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-bold text-gray-700">{paper.id}</td>

                <td className="max-w-sm px-5 py-4">
                  <p className="font-semibold text-gray-900">{paper.title}</p>
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">{paper.authors}</td>

                <td className="px-5 py-4 text-gray-600">{paper.journal}</td>

                <td className="px-5 py-4 font-semibold text-gray-700">{paper.year}</td>

                <td className="px-5 py-4 font-bold text-gray-900">{paper.citations}</td>

                <td className="px-5 py-4">
                  <a
                    href={`https://doi.org/${paper.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-indigo-700 hover:underline"
                  >
                    {paper.doi}
                  </a>
                </td>
              </tr>
            ))}
          </AdminTable>
        </AdminSectionCard>
      ) : (
        <AdminSectionCard
          title="Keyword Registry"
          subtitle="Manage research keywords used for trend analysis and search suggestions."
          action={
            <button
              onClick={() => setShowKeywordModal(true)}
              className="rounded-md bg-indigo-800 px-4 py-2 text-xs font-bold text-white"
            >
              + New Keyword
            </button>
          }
        >
          <AdminTable headers={['Keyword ID', 'Keyword Name', 'Description', 'Related Papers']}>
            {keywords.map((keyword) => (
              <tr key={keyword.id} className="hover:bg-gray-50">
                <td className="px-5 py-5 font-bold text-gray-500">{keyword.id}</td>

                <td className="px-5 py-5">
                  <p className="font-bold text-gray-900">{keyword.name}</p>
                </td>

                <td className="px-5 py-5">
                  <p className="max-w-md text-xs text-gray-500">{keyword.description}</p>
                </td>

                <td className="px-5 py-5">
                  <span className="rounded bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                    {keyword.fields} Papers
                  </span>
                </td>
              </tr>
            ))}
          </AdminTable>
        </AdminSectionCard>
      )}

      <AdminModal
        open={showKeywordModal}
        title="Create New Keyword"
        subtitle="Add a keyword for trend tracking and search suggestion."
        onClose={() => setShowKeywordModal(false)}
        footer={
          <>
            <button
              onClick={() => setShowKeywordModal(false)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700"
            >
              Cancel
            </button>

            <button
              onClick={createKeyword}
              className="rounded-md bg-indigo-800 px-4 py-2 text-xs font-bold text-white"
            >
              Create Keyword
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block text-xs font-bold text-gray-700" htmlFor="keyword-name">
            Keyword name
          </label>

          <input
            id="keyword-name"
            value={keywordName}
            onChange={(event) => setKeywordName(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-700"
            placeholder="Example: Artificial Intelligence"
          />

          <label className="block text-xs font-bold text-gray-700" htmlFor="keyword-description">
            Description
          </label>

          <textarea
            id="keyword-description"
            value={keywordDescription}
            onChange={(event) => setKeywordDescription(event.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-700"
            placeholder="Short keyword description..."
          />
        </div>
      </AdminModal>
    </div>
  );
};

export default AdminRepositoryPage;
