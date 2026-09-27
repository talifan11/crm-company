/**
 * Страница бригад — список, карточка, статус
 */
import { useState } from 'react';
import { mockBrigades } from '../data/mockBrigades';
import { BRIGADE_STATUS_LABELS, BRIGADE_STATUS_COLORS } from '../types/brigade';
import { Phone, Truck, Users, Calendar, MapPin } from 'lucide-react';
import type { BrigadeStatus } from '../types/brigade';

export default function BrigadesPage() {
  const [statusFilter, setStatusFilter] = useState<BrigadeStatus | ''>('');
  const [selectedBrigade, setSelectedBrigade] = useState<number | null>(null);

  const filtered = statusFilter
    ? mockBrigades.filter((b) => b.status === statusFilter)
    : mockBrigades;

  const selected = selectedBrigade ? mockBrigades.find((b) => b.id === selectedBrigade) : null;

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Бригады</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Всего: {filtered.length}</p>
        </div>
      </div>

      {/* Фильтр по статусу */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BrigadeStatus | '')}
          className="px-3 py-2 rounded-md text-sm border"
          style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
        >
          <option value="">Все статусы</option>
          {Object.entries(BRIGADE_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Список бригад */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map((brigade) => (
            <div
              key={brigade.id}
              className="p-4 rounded-md cursor-pointer transition-colors"
              style={{
                background: selectedBrigade === brigade.id ? 'var(--color-bg-secondary)' : 'var(--color-bg-elevated)',
                border: `1px solid ${selectedBrigade === brigade.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}
              onClick={() => setSelectedBrigade(brigade.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {brigade.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: BRIGADE_STATUS_COLORS[brigade.status] }}
                    />
                    <span className="text-xs" style={{ color: BRIGADE_STATUS_COLORS[brigade.status] }}>
                      {BRIGADE_STATUS_LABELS[brigade.status]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <Users className="w-3.5 h-3.5" />
                  <span>{brigade.member_ids.length} чел.</span>
                </div>
                {brigade.phone && (
                  <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                    <Phone className="w-3.5 h-3.5" />
                    <span>{brigade.phone}</span>
                  </div>
                )}
                {brigade.vehicle && (
                  <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                    <Truck className="w-3.5 h-3.5" />
                    <span className="truncate">{brigade.vehicle}</span>
                  </div>
                )}
                <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(brigade.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>

              {brigade.notes && (
                <p className="mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {String(brigade.notes)}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Карточка выбранной бригады */}
        <div className="lg:col-span-1">
          {selected ? (
            <div className="sticky top-6 p-5 rounded-md" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
              <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                {selected.name}
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Статус</p>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: BRIGADE_STATUS_COLORS[selected.status] }}
                    />
                    <span className="text-sm font-medium" style={{ color: BRIGADE_STATUS_COLORS[selected.status] }}>
                      {BRIGADE_STATUS_LABELS[selected.status]}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Состав</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {selected.member_ids.length} человек
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    IDs: {selected.member_ids.join(', ')}
                  </p>
                </div>

                {selected.phone && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Телефон</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{selected.phone}</p>
                  </div>
                )}

                {selected.vehicle && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Транспорт</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{selected.vehicle}</p>
                  </div>
                )}

                {selected.notes && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Примечания</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{selected.notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Создана: {new Date(selected.created_at).toLocaleString('ru-RU')}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Обновлена: {new Date(selected.updated_at).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="sticky top-6 p-8 rounded-md text-center" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
              <MapPin className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Выберите бригаду для просмотра деталей
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
