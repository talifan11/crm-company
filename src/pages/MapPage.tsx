/**
 * Главная страница — карта с фильтрами и drawer
 */
import { useState } from 'react';
import MapView from '../components/map/MapView';
import FeatureDrawer from '../components/map/FeatureDrawer';
import AddCableModal from '../components/modals/AddCableModal';
import AddObjectModal from '../components/modals/AddObjectModal';
import { useMapStore } from '../stores/mapStore';
import { CABLE_TYPE_LABELS, LAYING_METHOD_LABELS, OBJECT_TYPE_LABELS, LAYING_COLORS } from '../data/mockData';
import { Search, Filter, Plus, X } from 'lucide-react';
import type { CableType, LayingMethod, ObjectType } from '../types';

export default function MapPage() {
  const { filters, setFilters } = useMapStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [showAddCable, setShowAddCable] = useState(false);
  const [showAddObject, setShowAddObject] = useState(false);

  const handleAddCable = (data: any) => {
    console.log('Добавление кабеля:', data);
    // В проде: вызов API POST /api/v1/cables
    alert('Кабель добавлен (демо-режим)');
  };

  const handleAddObject = (data: any) => {
    console.log('Добавление объекта:', data);
    // В проде: вызов API POST /api/v1/objects
    alert('Объект добавлен (демо-режим)');
  };

  return (
    <div className="relative w-full h-full">
      {/* Карта */}
      <MapView />

      {/* Верхняя панель — поиск */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-96 max-w-[90%]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
          <Search className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Поиск по адресу, коду, названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--color-text-primary)' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-0.5">
              <X className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Левая панель — фильтры */}
      {showFilters && (
        <div
          className="absolute top-20 left-4 z-40 w-60 rounded-md overflow-y-auto max-h-[calc(100vh-120px)]"
          style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <Filter className="w-3.5 h-3.5" /> Фильтры
            </h3>
            <button onClick={() => setShowFilters(false)} className="p-0.5">
              <X className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Тип кабеля */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>Тип кабеля</label>
              <select
                value={filters.cableType || ''}
                onChange={(e) => setFilters({ cableType: (e.target.value || null) as CableType | null })}
                className="w-full px-2.5 py-1.5 rounded-md text-sm border"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <option value="">Все типы</option>
                {Object.entries(CABLE_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Способ прокладки */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>Способ прокладки</label>
              <select
                value={filters.layingMethod || ''}
                onChange={(e) => setFilters({ layingMethod: (e.target.value || null) as LayingMethod | null })}
                className="w-full px-2.5 py-1.5 rounded-md text-sm border"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <option value="">Все способы</option>
                {Object.entries(LAYING_METHOD_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Тип объекта */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>Тип объекта</label>
              <select
                value={filters.objectType || ''}
                onChange={(e) => setFilters({ objectType: (e.target.value || null) as ObjectType | null })}
                className="w-full px-2.5 py-1.5 rounded-md text-sm border"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <option value="">Все типы</option>
                {Object.entries(OBJECT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Владелец */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>Владелец</label>
              <input
                type="text"
                placeholder="Название организации..."
                value={filters.owner || ''}
                onChange={(e) => setFilters({ owner: e.target.value || null })}
                className="w-full px-2.5 py-1.5 rounded-md text-sm border"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>

            {/* Легенда */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Способ прокладки</p>
              <div className="space-y-1.5">
                {Object.entries(LAYING_COLORS).map(([method, color]) => (
                  <div key={method} className="flex items-center gap-2">
                    <div className="w-5 h-0.5 rounded" style={{ background: color }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{LAYING_METHOD_LABELS[method]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Сброс */}
            <button
              onClick={() => setFilters({ cableType: null, layingMethod: null, objectType: null, owner: null })}
              className="w-full py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
            >
              Сбросить
            </button>
          </div>
        </div>
      )}

      {/* Кнопка показать фильтры */}
      {!showFilters && (
        <button
          onClick={() => setShowFilters(true)}
          className="absolute top-20 left-4 z-40 p-2 rounded-md"
          style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <Filter className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
        </button>
      )}

      {/* Кнопки добавления */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-2">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
          style={{ background: 'var(--color-accent)' }}
          onClick={() => setShowAddCable(true)}
        >
          <Plus className="w-4 h-4" /> Добавить кабель
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
          style={{ background: 'var(--color-success)' }}
          onClick={() => setShowAddObject(true)}
        >
          <Plus className="w-4 h-4" /> Добавить объект
        </button>
      </div>

      {/* Drawer с информацией */}
      <FeatureDrawer />

      {/* Модалки */}
      <AddCableModal
        isOpen={showAddCable}
        onClose={() => setShowAddCable(false)}
        onSubmit={handleAddCable}
      />
      <AddObjectModal
        isOpen={showAddObject}
        onClose={() => setShowAddObject(false)}
        onSubmit={handleAddObject}
      />
    </div>
  );
}
