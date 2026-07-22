import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSmsSettings, useUpdateSmsSetting } from '@/hooks/useSmsSettings';
import { Key, Smartphone, ToggleLeft, ToggleRight, Check } from 'lucide-react';
import type { SmsConfig } from '@/types/settings/sms';

export const SmsSettingsPage = () => {
  const { data: configs, isLoading } = useSmsSettings();
  const { mutate: updateConfig, isPending } = useUpdateSmsSetting();
  const [selectedProvider, setSelectedProvider] = useState<SmsConfig | null>(null);

  // Form states
  const [apiId, setApiId] = useState('');
  const [authkey, setAuthkey] = useState('');
  const [senderid, setSenderid] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');

  const handleSelectProvider = (provider: SmsConfig) => {
    setSelectedProvider(provider);
    setApiId(provider.api_id || '');
    setAuthkey(provider.authkey || '');
    setSenderid(provider.senderid || '');
    setUsername(provider.username || '');
    setPassword(provider.password || '');
    setUrl(provider.url || '');
  };

  useEffect(() => {
    if (configs && configs.length > 0 && !selectedProvider) {
      // Find active provider first, otherwise select first one
      const active = configs.find(c => c.is_active === 'enabled') || configs[0];
      handleSelectProvider(active);
    }
  }, [configs, selectedProvider]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    updateConfig({
      id: selectedProvider.id,
      data: {
        api_id: apiId,
        authkey: authkey,
        senderid: senderid,
        username: username,
        password: password,
        url: url,
      },
    });
  };

  const handleToggleActive = (provider: SmsConfig) => {
    const newStatus = provider.is_active === 'enabled' ? 'disabled' : 'enabled';
    updateConfig({
      id: provider.id,
      data: {
        is_active: newStatus,
      },
    });
  };

  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground">Loading SMS settings...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="SMS Settings"
        description="Configure your SMS gateway providers and activate the preferred service."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left List of Providers */}
        <div className="space-y-4 md:col-span-1">
          <Label className="text-sm font-semibold text-muted-foreground">Gateway Providers</Label>
          {configs?.map((provider) => {
            const isActive = provider.is_active === 'enabled';
            const isSelected = selectedProvider?.id === provider.id;

            return (
              <div
                key={provider.id}
                onClick={() => handleSelectProvider(provider)}
                className={`rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer transition-all hover:border-primary/50 ${
                  isSelected ? 'border-primary ring-1 ring-primary' : ''
                }`}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{provider.type}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(provider);
                    }}
                    className={isActive ? 'text-green-600' : 'text-muted-foreground'}
                  >
                    {isActive ? (
                      <ToggleRight className="h-6 w-6" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Form Configuration */}
        <div className="md:col-span-2">
          {selectedProvider ? (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-xl font-semibold leading-none tracking-tight flex items-center space-x-2">
                  <span>Configure {selectedProvider.name}</span>
                  {selectedProvider.is_active === 'enabled' && (
                    <span className="flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      <Check className="mr-1 h-3 w-3" /> Active
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enter the API and authentication details provided by your SMS provider.
                </p>
              </div>
              <div className="p-6 pt-0">
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="api_id">API ID / Account SID</Label>
                      <Input
                        id="api_id"
                        value={apiId}
                        onChange={(e) => setApiId(e.target.value)}
                        placeholder="e.g. ACxxxxxxxxxxxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="authkey">Auth Token / Key</Label>
                      <Input
                        id="authkey"
                        type="password"
                        value={authkey}
                        onChange={(e) => setAuthkey(e.target.value)}
                        placeholder="Authentication Secret Key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="senderid">Sender ID</Label>
                      <Input
                        id="senderid"
                        value={senderid}
                        onChange={(e) => setSenderid(e.target.value)}
                        placeholder="e.g. SCHOOL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username (Optional)</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username if required"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="url">Gateway URL</Label>
                      <Input
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://api.sms-provider.com/v1/send"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" disabled={isPending}>
                      Save Configuration
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Key className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <h3 className="font-semibold text-lg">No Provider Selected</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Select an SMS gateway provider from the list on the left to view and edit its parameters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
