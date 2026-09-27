/**
 * Страница журнала аудита (только admin)
 */
import { useState, useMemo } from 'react';
import { mockAuditLogs } from '../data/mockData';
import { Clock, Filter } from 'lucide-react';

const ACTION_LABELS: Record<string, string> = {
  create: 'Создание',
  update: 'Обновление',
  delete: 'Удаление',
  login: 'Вход',
  logout: 'Выход',
  upload: 'Загрузка файла',
  download: 'Скачивание',
};

const ACTION_COLORS: Record<string, string> = {
  create: '#22c55e',
  update: '#3b82f6',
  delete: '#ef4444',
  login: '#8b5cf6',
  logout: '#6b7280',
  upload: '#f59e0b',
  download: '#06b6d4',
};

export default function AuditPage() {
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let items = [...mockAuditLogs];
    if (actionFilter) items = items.filter((l) => l.action === actionFilter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((l) => l.user_name.toLowerCase().includes(q) || (l.payload || '').toLowerCase().includes(q));
    }
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [actionFilter, search]);

  return (
    <div className="p-6 h-full overflow-auto">
<div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Журнал действий</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Записей: {filtered.length}</p>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Поиск по пользователю, данным..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2.5 rounded-lg outline-none text-sm flex-1 max-w-sm"
          style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
        />
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-2.5 rounded-lg outline-none text-sm"
            style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            <option value="">Все действия</option>
            {Object.entries(ACTION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Список записей */}
      <div className="space-y-2">
        {filtered.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-4 p-4 rounded-xl"
            style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
          >
            {/* Индикатор действия */}
            <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: ACTION_COLORS[log.action] || '#888' }} />
            
            {/* Контент */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{log.user_name}</span>
                <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: (ACTION_COLORS[log.action] || '#888') + '20', color: ACTION_COLORS[log.action] || '#888' }}>
                  {ACTION_LABELS[log.action] || log.action}
                </span>
                {log.entity_type && (
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    → {log.entity_type} #{log.entity_id}
                  </span>
                )}
              </div>
              {log.payload && (
                <p className="text-xs font-mono truncate" style={{ color: 'var(--color-text-secondary)' }}>{log.payload}</p>
              )}
            </div>

            {/* Время */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Clock className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {new Date(log.timestamp).toLocaleString('ru-RU')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
