/**
 * Модальное окно добавления кабеля
 */
import { useState } from 'react';
import { X } from 'lucide-react';
import { CABLE_TYPE_LABELS, LAYING_METHOD_LABELS, mockObjects } from '../../data/mockData';
import type { CableType, LayingMethod } from '../../types';

interface AddCableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialGeometry?: [number, number][];
}

export default function AddCableModal({ isOpen, onClose, onSubmit, initialGeometry }: AddCableModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    cable_type: 'optical' as CableType,
    laying_method: 'ground' as LayingMethod,
    length_m: 0,
    from_object_id: '',
    to_object_id: '',
    owner: '',
    install_date: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      length_m: parseFloat(String(formData.length_m)) || 0,
      from_object_id: parseInt(formData.from_object_id) || 1,
      to_object_id: parseInt(formData.to_object_id) || 1,
      geometry: initialGeometry || [[37.6, 55.7], [37.7, 55.8]],
    });
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg" style={{ background: 'var(--color-bg-elevated)', boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b" style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Добавить кабель</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Код и название */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Код *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="OK-001"
                className="w-full px-3 py-2 rounded-md border"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Название *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Оптический кабель"
                className="w-full px-3 py-2 rounded-md border"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>

          {/* Тип и способ прокладки */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Тип кабеля *</label>
              <select
                value={formData.cable_type}
                onChange={(e) => handleChange('cable_type', e.target.value)}
                className="w-full px-3 py-2 rounded-md border"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                {Object.entries(CABLE_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Способ прокладки *</label>
              <select
                value={formData.laying_method}
                onChange={(e) => handleChange('laying_method', e.target.value)}
                className="w-full px-3 py-2 rounded-md border"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                {Object.entries(LAYING_METHOD_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Длина */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Длина (м) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.1"
              value={formData.length_m}
              onChange={(e) => handleChange('length_m', e.target.value)}
              className="w-full px-3 py-2 rounded-md border"
              style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Откуда и куда */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>От объекта *</label>
              <select
                required
                value={formData.from_object_id}
                onChange={(e) => handleChange('from_object_id', e.target.value)}
                className="w-full px-3 py-2 rounded-md border"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <option value="">Выберите объект</option>
                {mockObjects.map(obj => (
                  <option key={obj.id} value={obj.id}>{obj.code} — {obj.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>До объекта *</label>
              <select
                required
                value={formData.to_object_id}
                onChange={(e) => handleChange('to_object_id', e.target.value)}
                className="w-full px-3 py-2 rounded-md border"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <option value="">Выберите объект</option>
                {mockObjects.map(obj => (
                  <option key={obj.id} value={obj.id}>{obj.code} — {obj.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Владелец и дата */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Владелец</label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => handleChange('owner', e.target.value)}
                placeholder="ООО Провайдер"
                className="w-full px-3 py-2 rounded-md border"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Дата монтажа</label>
              <input
                type="date"
                value={formData.install_date}
                onChange={(e) => handleChange('install_date', e.target.value)}
                className="w-full px-3 py-2 rounded-md border"
                style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>

          {/* Примечания */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Примечания</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Дополнительная информация..."
              className="w-full px-3 py-2 rounded-md border resize-none"
              style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Кнопки */}
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium"
              style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md font-medium text-white"
              style={{ background: 'var(--color-accent)' }}
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
