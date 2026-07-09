import {
  Briefcase,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  IndianRupee,
  Settings2,
  Users,
} from 'lucide-react';
import { ROUTES } from '@constants/index';
import type { QuickActionItem } from '@components/dashboard/QuickActionTile';

export const DASHBOARD_QUICK_ACTIONS: QuickActionItem[] = [
  {
    label: 'Students',
    description: 'Browse and manage student profiles',
    path: ROUTES.students.root,
    icon: Users,
    tone: 'primary',
  },
  {
    label: 'Staff',
    description: 'View employee records and profiles',
    path: ROUTES.staff.root,
    icon: Briefcase,
    tone: 'neutral',
  },
  {
    label: 'Mark Attendance',
    description: 'Record daily class attendance',
    path: ROUTES.attendance.mark,
    icon: CalendarCheck,
    tone: 'success',
  },
  {
    label: 'Fee Types',
    description: 'Configure fee categories and amounts',
    path: ROUTES.fees.feeTypes,
    icon: IndianRupee,
    tone: 'warning',
  },
  {
    label: 'Exam Schedule',
    description: 'Manage exam dates and rooms',
    path: ROUTES.examinations.schedule,
    icon: ClipboardList,
    tone: 'primary',
  },
  {
    label: 'Academic Session',
    description: 'Set the active academic year',
    path: ROUTES.academics.sessions,
    icon: CalendarDays,
    tone: 'neutral',
  },
  {
    label: 'General Settings',
    description: 'School profile and preferences',
    path: ROUTES.settings.general,
    icon: Settings2,
    tone: 'neutral',
  },
];
