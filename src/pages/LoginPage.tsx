/**
 * Страница входа — профессиональный стиль
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Lock, Mail, AlertCircle, Cable } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="w-full max-w-sm">
        {/* Логотип */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3" style={{ background: 'var(--color-accent)' }}>
            <Cable className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>ISP CRM</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Система учёта кабельных линий</p>
        </div>

        {/* Форма */}
        <div className="rounded-lg p-6" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@isp.ru"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-md border"
                  style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-md border"
                  style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-md" style={{ background: 'rgb(220 38 38 / 0.1)', border: '1px solid var(--color-danger)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-danger)' }} />
                <span className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md font-medium text-white transition-colors disabled:opacity-50"
              style={{ background: 'var(--color-accent)' }}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>

        {/* Демо-доступ */}
        <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <p className="font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Демо-доступ:</p>
          <div className="space-y-1" style={{ color: 'var(--color-text-muted)' }}>
            <p><span className="font-mono">admin@isp.ru</span> / admin123</p>
            <p><span className="font-mono">engineer@isp.ru</span> / eng123</p>
            <p><span className="font-mono">viewer@isp.ru</span> / view123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
