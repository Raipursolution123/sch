import { apiClient } from './client';

export interface Branch {
  id: number;
  branch_name: string;
  branch_url: string;
  hostname?: string;
  database_name?: string;
  username?: string;
  password?: string;
  is_verified?: number;
}

export interface OverviewData {
  school_students: Array<{
    name: string;
    session: string;
    total_student: number;
    total_fees: number;
    total_paid: number;
    total_balance: number;
  }>;
  school_transport_fees: Array<{
    name: string;
    session: string;
    total_fees: number;
    total_paid: number;
    total_balance: number;
  }>;
  student_admission_list: Array<{
    name: string;
    session: string;
    offline_admission: number;
    online_admission: number;
  }>;
  student_books_list: Array<{
    name: string;
    total_books: number;
    libarary_members: number;
    book_issued: number;
  }>;
  alumni_student_list: Array<{
    name: string;
    total_alumni_student: number;
  }>;
  staff_payroll: Array<{
    name: string;
    total_staff: number;
    payroll_generated: number;
    payroll_not_generated: number;
    payroll_paid: number;
    net_amount: number;
    paid_amount: number;
  }>;
  user_log_list: Array<{
    name: string;
    total_log: number;
  }>;
  school_online_course_fees: Array<{
    name: string;
    total_revenue: number;
  }>;
}

export const multibranchService = {
  getOverview: async (): Promise<OverviewData> => {
    const { data } = await apiClient.get<{ data: OverviewData }>('/settings/multibranch/overview/');
    return data.data;
  },

  listBranches: async (): Promise<Branch[]> => {
    const { data } = await apiClient.get<{ data: { branches: Branch[] } }>('/settings/multibranch/');
    return data.data.branches;
  },

  createBranch: async (payload: Partial<Branch>): Promise<Branch> => {
    const { data } = await apiClient.post<{ data: Branch }>('/settings/multibranch/', payload);
    return data.data;
  },

  deleteBranch: async (id: number): Promise<void> => {
    await apiClient.delete(`/settings/multibranch/${id}/`);
  },

  getReports: async (type: string): Promise<any[]> => {
    const { data } = await apiClient.get<{ data: { reports: any[] } }>(`/settings/multibranch/reports/?type=${type}`);
    return data.data.reports;
  },
};
