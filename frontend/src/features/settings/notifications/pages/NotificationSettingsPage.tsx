import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNotificationSettings, useUpdateNotificationSetting } from '@/hooks/useNotificationSettings';
import { Bell, Mail, Smartphone, Edit } from 'lucide-react';
import type { NotificationSetting } from '@/types/settings/notifications';

export const NotificationSettingsPage = () => {
  const { data: settings, isLoading } = useNotificationSettings();
  const { mutate: updateSetting } = useUpdateNotificationSetting();
  const [editingTemplate, setEditingTemplate] = useState<NotificationSetting | null>(null);

  // Form states for editing template
  const [subject, setSubject] = useState('');
  const [template, setTemplate] = useState('');

  const handleEditClick = (templateObj: NotificationSetting) => {
    setEditingTemplate(templateObj);
    setSubject(templateObj.subject || '');
    setTemplate(templateObj.template || '');
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    updateSetting(
      {
        id: editingTemplate.id,
        data: {
          subject,
          template,
        },
      },
      {
        onSuccess: () => {
          setEditingTemplate(null);
        },
      },
    );
  };

  const handleToggleChannel = (setting: NotificationSetting, channel: 'email' | 'sms' | 'push') => {
    let payload = {};
    if (channel === 'email') {
      payload = { is_mail: setting.is_mail === '1' ? '0' : '1' };
    } else if (channel === 'sms') {
      payload = { is_sms: setting.is_sms === '1' ? '0' : '1' };
    } else if (channel === 'push') {
      payload = { is_notification: setting.is_notification === 1 ? 0 : 1 };
    }

    updateSetting({
      id: setting.id,
      data: payload,
    });
  };

  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground">Loading notification settings...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Settings"
        description="Manage system-generated communication templates and dispatch options."
      />

      <div className="grid grid-cols-1 gap-4">
        {settings?.map((setting) => {
          const isEmailEnabled = setting.is_mail === '1';
          const isSmsEnabled = setting.is_sms === '1';
          const isPushEnabled = setting.is_notification === 1;

          return (
            <div key={setting.id} className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:border-muted-foreground/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                {/* Title & Metadata */}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary uppercase">
                      {setting.type?.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-lg">{setting.subject}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">{setting.template}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Variables: {setting.variables || 'None'}
                  </p>
                </div>

                {/* Dispatch Toggles & Actions */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Channels */}
                  <div className="flex items-center space-x-2 border-r pr-4">
                    <Button
                      variant={isEmailEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleChannel(setting, 'email')}
                      className="space-x-1"
                    >
                      <Mail className="h-4 w-4" />
                      <span className="text-xs">Email</span>
                    </Button>

                    <Button
                      variant={isSmsEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleChannel(setting, 'sms')}
                      className="space-x-1"
                    >
                      <Smartphone className="h-4 w-4" />
                      <span className="text-xs">SMS</span>
                    </Button>

                    <Button
                      variant={isPushEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleChannel(setting, 'push')}
                      className="space-x-1"
                    >
                      <Bell className="h-4 w-4" />
                      <span className="text-xs">Push</span>
                    </Button>
                  </div>

                  {/* Edit Template */}
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(setting)}>
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Template Dialog */}
      <Dialog open={editingTemplate !== null} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        {editingTemplate && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Notification Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Notification Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Admission Confirmation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Message Template Body</Label>
                <textarea
                  id="template"
                  rows={6}
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>

              <div className="rounded bg-muted p-3 text-xs space-y-1">
                <p className="font-semibold text-muted-foreground">Available Variables:</p>
                <p className="font-mono text-muted-foreground">{editingTemplate.variables || 'None'}</p>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setEditingTemplate(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Template</Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};
