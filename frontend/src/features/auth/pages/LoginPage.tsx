import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { ROUTES } from '@constants/index';
import { authService } from '@services/api';
import { useAuthStore } from '@store/index';

export function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.access, data.tokens.refresh);
      window.location.href = ROUTES.dashboard;
    },
    onError: () => setError('Invalid username or password'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
      <p className="mt-1 text-sm text-gray-600">Access your School ERP account</p>

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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" isLoading={loginMutation.isPending} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.register} className="font-medium text-primary-600 hover:text-primary-700">
          Register
        </Link>
      </p>
    </div>
  );
}
