/**
 * Страница входа
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const success = await login(email, password);
    setLoading(false);
    
    if (success) {
      navigate('/map');
    } else {
      setError('Неверный email или пароль');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="w-full max-w-md p-8 rounded-xl shadow-2xl" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        {/* Логотип */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'var(--color-accent)' }}>
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>ISP CRM</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Система учёта кабельных линий</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@isp.ru"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition-colors"
                style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition-colors"
                style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-danger)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-danger)' }} />
              <span className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
            style={{ background: 'var(--color-accent)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-accent)')}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        {/* Демо-доступ */}
        <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Демо-доступ:</p>
          <div className="space-y-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <p><span className="font-mono">admin@isp.ru</span> / admin123 — Админ</p>
            <p><span className="font-mono">engineer@isp.ru</span> / eng123 — Инженер</p>
            <p><span className="font-mono">viewer@isp.ru</span> / view123 — Наблюдатель</p>
          </div>
        </div>
      </div>
    </div>
  );
}
