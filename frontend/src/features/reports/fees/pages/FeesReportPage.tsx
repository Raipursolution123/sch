import { useMemo, useState } from 'react';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { FormField } from '@components/forms/FormField';
import { ReportHeader, ReportSummaryGrid } from '@components/reports';
import { DueFeesSearchTable } from '@features/fees/due-search/components/DueFeesSearchTable';
import { PaymentSearchTable } from '@features/fees/payment-search/components/PaymentSearchTable';
import {
  firstSectionIdForClass,
  sectionOptionsForClass,
} from '@features/students/utils/class-section-options';
import { useFeeDueSearch, useFeePaymentSearch } from '@hooks/useFeeSearch';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useActiveSession } from '@hooks/useSessions';
import { exportToCsv } from '@utils/export-csv';
import { formatAmount, formatDate } from '@utils/format';
import { printReport } from '@utils/print-report';
import { todayIsoDate } from '@utils/student';
import { ReportFilterBar } from '@components/reports/ReportFilterBar';

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

const PAYMENT_MODE_OPTIONS = [
  { value: '', label: 'All modes' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'bank transfer', label: 'Bank Transfer' },
  { value: 'online', label: 'Online' },
];

export function FeesReportPage() {
  const { data: activeSession } = useActiveSession();
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results || [];

  const [tab, setTab] = useState<'due' | 'payments'>('due');

  const [dueClassId, setDueClassId] = useState(0);
  const [dueSectionId, setDueSectionId] = useState(0);
  const [dueQuery, setDueQuery] = useState('');
  const [dueSubmitted, setDueSubmitted] = useState(true);

  const [fromDate, setFromDate] = useState(daysAgoIso(30));
  const [toDate, setToDate] = useState(todayIsoDate());
  const [payClassId, setPayClassId] = useState(0);
  const [paySectionId, setPaySectionId] = useState(0);
  const [payQuery, setPayQuery] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [paySubmitted, setPaySubmitted] = useState(true);

  const dueFilters = useMemo(
    () => ({
      ...(dueClassId > 0 ? { class_id: dueClassId } : {}),
      ...(dueSectionId > 0 ? { section_id: dueSectionId } : {}),
      ...(dueQuery.trim() ? { q: dueQuery.trim() } : {}),
    }),
    [dueClassId, dueSectionId, dueQuery],
  );

  const payFilters = useMemo(
    () => ({
      from_date: fromDate,
      to_date: toDate,
      ...(payClassId > 0 ? { class_id: payClassId } : {}),
      ...(paySectionId > 0 ? { section_id: paySectionId } : {}),
      ...(payQuery.trim() ? { q: payQuery.trim() } : {}),
      ...(paymentMode ? { payment_mode: paymentMode } : {}),
    }),
    [fromDate, toDate, payClassId, paySectionId, payQuery, paymentMode],
  );

  const dueReport = useFeeDueSearch(dueFilters, dueSubmitted && tab === 'due');
  const payReport = useFeePaymentSearch(payFilters, paySubmitted && tab === 'payments');

  const classOptions = [
    { value: '', label: 'All classes' },
    ...classes
      .filter((c) => c.is_active === 'yes')
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({ value: String(c.id), label: c.class_name })),
  ];

  const dueSectionOptions = useMemo(() => {
    if (dueClassId <= 0) return [{ value: '', label: 'All sections' }];
    return [
      { value: '', label: 'All sections' },
      ...sectionOptionsForClass(classSections, dueClassId),
    ];
  }, [dueClassId, classSections]);

  const paySectionOptions = useMemo(() => {
    if (payClassId <= 0) return [{ value: '', label: 'All sections' }];
    return [
      { value: '', label: 'All sections' },
      ...sectionOptionsForClass(classSections, payClassId),
    ];
  }, [payClassId, classSections]);

  const handleExportCsv = () => {
    if (tab === 'due' && dueReport.data) {
      exportToCsv(
        'fees-due-report',
        ['Student', 'Admission No.', 'Class', 'Due', 'Paid', 'Balance'],
        dueReport.data.students.map((row) => [
          row.full_name,
          row.admission_no,
          `${row.class_name ?? ''} ${row.section_name ?? ''}`.trim(),
          String(row.total_due),
          String(row.total_paid),
          String(row.total_balance),
        ]),
      );
      return;
    }
    if (tab === 'payments' && payReport.data) {
      exportToCsv(
        'fees-payment-report',
        ['Date', 'Student', 'Receipt', 'Amount', 'Mode', 'Class'],
        payReport.data.payments.map((row) => [
          row.date,
          row.full_name,
          row.payment_id,
          String(row.amount),
          row.payment_mode,
          `${row.class_name ?? ''} ${row.section_name ?? ''}`.trim(),
        ]),
      );
    }
  };

  const exportDisabled =
    tab === 'due' ? !dueReport.data?.students.length : !payReport.data?.payments.length;

  return (
    <div className="space-y-6">
      <ReportHeader
        title="Finance & Fees Report"
        description="Outstanding dues and collected payments for the active session."
        onPrint={printReport}
        onExportCsv={handleExportCsv}
        exportDisabled={exportDisabled}
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as 'due' | 'payments')}>
        <TabsList>
          <TabsTrigger value="due">Due Fees</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="due">
          <ReportFilterBar
            sessionLabel={activeSession ? `Session ${activeSession.session}` : undefined}
            onApply={() => setDueSubmitted(true)}
            applyDisabled={dueSubmitted && dueReport.isLoading}
          >
            <FormField label="Class" htmlFor="fees_report_due_class">
              <Select
                id="fees_report_due_class"
                options={classOptions}
                value={dueClassId ? String(dueClassId) : ''}
                onChange={(e) => {
                  const nextClassId = Number(e.target.value) || 0;
                  setDueClassId(nextClassId);
                  setDueSectionId(
                    nextClassId > 0 ? (firstSectionIdForClass(classSections, nextClassId) ?? 0) : 0,
                  );
                  setDueSubmitted(false);
                }}
              />
            </FormField>
            <FormField label="Section" htmlFor="fees_report_due_section">
              <Select
                id="fees_report_due_section"
                options={dueSectionOptions}
                value={dueSectionId ? String(dueSectionId) : ''}
                onChange={(e) => {
                  setDueSectionId(Number(e.target.value) || 0);
                  setDueSubmitted(false);
                }}
                disabled={dueClassId <= 0}
              />
            </FormField>
            <FormField label="Search" htmlFor="fees_report_due_q">
              <Input
                id="fees_report_due_q"
                placeholder="Name or admission no."
                value={dueQuery}
                onChange={(e) => {
                  setDueQuery(e.target.value);
                  setDueSubmitted(false);
                }}
              />
            </FormField>
          </ReportFilterBar>

          {dueSubmitted && dueReport.isLoading && (
            <p className="text-sm text-muted-foreground">Loading due fees report…</p>
          )}
          {dueSubmitted && dueReport.isError && (
            <p className="text-sm text-destructive">Could not load due fees report.</p>
          )}
          {dueSubmitted && dueReport.data && (
            <>
              <ReportSummaryGrid
                items={[
                  { label: 'Students with dues', value: dueReport.data.students.length },
                  {
                    label: 'Total outstanding',
                    value: formatAmount(dueReport.data.total_balance),
                  },
                ]}
              />
              {dueReport.data.students.length > 0 ? (
                <DueFeesSearchTable students={dueReport.data.students} />
              ) : (
                <p className="text-sm text-muted-foreground">No outstanding dues found.</p>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="payments">
          <ReportFilterBar
            sessionLabel={activeSession ? `Session ${activeSession.session}` : undefined}
            onApply={() => setPaySubmitted(true)}
            applyDisabled={paySubmitted && payReport.isLoading}
          >
            <FormField label="From" htmlFor="fees_report_from">
              <Input
                id="fees_report_from"
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPaySubmitted(false);
                }}
              />
            </FormField>
            <FormField label="To" htmlFor="fees_report_to">
              <Input
                id="fees_report_to"
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPaySubmitted(false);
                }}
              />
            </FormField>
            <FormField label="Class" htmlFor="fees_report_pay_class">
              <Select
                id="fees_report_pay_class"
                options={classOptions}
                value={payClassId ? String(payClassId) : ''}
                onChange={(e) => {
                  const nextClassId = Number(e.target.value) || 0;
                  setPayClassId(nextClassId);
                  setPaySectionId(
                    nextClassId > 0 ? (firstSectionIdForClass(classSections, nextClassId) ?? 0) : 0,
                  );
                  setPaySubmitted(false);
                }}
              />
            </FormField>
            <FormField label="Section" htmlFor="fees_report_pay_section">
              <Select
                id="fees_report_pay_section"
                options={paySectionOptions}
                value={paySectionId ? String(paySectionId) : ''}
                onChange={(e) => {
                  setPaySectionId(Number(e.target.value) || 0);
                  setPaySubmitted(false);
                }}
                disabled={payClassId <= 0}
              />
            </FormField>
            <FormField label="Payment mode" htmlFor="fees_report_mode">
              <Select
                id="fees_report_mode"
                options={PAYMENT_MODE_OPTIONS}
                value={paymentMode}
                onChange={(e) => {
                  setPaymentMode(e.target.value);
                  setPaySubmitted(false);
                }}
              />
            </FormField>
            <FormField label="Student" htmlFor="fees_report_pay_q">
              <Input
                id="fees_report_pay_q"
                placeholder="Name or admission no."
                value={payQuery}
                onChange={(e) => {
                  setPayQuery(e.target.value);
                  setPaySubmitted(false);
                }}
              />
            </FormField>
          </ReportFilterBar>

          {paySubmitted && payReport.isLoading && (
            <p className="text-sm text-muted-foreground">Loading payment report…</p>
          )}
          {paySubmitted && payReport.isError && (
            <p className="text-sm text-destructive">Could not load payment report.</p>
          )}
          {paySubmitted && payReport.data && (
            <>
              <ReportSummaryGrid
                items={[
                  { label: 'Payments', value: payReport.data.payments.length },
                  {
                    label: 'Total collected',
                    value: formatAmount(payReport.data.total_amount),
                  },
                  {
                    label: 'Period',
                    value: `${formatDate(fromDate)} – ${formatDate(toDate)}`,
                  },
                ]}
              />
              {payReport.data.payments.length > 0 ? (
                <PaymentSearchTable payments={payReport.data.payments} />
              ) : (
                <p className="text-sm text-muted-foreground">No payments found for this period.</p>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
