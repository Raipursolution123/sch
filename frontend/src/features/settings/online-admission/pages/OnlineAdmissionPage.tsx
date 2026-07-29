import { useState, useEffect } from 'react';
import { apiClient } from '@services/api';
import { ModuleSettingsPack } from '@workflow-packs';
import { toast } from 'sonner';

export function OnlineAdmissionPage() {
  const [loading, setLoading] = useState(true);
  const [onlineAdmission, setOnlineAdmission] = useState(0);
  const [onlineAdmissionPayment, setOnlineAdmissionPayment] = useState('no');
  const [onlineAdmissionAmount, setOnlineAdmissionAmount] = useState('0.00');
  const [onlineAdmissionInstruction, setOnlineAdmissionInstruction] = useState('');
  const [onlineAdmissionConditions, setOnlineAdmissionConditions] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/settings/online-admission/');
      if (res.data && res.data.data) {
        const d = res.data.data;
        setOnlineAdmission(d.online_admission);
        setOnlineAdmissionPayment(d.online_admission_payment);
        setOnlineAdmissionAmount(d.online_admission_amount);
        setOnlineAdmissionInstruction(d.online_admission_instruction || '');
        setOnlineAdmissionConditions(d.online_admission_conditions || '');
      }
    } catch (err) {
      toast.error('Failed to load Online Admission settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.patch('/settings/online-admission/', {
        online_admission: onlineAdmission,
        online_admission_payment: onlineAdmissionPayment,
        online_admission_amount: onlineAdmissionAmount,
        online_admission_instruction: onlineAdmissionInstruction,
        online_admission_conditions: onlineAdmissionConditions,
      });
      toast.success('Online admission settings updated successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <ModuleSettingsPack
      title="Online Admission Settings"
      description="Configure public/online admission portal form settings, descriptions, and payment guidelines."
      isLoading={loading}
      isError={false}
      tabs={[
        {
          id: 'config',
          label: 'General Configuration',
          content: (
            <form onSubmit={handleSave} className="space-y-4 max-w-2xl bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Online Admission Portal</label>
                  <p className="text-xs text-gray-500">Allow public access to application forms.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOnlineAdmission(onlineAdmission === 1 ? 0 : 1)}
                  className={`rounded-full px-4 py-1 text-xs font-semibold shadow-sm transition-all ${
                    onlineAdmission === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {onlineAdmission === 1 ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Admission Fee Requirement</label>
                <select
                  value={onlineAdmissionPayment}
                  onChange={(e) => setOnlineAdmissionPayment(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="no">Free / No Payment</option>
                  <option value="yes">Paid application</option>
                </select>
              </div>

              {onlineAdmissionPayment === 'yes' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Application Amount ($ / ₹)</label>
                  <input
                    type="text"
                    value={onlineAdmissionAmount}
                    onChange={(e) => setOnlineAdmissionAmount(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Instructions for applicants</label>
                <textarea
                  rows={3}
                  value={onlineAdmissionInstruction}
                  onChange={(e) => setOnlineAdmissionInstruction(e.target.value)}
                  placeholder="Enter guidelines..."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Terms & Conditions</label>
                <textarea
                  rows={3}
                  value={onlineAdmissionConditions}
                  onChange={(e) => setOnlineAdmissionConditions(e.target.value)}
                  placeholder="Enter terms..."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 rounded-md px-4 py-2 text-sm font-semibold text-white shadow"
                >
                  Save Settings
                </button>
              </div>
            </form>
          ),
        },
      ]}
      activeTab="config"
      onTabChange={() => {}}
    />
  );
}
