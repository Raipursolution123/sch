import { useState, useEffect } from 'react';
import { zoomService, type ZoomSettings } from '@services/api/zoom.service';
import { Label } from '@components/ui/label';
import { Input } from '@components/ui/input';
import { Switch } from '@components/ui/switch';
import { Button } from '@components/ui/button';
import { toast } from 'sonner';
import { Shield, Key, Eye, EyeOff } from 'lucide-react';
import { ModuleListPack } from '@workflow-packs';

export function ZoomSettingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [settings, setSettings] = useState<Partial<ZoomSettings>>({
    zoom_api_key: '',
    zoom_api_secret: '',
    use_teacher_api: 1,
    use_zoom_app: 1,
    use_zoom_app_user: 1,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await zoomService.getSettings();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load Zoom settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await zoomService.updateSettings(settings);
      toast.success('Zoom settings updated successfully.');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleListPack
      title="Zoom Setting"
      description="Configure Zoom Live Classes API credentials and Client App settings."
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
                Credentials used to create and authorize Zoom meetings/webinars automatically.
              </p>
            </div>
            
            <div className="p-6 pt-0 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="zoom_api_key">Zoom API Key</Label>
                  <div className="relative">
                    <Input
                      id="zoom_api_key"
                      placeholder="Enter Zoom API Key"
                      value={settings.zoom_api_key || ''}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, zoom_api_key: e.target.value }))
                      }
                      className="pr-10"
                      required
                    />
                    <Key className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zoom_api_secret">Zoom API Secret (SDK Secret)</Label>
                  <div className="relative">
                    <Input
                      id="zoom_api_secret"
                      type={showSecret ? 'text' : 'password'}
                      placeholder="Enter Zoom API Secret"
                      value={settings.zoom_api_secret || ''}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, zoom_api_secret: e.target.value }))
                      }
                      className="pr-10"
                      required
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

              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Use Teacher API Credentials</Label>
                    <p className="text-xs text-muted-foreground">
                      Use staff's own Zoom credentials if defined on their profiles.
                    </p>
                  </div>
                  <Switch
                    checked={settings.use_teacher_api === 1}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, use_teacher_api: checked ? 1 : 0 }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Use Zoom Client for Staff</Label>
                    <p className="text-xs text-muted-foreground">
                      Open Zoom Client App for staff when starting a class or meeting.
                    </p>
                  </div>
                  <Switch
                    checked={settings.use_zoom_app === 1}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, use_zoom_app: checked ? 1 : 0 }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Use Zoom Client for Students</Label>
                    <p className="text-xs text-muted-foreground">
                      Open Zoom Client App for students when joining a class.
                    </p>
                  </div>
                  <Switch
                    checked={settings.use_zoom_app_user === 1}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, use_zoom_app_user: checked ? 1 : 0 }))
                    }
                  />
                </div>
              </div>
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
export default ZoomSettingPage;
