/**
 * Главный компонент приложения — роутинг
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUIStore } from './stores/uiStore';
import { useAuthStore } from './stores/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import MapPage from './pages/MapPage';
import CablesPage from './pages/CablesPage';
import ObjectsPage from './pages/ObjectsPage';
import DocumentsPage from './pages/DocumentsPage';
import ImportPage from './pages/ImportPage';
import UsersPage from './pages/UsersPage';
import AuditPage from './pages/AuditPage';

// Layout
import ProtectedRoute from './components/layout/ProtectedRoute';

export default function App() {
  const theme = useUIStore((s) => s.theme);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Применяем тему к body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/map" replace /> : <LoginPage />}
        />

        {/* Защищённые */}
        <Route element={<ProtectedRoute />}>
          <Route path="/map" element={<MapPage />} />
          <Route path="/cables" element={<CablesPage />} />
          <Route path="/objects" element={<ObjectsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/audit" element={<AuditPage />} />
        </Route>

        {/* Дефолтный редирект */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/map' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
