import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePaymentGateways, useUpdatePaymentGateway } from '@/hooks/usePaymentMethods';
import { CreditCard, ToggleLeft, ToggleRight, Check } from 'lucide-react';
import type { PaymentGateway } from '@/types/settings/payment-methods';

export const PaymentMethodsPage = () => {
  const { data: gateways, isLoading } = usePaymentGateways();
  const { mutate: updateGateway, isPending } = useUpdatePaymentGateway();
  const [selectedGatewayId, setSelectedGatewayId] = useState<number | null>(null);

  // Form states
  const [apiUsername, setApiUsername] = useState('');
  const [apiSecretKey, setApiSecretKey] = useState('');
  const [apiPublishableKey, setApiPublishableKey] = useState('');
  const [salt, setSalt] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [paypalDemo, setPaypalDemo] = useState('');
  const [paytmWebsite, setPaytmWebsite] = useState('');
  const [paytmIndustrytype, setPaytmIndustrytype] = useState('');

  // Find the selected gateway object from the latest query data
  const selectedGateway = gateways?.find((g) => g.id === selectedGatewayId) || null;

  useEffect(() => {
    if (gateways && gateways.length > 0 && selectedGatewayId === null) {
      const active = gateways.find((g) => g.is_active === 'yes') || gateways[0];
      setSelectedGatewayId(active.id);
    }
  }, [gateways, selectedGatewayId]);

  // Sync form inputs when selected gateway changes
  useEffect(() => {
    if (selectedGateway) {
      setApiUsername(selectedGateway.api_username || '');
      setApiSecretKey(selectedGateway.api_secret_key || '');
      setApiPublishableKey(selectedGateway.api_publishable_key || '');
      setSalt(selectedGateway.salt || '');
      setAccountNo(selectedGateway.account_no || '');
      setPaypalDemo(selectedGateway.paypal_demo || '');
      setPaytmWebsite(selectedGateway.paytm_website || '');
      setPaytmIndustrytype(selectedGateway.paytm_industrytype || '');
    }
  }, [selectedGatewayId, gateways]);

  const handleSelectGateway = (gateway: PaymentGateway) => {
    setSelectedGatewayId(gateway.id);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGateway) return;

    updateGateway({
      id: selectedGateway.id,
      data: {
        api_username: apiUsername,
        api_secret_key: apiSecretKey,
        api_publishable_key: apiPublishableKey,
        salt,
        account_no: accountNo,
        paypal_demo: paypalDemo,
        paytm_website: paytmWebsite,
        paytm_industrytype: paytmIndustrytype,
      },
    });
  };

  const handleToggleActive = (gateway: PaymentGateway) => {
    const newStatus = gateway.is_active === 'yes' ? 'no' : 'yes';
    updateGateway({
      id: gateway.id,
      data: {
        is_active: newStatus,
      },
    });
  };

  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground">Loading payment gateways...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Gateways"
        description="Configure third-party payment integration gateways for student fee collections."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left list of Gateways */}
        <div className="space-y-4 md:col-span-1">
          <Label className="text-sm font-semibold text-muted-foreground">Gateway Providers</Label>
          {gateways?.map((gateway) => {
            const isActive = gateway.is_active === 'yes';
            const isSelected = selectedGatewayId === gateway.id;

            return (
              <div
                key={gateway.id}
                onClick={() => handleSelectGateway(gateway)}
                className={`rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer transition-all hover:border-primary/50 ${
                  isSelected ? 'border-primary ring-1 ring-primary' : ''
                }`}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{gateway.payment_type}</p>
                      {isActive && (
                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-1.5 py-0.5 text-xs font-medium text-green-500">
                          <Check className="mr-0.5 h-3 w-3" /> Active
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(gateway);
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isActive ? (
                      <ToggleRight className="h-6 w-6 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right configuration form */}
        <div className="md:col-span-2">
          {selectedGateway ? (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-xl font-semibold leading-none tracking-tight flex items-center space-x-2">
                  <span>Configure {selectedGateway.payment_type}</span>
                  {selectedGateway.is_active === 'yes' && (
                    <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-500 uppercase">
                      Active
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Update integration keys and operational mode parameters.
                </p>
              </div>
              <div className="p-6 pt-0">
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedGateway.payment_type.toLowerCase() === 'paypal' ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="api_username">API Username</Label>
                          <Input
                            id="api_username"
                            value={apiUsername}
                            onChange={(e) => setApiUsername(e.target.value)}
                            placeholder="PayPal API Username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paypal_demo">Sandbox Mode</Label>
                          <select
                            id="paypal_demo"
                            value={paypalDemo}
                            onChange={(e) => setPaypalDemo(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="sandbox">Sandbox (Testing)</option>
                            <option value="live">Live (Production)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="account_no">Account Number</Label>
                          <Input
                            id="account_no"
                            value={accountNo}
                            onChange={(e) => setAccountNo(e.target.value)}
                            placeholder="PayPal Merchant ID"
                          />
                        </div>
                      </>
                    ) : selectedGateway.payment_type.toLowerCase() === 'paytm' ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="api_username">Merchant ID</Label>
                          <Input
                            id="api_username"
                            value={apiUsername}
                            onChange={(e) => setApiUsername(e.target.value)}
                            placeholder="Paytm MID"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paytm_website">Website</Label>
                          <Input
                            id="paytm_website"
                            value={paytmWebsite}
                            onChange={(e) => setPaytmWebsite(e.target.value)}
                            placeholder="e.g. WEBSTAGING / DEFAULT"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paytm_industrytype">Industry Type</Label>
                          <Input
                            id="paytm_industrytype"
                            value={paytmIndustrytype}
                            onChange={(e) => setPaytmIndustrytype(e.target.value)}
                            placeholder="e.g. Retail"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="api_publishable_key">Publishable Key</Label>
                          <Input
                            id="api_publishable_key"
                            value={apiPublishableKey}
                            onChange={(e) => setApiPublishableKey(e.target.value)}
                            placeholder="API Publishable Key"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="salt">Salt Key</Label>
                          <Input
                            id="salt"
                            value={salt}
                            onChange={(e) => setSalt(e.target.value)}
                            placeholder="Salt token/value"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="api_secret_key">Secret Key / Private Key *</Label>
                      <Input
                        id="api_secret_key"
                        type="password"
                        value={apiSecretKey}
                        onChange={(e) => setApiSecretKey(e.target.value)}
                        placeholder="••••••••••••••••••••••••••••••••"
                        required
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
              <CreditCard className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <h3 className="font-semibold text-lg">No Gateway Selected</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Select a gateway from the list on the left to configure integration parameters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PaymentMethodsPage;
