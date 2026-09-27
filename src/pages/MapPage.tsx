/**
 * Главная страница — карта с фильтрами и drawer
 */
import { useState } from 'react';
import MapView from '../components/map/MapView';
import FeatureDrawer from '../components/map/FeatureDrawer';
import { useMapStore } from '../stores/mapStore';
import { CABLE_TYPE_LABELS, LAYING_METHOD_LABELS, OBJECT_TYPE_LABELS, LAYING_COLORS } from '../data/mockData';
import { Search, Filter, Plus, X } from 'lucide-react';
import type { CableType, LayingMethod, ObjectType } from '../types';

export default function MapPage() {
  const { filters, setFilters } = useMapStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  return (
    <div className="relative w-full h-full">
      {/* Карта */}
      <MapView />

      {/* Верхняя панель — поиск */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-96 max-w-[90%]">
        <div className="flex items-center gap-2 p-2 rounded-xl shadow-lg" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <Search className="w-4 h-4 ml-2" style={{ color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            placeholder="Поиск по адресу, коду, названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--color-text-primary)' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1">
              <X className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Левая панель — фильтры */}
      {showFilters && (
        <div
          className="absolute top-20 left-4 z-40 w-64 rounded-xl shadow-lg p-4 overflow-y-auto max-h-[calc(100vh-120px)]"
          style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <Filter className="w-4 h-4" /> Фильтры
            </h3>
            <button onClick={() => setShowFilters(false)} className="p-1">
              <X className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} />
            </button>
          </div>

          {/* Тип кабеля */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Тип кабеля</label>
            <select
              value={filters.cableType || ''}
              onChange={(e) => setFilters({ cableType: (e.target.value || null) as CableType | null })}
              className="w-full p-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="">Все типы</option>
              {Object.entries(CABLE_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Способ прокладки */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Способ прокладки</label>
            <select
              value={filters.layingMethod || ''}
              onChange={(e) => setFilters({ layingMethod: (e.target.value || null) as LayingMethod | null })}
              className="w-full p-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="">Все способы</option>
              {Object.entries(LAYING_METHOD_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Тип объекта */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Тип объекта</label>
            <select
              value={filters.objectType || ''}
              onChange={(e) => setFilters({ objectType: (e.target.value || null) as ObjectType | null })}
              className="w-full p-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="">Все типы</option>
              {Object.entries(OBJECT_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Владелец */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Владелец</label>
            <input
              type="text"
              placeholder="Название организации..."
              value={filters.owner || ''}
              onChange={(e) => setFilters({ owner: e.target.value || null })}
              className="w-full p-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Легенда */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Легенда (прокладка)</p>
            <div className="space-y-1.5">
              {Object.entries(LAYING_COLORS).map(([method, color]) => (
                <div key={method} className="flex items-center gap-2">
                  <div className="w-6 h-1 rounded" style={{ background: color }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{LAYING_METHOD_LABELS[method]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Сброс */}
          <button
            onClick={() => setFilters({ cableType: null, layingMethod: null, objectType: null, owner: null })}
            className="w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {/* Кнопка показать фильтры */}
      {!showFilters && (
        <button
          onClick={() => setShowFilters(true)}
          className="absolute top-20 left-4 z-40 p-3 rounded-xl shadow-lg"
          style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
        >
          <Filter className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
        </button>
      )}

      {/* Кнопки добавления */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-2">
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white transition-transform hover:scale-105"
          style={{ background: 'var(--color-accent)' }}
          onClick={() => alert('Режим рисования кабеля (линия) — в проде: интерактивный drawing tool')}
        >
          <Plus className="w-4 h-4" /> Добавить кабель
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white transition-transform hover:scale-105"
          style={{ background: 'var(--color-success)' }}
          onClick={() => alert('Режим добавления объекта (точка) — в проде: интерактивный drawing tool')}
        >
          <Plus className="w-4 h-4" /> Добавить объект
        </button>
      </div>

      {/* Drawer с информацией */}
      <FeatureDrawer />
    </div>
  );
}
