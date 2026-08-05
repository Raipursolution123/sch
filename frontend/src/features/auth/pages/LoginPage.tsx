import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { FormField } from '@components/forms/FormField';
import { useSchoolBrand } from '@hooks/usePublicBranding';
import { ROUTES } from '@constants/index';
import { authService } from '@services/api';
import { useAuthStore } from '@store/index';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { name } = useSchoolBrand();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const formErrorId = useId();
  const usernameId = useId();
  const passwordId = useId();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      const roleStr = data.user.role?.toLowerCase() || '';
      if (roleStr !== 'admin' && roleStr !== 'super admin') {
        setError('Access denied. Admin privileges required.');
        return;
      }
      setAuth(data.user, data.tokens.access, data.tokens.refresh);
      navigate(ROUTES.dashboard, { replace: true });
    },
    onError: () => setError('Invalid username or password'),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const formUsername = formData.get('username') as string;
    const formPassword = formData.get('password') as string;
    loginMutation.mutate({
      username: formUsername || username,
      password: formPassword || password,
    });
  };

  return (
    <div className="rounded-panel border border-border bg-card p-8">
      <p className="text-label text-muted-foreground">{name}</p>
      <h1 className="mt-1 font-display text-2xl font-medium tracking-display text-foreground">
        Sign in
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Access your school admin account</p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
        aria-describedby={error ? formErrorId : undefined}
        noValidate
      >
        <FormField label="Username" htmlFor={usernameId} required>
          <Input
            id={usernameId}
            type="text"
            name="username"
            value={username}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            required
            autoComplete="username"
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? formErrorId : undefined}
          />
        </FormField>
        <FormField label="Password" htmlFor={passwordId} required>
          <Input
            id={passwordId}
            type="password"
            name="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? formErrorId : undefined}
          />
        </FormField>
        {error && (
          <p
            id={formErrorId}
            className="text-sm text-destructive"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        )}
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

      <div className="mt-6 flex flex-col space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or log in as</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="w-full" onClick={() => navigate(ROUTES.staffLogin)}>
            Staff
          </Button>
        </div>
      </div>
    </div>
  );
}
