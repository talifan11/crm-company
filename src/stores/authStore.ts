/**
 * Zustand store — авторизация
 * Исправлено: корректная работа persist + функции
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

// Демо-пользователи для статического фронтенда
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@isp.ru': {
    password: 'admin123',
    user: { id: 1, email: 'admin@isp.ru', full_name: 'Администратор Системы', role: 'admin' as UserRole, is_active: true, created_at: '2024-01-01T00:00:00Z' }
  },
  'engineer@isp.ru': {
    password: 'eng123',
    user: { id: 2, email: 'engineer@isp.ru', full_name: 'Иванов Пётр Сергеевич', role: 'engineer' as UserRole, is_active: true, created_at: '2024-01-15T00:00:00Z' }
  },
  'viewer@isp.ru': {
    password: 'view123',
    user: { id: 3, email: 'viewer@isp.ru', full_name: 'Сидоров Алексей', role: 'viewer' as UserRole, is_active: true, created_at: '2024-02-01T00:00:00Z' }
  },
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (email: string, password: string): Promise<boolean> => {
        // Имитация задержки сети
        await new Promise(r => setTimeout(r, 600));
        
        const entry = DEMO_USERS[email.toLowerCase().trim()];
        if (!entry || entry.password !== password) {
          return false;
        }
        
        set({
          user: entry.user,
          token: 'mock-jwt-token-' + Date.now(),
          isAuthenticated: true,
        });
        return true;
      },

      logout: () => {
        set({ ...initialState });
      },

      resetAuth: () => {
        set({ ...initialState });
      },
    }),
    {
      name: 'isp-auth',
      storage: createJSONStorage(() => localStorage),
      // Сохраняем только данные состояния, не функции
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // При rehydration проверяем целостность
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error || !state) {
            // Если ошибка — сбрасываем
            useAuthStore.setState({ ...initialState });
            return;
          }
          // Если есть токен, но нет пользователя — сбрасываем
          if (state.isAuthenticated && !state.user) {
            useAuthStore.setState({ ...initialState });
          }
        };
      },
    }
  )
);
