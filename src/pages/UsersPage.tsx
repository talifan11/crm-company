/**
 * Страница управления пользователями (только admin)
 */
import { useState } from 'react';
import { ROLE_LABELS } from '../data/mockData';
import { UserPlus, Edit2, Ban, CheckCircle } from 'lucide-react';
import type { User, UserRole } from '../types';

// Демо-данные пользователей
const DEMO_USERS: User[] = [
  { id: 1, email: 'admin@isp.ru', full_name: 'Администратор Системы', role: 'admin', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 2, email: 'engineer@isp.ru', full_name: 'Иванов Пётр Сергеевич', role: 'engineer', is_active: true, created_at: '2024-01-15T00:00:00Z' },
  { id: 3, email: 'viewer@isp.ru', full_name: 'Сидоров Алексей', role: 'viewer', is_active: true, created_at: '2024-02-01T00:00:00Z' },
  { id: 4, email: 'petrov@isp.ru', full_name: 'Петров Дмитрий', role: 'engineer', is_active: false, created_at: '2024-03-10T00:00:00Z' },
];

export default function UsersPage() {
  const [users, setUsers] = useState(DEMO_USERS);
  const [showAdd, setShowAdd] = useState(false);

  const toggleActive = (id: number) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_active: !u.is_active } : u));
  };

  return (
    <div className="p-6 h-full overflow-auto">
<div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Пользователи</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Управление доступом</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
          style={{ background: 'var(--color-accent)' }}
        >
          <UserPlus className="w-4 h-4" /> Добавить
        </button>
      </div>

      {/* Форма добавления */}
      {showAdd && (
        <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>Новый пользователь</h3>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Email" className="p-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
            <input placeholder="ФИО" className="p-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
            <input type="password" placeholder="Пароль" className="p-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
            <select className="p-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
              <option value="viewer">Наблюдатель</option>
              <option value="engineer">Инженер</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <button className="mt-3 px-4 py-2 rounded-lg text-sm text-white" style={{ background: 'var(--color-accent)' }}>
            Создать
          </button>
        </div>
      )}

      {/* Таблица */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--color-bg-secondary)' }}>
              <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Email</th>
              <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>ФИО</th>
              <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Роль</th>
              <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Статус</th>
              <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--color-accent)' }}>{user.email}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>{user.full_name}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1 text-xs ${user.is_active ? '' : 'opacity-50'}`} style={{ color: user.is_active ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {user.is_active ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                    {user.is_active ? 'Активен' : 'Заблокирован'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:opacity-80" style={{ color: 'var(--color-accent)' }} title="Редактировать">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleActive(user.id)} className="p-1.5 rounded-lg hover:opacity-80" style={{ color: user.is_active ? 'var(--color-danger)' : 'var(--color-success)' }} title={user.is_active ? 'Заблокировать' : 'Разблокировать'}>
                      {user.is_active ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
