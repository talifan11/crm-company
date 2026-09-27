/**
 * Страница списка кабелей — таблица с сортировкой и пагинацией
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockCables, CABLE_TYPE_LABELS, LAYING_METHOD_LABELS, LAYING_COLORS } from '../data/mockData';
import { ArrowUpDown, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Cable } from '../types';

const PAGE_SIZE = 10;

export default function CablesPage() {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<keyof Cable>('code');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let items = [...mockCables];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || (c.owner || '').toLowerCase().includes(q));
    }
    items.sort((a, b) => {
      const aVal = String(a[sortField] ?? '');
      const bVal = String(b[sortField] ?? '');
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    return items;
  }, [search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field: keyof Cable) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Кабельные линии</h1>
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Всего: {filtered.length}</span>
      </div>

      {/* Поиск */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск по коду, названию, владельцу..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="w-full max-w-md p-2.5 rounded-lg outline-none text-sm"
          style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
        />
      </div>

      {/* Таблица */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--color-bg-secondary)' }}>
              {[
                { key: 'code', label: 'Код' },
                { key: 'name', label: 'Название' },
                { key: 'cable_type', label: 'Тип' },
                { key: 'laying_method', label: 'Прокладка' },
                { key: 'length_m', label: 'Длина (м)' },
                { key: 'owner', label: 'Владелец' },
                { key: 'install_date', label: 'Дата' },
              ].map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-medium cursor-pointer select-none"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onClick={() => toggleSort(col.key as keyof Cable)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((cable) => (
              <tr key={cable.id} className="transition-colors" style={{ borderTop: '1px solid var(--color-border)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--color-accent)' }}>{cable.code}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>{cable.name}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>{CABLE_TYPE_LABELS[cable.cable_type]}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: LAYING_COLORS[cable.laying_method] }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>{LAYING_METHOD_LABELS[cable.laying_method]}</span>
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>{cable.length_m}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{cable.owner || '—'}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{cable.install_date || '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => navigate('/map')}
                    className="p-1.5 rounded-lg hover:opacity-80"
                    style={{ color: 'var(--color-accent)' }}
                    title="Показать на карте"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Стр. {page + 1} из {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg disabled:opacity-30"
              style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg disabled:opacity-30"
              style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
