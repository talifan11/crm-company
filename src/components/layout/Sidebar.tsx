/**
 * Боковая навигация — профессиональный стиль
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Map, Cable, Box, FileText, Users, ClipboardList, LogOut, Sun, Moon, ChevronLeft, ChevronRight, Upload } from 'lucide-react';

import { Users as UsersIcon } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/map', icon: Map, label: 'Карта' },
  { to: '/cables', icon: Cable, label: 'Кабели' },
  { to: '/objects', icon: Box, label: 'Объекты' },
  { to: '/documents', icon: FileText, label: 'Документы' },
  { to: '/import', icon: Upload, label: 'Импорт' },
  { to: '/brigades', icon: UsersIcon, label: 'Бригады' },
  { to: '/admin/users', icon: Users, label: 'Пользователи', adminOnly: true },
  { to: '/audit', icon: ClipboardList, label: 'Журнал', adminOnly: true },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className="h-screen flex flex-col transition-all duration-200 relative"
      style={{
        width: collapsed ? '56px' : '220px',
        background: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Лого */}
      <div className="flex items-center gap-2.5 px-4 h-14 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-accent)' }}>
          <Cable className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="font-semibold text-sm block leading-tight" style={{ color: 'var(--color-text-primary)' }}>ISP CRM</span>
            <span className="text-[10px] leading-tight block" style={{ color: 'var(--color-text-muted)' }}>Учёт кабельных линий</span>
          </div>
        )}
      </div>

      {/* Навигация */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors ${
                  isActive ? '' : 'hover:bg-[var(--color-bg-tertiary)]'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'var(--color-accent)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
              })}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Нижняя панель */}
      <div className="px-2 pb-2 space-y-0.5 flex-shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
        {/* Тема */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-tertiary)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && <span>{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</span>}
        </button>

        {/* Пользователь */}
        {user && !collapsed && (
          <div className="px-2.5 py-2 rounded-md mx-0.5" style={{ background: 'var(--color-bg-tertiary)' }}>
            <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{user.full_name}</p>
            <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>{user.role === 'admin' ? 'Администратор' : user.role === 'engineer' ? 'Инженер' : 'Наблюдатель'}</p>
          </div>
        )}

        {/* Выход */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors"
          style={{ color: 'var(--color-danger)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-tertiary)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Выйти</span>}
        </button>
      </div>

      {/* Кнопка сворачивания */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronLeft className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
      </button>
    </aside>
  );
}
