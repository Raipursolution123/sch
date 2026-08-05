import { ModuleSubNavLayout, type ModuleNavItem } from '@components/layout/ModuleSubNavLayout';
import { ROUTES } from '@constants/index';

export const FEES_MODULE_NAV: ModuleNavItem[] = [
  { label: 'Collect', path: ROUTES.fees.collect },
  { label: 'Due search', path: ROUTES.fees.dueSearch },
  { label: 'Payment search', path: ROUTES.fees.paymentSearch },
  { label: 'Fees master', path: ROUTES.fees.master },
  { label: 'Fee types', path: ROUTES.fees.feeTypes },
  { label: 'Fee groups', path: ROUTES.fees.feeGroups },
  { label: 'Assign', path: ROUTES.fees.assign },
  { label: 'Discounts', path: ROUTES.fees.discounts },
  { label: 'Assign discounts', path: ROUTES.fees.discountsAssign },
  { label: 'Carry forward', path: ROUTES.fees.carryForward },
  { label: 'Reminders', path: ROUTES.fees.reminders },
  { label: 'Offline payments', path: ROUTES.fees.offlinePayments },
  { label: 'Gateways', path: ROUTES.fees.paymentGateways },
  { label: 'Scheme / scholarship', path: ROUTES.fees.schemeScholarship },
  { label: 'Apply scheme', path: ROUTES.fees.applySchemeScholarship },
  { label: 'Positive adjustment', path: ROUTES.fees.positiveFeeAdjustment },
];

export function FeesModuleLayout() {
  return <ModuleSubNavLayout title="Fees" nav={FEES_MODULE_NAV} />;
}
