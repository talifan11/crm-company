/**
 * Страница списка объектов
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockObjects, OBJECT_TYPE_LABELS, OBJECT_COLORS } from '../data/mockData';
import { ArrowUpDown, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import type { InfraObject } from '../types';

const PAGE_SIZE = 10;

export default function ObjectsPage() {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<keyof InfraObject>('code');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let items = [...mockObjects];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((o) => o.code.toLowerCase().includes(q) || o.name.toLowerCase().includes(q) || (o.address || '').toLowerCase().includes(q));
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

  const toggleSort = (field: keyof InfraObject) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  return (
    <div className="p-6 h-full overflow-auto">
<div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Объекты инфраструктуры</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Всего: {filtered.length}</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск по коду, названию, адресу..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="w-full max-w-md p-2.5 rounded-lg outline-none text-sm"
          style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
        />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--color-bg-secondary)' }}>
              {[
                { key: 'code', label: 'Код' },
                { key: 'name', label: 'Название' },
                { key: 'object_type', label: 'Тип' },
                { key: 'address', label: 'Адрес' },
                { key: 'created_at', label: 'Создан' },
              ].map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-medium cursor-pointer select-none"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onClick={() => toggleSort(col.key as keyof InfraObject)}
                >
                  <span className="flex items-center gap-1">{col.label}<ArrowUpDown className="w-3 h-3" /></span>
                </th>
              ))}
              <th className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((obj) => (
              <tr key={obj.id} style={{ borderTop: '1px solid var(--color-border)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--color-accent)' }}>{obj.code}</td>
<td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: OBJECT_COLORS[obj.object_type] }} />
                    {obj.name}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{OBJECT_TYPE_LABELS[obj.object_type]}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{obj.address || '—'}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{new Date(obj.created_at).toLocaleDateString('ru-RU')}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate('/map')} className="p-1.5 rounded-lg hover:opacity-80" style={{ color: 'var(--color-accent)' }} title="Показать на карте">
                    <MapPin className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Стр. {page + 1} из {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="p-2 rounded-lg disabled:opacity-30" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-2 rounded-lg disabled:opacity-30" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
