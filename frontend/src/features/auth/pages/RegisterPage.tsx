import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { ROUTES } from '@constants/index';
import { authService } from '@services/api';
import { useAuthStore } from '@store/index';

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({
    username: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.access, data.tokens.refresh);
      navigate(ROUTES.dashboard, { replace: true });
    },
    onError: () => setError('Registration failed. Please check your details.'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirm) {
      setError('Passwords do not match');
      return;
    }
    registerMutation.mutate(form);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-foreground">Create account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Register for School ERP</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            name="first_name"
            value={form.first_name}
            onChange={(e) => updateField('first_name', e.target.value)}
          />
          <Input
            label="Last name"
            name="last_name"
            value={form.last_name}
            onChange={(e) => updateField('last_name', e.target.value)}
          />
        </div>
        <Input
          label="Username"
          type="text"
          name="username"
          value={form.username}
          onChange={(e) => updateField('username', e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          required
        />
        <Input
          label="Confirm password"
          type="password"
          name="password_confirm"
          value={form.password_confirm}
          onChange={(e) => updateField('password_confirm', e.target.value)}
          required
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" isLoading={registerMutation.isPending} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
