import { useAuthStore } from '@store/index';

export function useAuth() {
  const { user, isAuthenticated, setAuth, setUser, clearAuth } = useAuthStore();
  return { user, isAuthenticated, setAuth, setUser, clearAuth };
}
