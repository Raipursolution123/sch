import { useEffect, useState } from 'react';
import { multibranchService, type Branch } from '@services/api/multibranch.service';
import { Button } from '@components/ui/button';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@components/ui/dialog';

export function MultiBranchSettingPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Form states
  const [branchName, setBranchName] = useState('');
  const [branchUrl, setBranchUrl] = useState('');
  const [hostname, setHostname] = useState('localhost');
  const [dbName, setDbName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBranches = () => {
    setLoading(true);
    multibranchService.listBranches()
      .then(setBranches)
      .catch((err) => setError(err.message || 'Failed to load branches.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    multibranchService.createBranch({
      branch_name: branchName,
      branch_url: branchUrl,
      hostname,
      database_name: dbName,
      username,
      password,
    })
      .then(() => {
        setOpen(false);
        // Reset form
        setBranchName('');
        setBranchUrl('');
        setHostname('localhost');
        setDbName('');
        setUsername('');
        setPassword('');
        fetchBranches();
      })
      .catch((err) => alert(err.message || 'Failed to create branch.'))
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Are you sure you want to delete this branch settings?')) return;
    multibranchService.deleteBranch(id)
      .then(fetchBranches)
      .catch((err) => alert(err.message || 'Failed to delete branch.'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Multi-Branch Settings</h1>
          <p className="text-sm text-muted-foreground">Add, configure, and manage database connection details for branches.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Branch
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Branch Name</th>
                  <th className="py-2">URL</th>
                  <th className="py-2">Database Name</th>
                  <th className="py-2">Hostname</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr key={b.id} className="border-b">
                    <td className="py-2 font-medium">{b.branch_name}</td>
                    <td className="py-2">{b.branch_url}</td>
                    <td className="py-2">{b.database_name || '—'}</td>
                    <td className="py-2">{b.hostname || '—'}</td>
                    <td className="py-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(b.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {branches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      No branch configurations found. Add a branch to configure connections.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Branch Settings</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Branch Name</label>
              <input
                type="text"
                required
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. Raipur Branch"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Branch URL</label>
              <input
                type="text"
                required
                value={branchUrl}
                onChange={(e) => setBranchUrl(e.target.value)}
                placeholder="e.g. http://raipur.myschool.com"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Hostname</label>
              <input
                type="text"
                required
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Database Name</label>
              <input
                type="text"
                required
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                placeholder="e.g. branch_raipur"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="db user"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="db password"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Verifying & Saving...' : 'Verify & Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
