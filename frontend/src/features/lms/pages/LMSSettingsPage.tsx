import { useEffect, useState } from 'react';
import { lmsService } from '@services/api/lms.service';
import { Button } from '@components/ui/button';
import { Loader2 } from 'lucide-react';

export function LMSSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestPrefix, setGuestPrefix] = useState('');
  const [guestIdStart, setGuestIdStart] = useState('');
  const [guestLogin, setGuestLogin] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchSettings = () => {
    setLoading(true);
    lmsService.getSettings()
      .then((data) => {
        setGuestPrefix(data.guest_prefix);
        setGuestIdStart(String(data.guest_id_start_from));
        setGuestLogin(data.guest_login);
      })
      .catch((err) => setError(err.message || 'Failed to load settings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    lmsService.updateSettings({
      guest_prefix: guestPrefix,
      guest_id_start_from: Number(guestIdStart),
      guest_login: guestLogin,
    })
      .then(() => alert('Settings updated successfully.'))
      .catch((err) => alert(err.message || 'Failed to update settings.'))
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Online Course Settings</h1>
        <p className="text-sm text-muted-foreground">Adjust guest prefix, default start ID, and guest login configurations.</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold">Guest Prefix</label>
            <input
              type="text"
              required
              value={guestPrefix}
              onChange={(e) => setGuestPrefix(e.target.value)}
              placeholder="e.g. GUEST"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Guest ID Start From</label>
            <input
              type="number"
              required
              value={guestIdStart}
              onChange={(e) => setGuestIdStart(e.target.value)}
              placeholder="e.g. 1"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="guestLogin"
              checked={guestLogin === 1}
              onChange={(e) => setGuestLogin(e.target.checked ? 1 : 0)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="guestLogin" className="text-sm font-semibold select-none cursor-pointer">
              Allow Guest Login
            </label>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
