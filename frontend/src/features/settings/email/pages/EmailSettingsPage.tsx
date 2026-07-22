import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useEmailSettings, useUpdateEmailSetting } from '@/hooks/useEmailSettings';
import { Mail, Check, ToggleLeft, ToggleRight } from 'lucide-react';

export const EmailSettingsPage = () => {
  const { data: config, isLoading } = useEmailSettings();
  const { mutate: updateConfig, isPending } = useUpdateEmailSetting();

  // Form states
  const [smtpServer, setSmtpServer] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [sslTls, setSslTls] = useState('tls');
  const [smtpAuth, setSmtpAuth] = useState('yes');
  const [isActive, setIsActive] = useState<'yes' | 'no'>('no');

  useEffect(() => {
    if (config) {
      setSmtpServer(config.smtp_server || '');
      setSmtpPort(config.smtp_port || '');
      setSmtpUsername(config.smtp_username || '');
      setSmtpPassword(config.smtp_password || '');
      setSslTls(config.ssl_tls || 'tls');
      setSmtpAuth(config.smtp_auth || 'yes');
      setIsActive(config.is_active || 'no');
    }
  }, [config]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      smtp_server: smtpServer,
      smtp_port: smtpPort,
      smtp_username: smtpUsername,
      smtp_password: smtpPassword,
      ssl_tls: sslTls,
      smtp_auth: smtpAuth,
      is_active: isActive,
    });
  };

  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground">Loading Email settings...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Settings"
        description="Configure SMTP server settings to send emails from your institution."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Side Status Card */}
        <div className="md:col-span-1">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-xl font-semibold leading-none tracking-tight">SMTP Service</h3>
              <p className="text-sm text-muted-foreground">Current status of outbound emails</p>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="flex items-center space-x-3 rounded-md border p-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">SMTP Gateway</p>
                  <p className="text-xs text-muted-foreground">
                    {isActive === 'yes' ? 'Sending enabled' : 'Sending disabled'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsActive(isActive === 'yes' ? 'no' : 'yes')}
                  className={isActive === 'yes' ? 'text-green-600' : 'text-muted-foreground'}
                >
                  {isActive === 'yes' ? (
                    <ToggleRight className="h-7 w-7" />
                  ) : (
                    <ToggleLeft className="h-7 w-7" />
                  )}
                </Button>
              </div>

              {isActive === 'yes' && (
                <div className="flex items-center rounded-md bg-green-50 p-2 text-xs text-green-800">
                  <Check className="mr-1 h-4 w-4" /> System is configured to route emails through your server.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Form Card */}
        <div className="md:col-span-2">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-xl font-semibold leading-none tracking-tight">SMTP Credentials</h3>
              <p className="text-sm text-muted-foreground">Enter the host, port, and security credentials of your SMTP provider.</p>
            </div>
            <div className="p-6 pt-0">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="smtp_server">SMTP Server Hostname *</Label>
                    <Input
                      id="smtp_server"
                      value={smtpServer}
                      onChange={(e) => setSmtpServer(e.target.value)}
                      placeholder="e.g. smtp.gmail.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_port">SMTP Port *</Label>
                    <Input
                      id="smtp_port"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="e.g. 587 or 465"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ssl_tls">Security Protocol *</Label>
                    <Select
                      id="ssl_tls"
                      value={sslTls}
                      onChange={(e) => setSslTls(e.target.value)}
                      options={[
                        { value: 'ssl', label: 'SSL' },
                        { value: 'tls', label: 'TLS' },
                        { value: 'none', label: 'None' },
                      ]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_username">SMTP Username / Email *</Label>
                    <Input
                      id="smtp_username"
                      type="email"
                      value={smtpUsername}
                      onChange={(e) => setSmtpUsername(e.target.value)}
                      placeholder="e.g. school@gmail.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_password">SMTP Password *</Label>
                    <Input
                      id="smtp_password"
                      type="password"
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      placeholder="Email Application Password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_auth">SMTP Authentication *</Label>
                    <Select
                      id="smtp_auth"
                      value={smtpAuth}
                      onChange={(e) => setSmtpAuth(e.target.value)}
                      options={[
                        { value: 'yes', label: 'Yes (Authenticated)' },
                        { value: 'no', label: 'No (Anonymous)' },
                      ]}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={isPending}>
                    Save Email Configuration
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
