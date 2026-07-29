import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { ROUTES } from '@constants/index';
import { authService } from '@services/api';
import { useAuthStore } from '@store/index';
import { ShieldCheck } from 'lucide-react';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Allow if the user has staff role or is a superadmin.
      // If we only want to restrict in backend, we can remove this, but for UX:
      if (data.user.role !== 'staff' && !data.user.is_superadmin) {
        setError('Access denied. Staff privileges required.');
        return;
      }
      setAuth(data.user, data.tokens.access, data.tokens.refresh);
      navigate(ROUTES.dashboard, { replace: true });
    },
    onError: () => setError('Invalid credentials or insufficient permissions'),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-lg ring-1 ring-primary/10">
      <div className="mb-6 flex flex-col items-center space-y-2">
        <div className="rounded-full bg-primary/10 p-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Portal</h1>
        <p className="text-sm text-muted-foreground">Secure access for administrators</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Admin Username"
          type="text"
          name="username"
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
        )}
        <Button type="submit" isLoading={loginMutation.isPending} className="w-full" size="lg">
          Login as Admin
        </Button>
      </form>

      <div className="mt-6 flex flex-col space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="w-full" onClick={() => navigate(ROUTES.login)}>
            Student Login
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate(ROUTES.staffLogin)}>
            Staff Login
          </Button>
        </div>
      </div>
    </div>
  );
}
