import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { ROUTES } from '@constants/index';
import { authService } from '@services/api';
import { useAuthStore } from '@store/index';
import { Users } from 'lucide-react';

export function StaffLoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      const roleStr = data.user.role?.toLowerCase() || '';
      if (['student', 'parent', 'admin', 'super admin'].includes(roleStr)) {
        setError('Access denied. Staff role required.');
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
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Staff Portal</h1>
        <p className="text-sm text-muted-foreground">Secure access for staff members</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Staff Username"
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
          Login as Staff
        </Button>
      </form>
    </div>
  );
}
