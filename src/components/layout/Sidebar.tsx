/**
 * Боковая навигация
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Map, Cable, Box, FileText, Users, ClipboardList, LogOut, Sun, Moon, ChevronLeft, ChevronRight, Upload } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/map', icon: Map, label: 'Карта' },
  { to: '/cables', icon: Cable, label: 'Кабели' },
  { to: '/objects', icon: Box, label: 'Объекты' },
  { to: '/documents', icon: FileText, label: 'Документы' },
  { to: '/import', icon: Upload, label: 'Импорт' },
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
      className="h-screen flex flex-col transition-all duration-300 relative"
      style={{
        width: collapsed ? '64px' : '240px',
        background: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Лого */}
      <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-accent)' }}>
          <Cable className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>ISP CRM</span>}
      </div>

      {/* Навигация */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${isActive ? 'font-medium' : ''}`
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
      <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--color-border)' }}>
        {/* Тема */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && <span>{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</span>}
        </button>

        {/* Пользователь */}
        {user && !collapsed && (
          <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--color-bg-primary)' }}>
            <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{user.full_name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{user.email}</p>
          </div>
        )}

        {/* Выход */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm"
          style={{ color: 'var(--color-danger)' }}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Выйти</span>}
        </button>
      </div>

      {/* Кнопка сворачивания */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
        style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} /> : <ChevronLeft className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} />}
      </button>
    </aside>
  );
}
