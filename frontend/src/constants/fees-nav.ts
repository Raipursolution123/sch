import { ROUTES } from './routes';

export interface FeesNavItem {
  label: string;
  path?: string;
  disabled?: boolean;
}

/** Single source for Fees links in the main sidebar. */
export const FEES_NAV: FeesNavItem[] = [
  { label: 'Fee Types', path: ROUTES.fees.feeTypes },
  { label: 'Fee Groups', path: ROUTES.fees.feeGroups },
  { label: 'Fee Discounts', path: ROUTES.fees.discounts },
  { label: 'Assign Discounts', path: ROUTES.fees.discountsAssign },
  { label: 'Assign Fees', path: ROUTES.fees.assign },
  { label: 'Fee Reminders', path: ROUTES.fees.reminders },
];
