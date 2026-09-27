/**
 * Модальное окно добавления объекта
 */
import { useState } from 'react';
import { X } from 'lucide-react';
import { OBJECT_TYPE_LABELS } from '../../data/mockData';
import type { ObjectType } from '../../types';

interface AddObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialCoordinates?: [number, number];
}

export default function AddObjectModal({ isOpen, onClose, onSubmit, initialCoordinates }: AddObjectModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    object_type: 'house' as ObjectType,
    address: '',
    parent_id: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
      geometry: initialCoordinates || [37.6173, 55.7558],
    });
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg" style={{ background: 'var(--color-bg-elevated)', boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b" style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Добавить объект</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Код */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Код *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder="MH-001"
              className="w-full px-3 py-2 rounded-md border"
              style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Название */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Название *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Колодец К-15"
              className="w-full px-3 py-2 rounded-md border"
              style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Тип объекта */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Тип объекта *</label>
            <select
              value={formData.object_type}
              onChange={(e) => handleChange('object_type', e.target.value)}
              className="w-full px-3 py-2 rounded-md border"
              style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              {Object.entries(OBJECT_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Адрес */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Адрес</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="ул. Тверская, д. 12"
              className="w-full px-3 py-2 rounded-md border"
              style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Координаты */}
          {initialCoordinates && (
            <div className="p-3 rounded-md" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Координаты</p>
              <p className="text-sm font-mono" style={{ color: 'var(--color-text-primary)' }}>
                {initialCoordinates[0].toFixed(6)}, {initialCoordinates[1].toFixed(6)}
              </p>
            </div>
          )}

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
