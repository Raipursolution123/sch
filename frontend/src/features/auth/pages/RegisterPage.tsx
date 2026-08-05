import { useId, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { FormField } from '@components/forms/FormField';
import { useSchoolBrand } from '@hooks/usePublicBranding';
import { ROUTES } from '@constants/index';
import { authService } from '@services/api';
import { useAuthStore } from '@store/index';
import { getApiErrorMessage } from '@utils/session';

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { name } = useSchoolBrand();
  const [form, setForm] = useState({
    username: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const formErrorId = useId();
  const firstNameId = useId();
  const lastNameId = useId();
  const usernameId = useId();
  const passwordId = useId();
  const confirmId = useId();

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.access, data.tokens.refresh);
      navigate(ROUTES.dashboard, { replace: true });
    },
    onError: (error) => {
      setError(getApiErrorMessage(error, 'Registration failed. Please check your details.'));
    },
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

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="rounded-panel border border-border bg-card p-8">
      <p className="text-label text-muted-foreground">{name}</p>
      <h1 className="mt-1 font-display text-2xl font-medium tracking-display text-foreground">
        Create account
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Register for {name}</p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
        aria-describedby={error ? formErrorId : undefined}
        noValidate
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="First name" htmlFor={firstNameId} required>
            <Input
              id={firstNameId}
              name="first_name"
              value={form.first_name}
              onChange={(e) => updateField('first_name', e.target.value)}
              required
              autoComplete="given-name"
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={error ? formErrorId : undefined}
            />
          </FormField>
          <FormField label="Last name" htmlFor={lastNameId}>
            <Input
              id={lastNameId}
              name="last_name"
              value={form.last_name}
              onChange={(e) => updateField('last_name', e.target.value)}
              autoComplete="family-name"
              aria-invalid={Boolean(error) || undefined}
            />
          </FormField>
        </div>
        <FormField label="Email address" htmlFor={usernameId} required>
          <Input
            id={usernameId}
            type="email"
            name="username"
            value={form.username}
            onChange={(e) => updateField('username', e.target.value)}
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
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? formErrorId : undefined}
          />
        </FormField>
        <FormField label="Confirm password" htmlFor={confirmId} required>
          <Input
            id={confirmId}
            type="password"
            name="password_confirm"
            value={form.password_confirm}
            onChange={(e) => updateField('password_confirm', e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
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
