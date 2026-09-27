/**
 * Страница документов — все вложения с фильтром по категории
 */
import { useState, useMemo } from 'react';
import { mockCables, mockObjects, DOC_CATEGORY_LABELS } from '../data/mockData';
import { FileText, Download, Filter } from 'lucide-react';
import type { Attachment, DocCategory } from '../types';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' Б';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
}

export default function DocumentsPage() {
  const [categoryFilter, setCategoryFilter] = useState<DocCategory | ''>('');
  const [search, setSearch] = useState('');

  // Собираем все вложения
  const allAttachments: (Attachment & { entityName: string; entityType: string })[] = useMemo(() => {
    const items: (Attachment & { entityName: string; entityType: string })[] = [];
    mockCables.forEach((c) => c.attachments.forEach((a) => items.push({ ...a, entityName: c.name, entityType: 'Кабель' })));
    mockObjects.forEach((o) => o.attachments.forEach((a) => items.push({ ...a, entityName: o.name, entityType: 'Объект' })));
    return items;
  }, []);

  const filtered = useMemo(() => {
    let items = allAttachments;
    if (categoryFilter) items = items.filter((a) => a.doc_category === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((a) => a.filename.toLowerCase().includes(q) || a.entityName.toLowerCase().includes(q));
    }
    return items;
  }, [allAttachments, categoryFilter, search]);

  return (
    <div className="p-6 h-full overflow-auto">
<div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Документы</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Всего: {filtered.length}</p>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Поиск по имени файла..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2.5 rounded-lg outline-none text-sm flex-1 max-w-sm"
          style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
        />
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as DocCategory | '')}
            className="p-2.5 rounded-lg outline-none text-sm"
            style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            <option value="">Все категории</option>
            {Object.entries(DOC_CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Список документов */}
      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <p className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>Документы не найдены</p>
        ) : (
          filtered.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between p-4 rounded-xl transition-colors"
              style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
                  <FileText className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{att.filename}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    {DOC_CATEGORY_LABELS[att.doc_category]} • {att.entityType}: {att.entityName} • {formatFileSize(att.size)}
                  </p>
                </div>
              </div>
              <button
                className="p-2 rounded-lg hover:opacity-80"
                style={{ color: 'var(--color-accent)' }}
                title="Скачать"
                onClick={() => alert('В проде: presigned URL из MinIO')}
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
