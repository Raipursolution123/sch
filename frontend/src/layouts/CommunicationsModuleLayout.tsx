import { ModuleSubNavLayout, type ModuleNavItem } from '@components/layout/ModuleSubNavLayout';
import { ROUTES } from '@constants/index';

export const COMMUNICATIONS_MODULE_NAV: ModuleNavItem[] = [
  { label: 'Notices', path: ROUTES.communicate.notices },
  { label: 'Send email', path: ROUTES.communicate.sendEmail },
  { label: 'Send SMS', path: ROUTES.communicate.sendSms },
  { label: 'Email / SMS', path: ROUTES.communicate.emailSms },
  { label: 'Email / SMS log', path: ROUTES.communicate.emailSmsLog },
  { label: 'Schedule log', path: ROUTES.communicate.scheduleLog },
  { label: 'Bulk email', path: ROUTES.communicate.bulkEmail },
  { label: 'Email templates', path: ROUTES.communicate.emailTemplate },
  { label: 'SMS templates', path: ROUTES.communicate.smsTemplate },
];

export function CommunicationsModuleLayout() {
  return <ModuleSubNavLayout title="Communicate" nav={COMMUNICATIONS_MODULE_NAV} />;
}
