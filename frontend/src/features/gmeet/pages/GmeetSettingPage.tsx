import { useState, useEffect } from 'react';
import { gmeetService, type GmeetSettings } from '@services/api/gmeet.service';
import { Label } from '@components/ui/label';
import { Input } from '@components/ui/input';
import { Switch } from '@components/ui/switch';
import { Button } from '@components/ui/button';
import { toast } from 'sonner';
import { Shield, Key, Eye, EyeOff } from 'lucide-react';
import { ModuleListPack } from '@workflow-packs';

export function GmeetSettingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [settings, setSettings] = useState<Partial<GmeetSettings>>({
    api_key: '',
    api_secret: '',
    use_api: 0,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await gmeetService.getSettings();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load Google Meet settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await gmeetService.updateSettings(settings);
      toast.success('Google Meet settings updated successfully.');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleListPack
      title="Google Meet Setting"
      description="Configure Google API credentials for GMeet Live Classes integration."
      isLoading={loading}
      loadingMessage="Loading settings..."
    >
      <div className="max-w-2xl mx-auto py-6">
        <form onSubmit={handleSave}>
          <div className="rounded-lg border bg-card text-card-foreground shadow-lg bg-card/60 backdrop-blur-md">
            <div className="p-6 space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <Shield className="h-5 w-5" />
                <h3 className="text-xl font-semibold">API Configuration</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Credentials used to create and authorize Google Meet events automatically.
              </p>
            </div>
            
            <div className="p-6 pt-0 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label className="text-base">Use Google Calendar API</Label>
                  <p className="text-sm text-muted-foreground">
                    Create GMeet links dynamically using OAuth/Calendar API. If disabled, meetings will require manual URLs.
                  </p>
                </div>
                <Switch
                  checked={settings.use_api === 1}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, use_api: checked ? 1 : 0 }))
                  }
                />
              </div>

              {settings.use_api === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="api_key">OAuth Client ID (API Key)</Label>
                    <div className="relative">
                      <Input
                        id="api_key"
                        placeholder="Enter Google Client ID"
                        value={settings.api_key || ''}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, api_key: e.target.value }))
                        }
                        className="pr-10"
                        required={settings.use_api === 1}
                      />
                      <Key className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api_secret">Client Secret (API Secret)</Label>
                    <div className="relative">
                      <Input
                        id="api_secret"
                        type={showSecret ? 'text' : 'password'}
                        placeholder="Enter Google Client Secret"
                        value={settings.api_secret || ''}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, api_secret: e.target.value }))
                        }
                        className="pr-10"
                        required={settings.use_api === 1}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 pt-0 flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={fetchSettings} disabled={saving}>
                Reset
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ModuleListPack>
  );
}
export default GmeetSettingPage;
