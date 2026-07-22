export interface FinancialReportResponse {
  period: {
    start_date: string;
    end_date: string;
  };
  revenue: {
    general_income: number;
    student_fees: {
      total: number;
      breakdown: Record<string, number>;
    };
    total: number;
  };
  expenditures: {
    general_expenses: number;
    staff_payroll: {
      total: number;
      breakdown: Record<string, number>;
    };
    total: number;
  };
  net_profit: number;
  is_profitable: boolean;
}
