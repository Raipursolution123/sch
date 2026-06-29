import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { ROUTES } from '@constants/index';
import { authService } from '@services/api';
import { useAuthStore } from '@store/index';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.access, data.tokens.refresh);
      navigate(ROUTES.dashboard, { replace: true });
    },
    onError: () => setError('Invalid username or password'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Access your School ERP account</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Username"
          type="text"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" isLoading={loginMutation.isPending} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.register} className="font-medium text-primary hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
