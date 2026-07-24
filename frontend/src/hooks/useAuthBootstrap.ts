import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@services/api';
import { useAuthStore } from '@store/index';

/** Refresh `/auth/me` on dashboard load so legacy_permissions stay current. */
export function useAuthBootstrap() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  const { data } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data, setUser]);
}
