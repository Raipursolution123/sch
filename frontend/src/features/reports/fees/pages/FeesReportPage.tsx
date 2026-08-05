import { useMemo, useState } from 'react';
import { Input } from '@components/ui/input';
import { Combobox } from '@components/ui/combobox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { FormField } from '@components/forms/FormField';
import { PageContainer } from '@components/layout/PageContainer';
import { EmptyState } from '@components/feedback/EmptyState';
import { ErrorState } from '@components/feedback/ErrorState';
import { LoadingState } from '@components/feedback/LoadingState';
import { ReportHeader, ReportSummaryGrid, ReportFilterBar } from '@components/reports';
import { DueFeesSearchTable } from '@features/fees/due-search/components/DueFeesSearchTable';
import { PaymentSearchTable } from '@features/fees/payment-search/components/PaymentSearchTable';
import { sectionOptionsForClass } from '@features/students/utils/class-section-options';
import { useFeeDueSearch, useFeePaymentSearch } from '@hooks/useFeeSearch';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useActiveSession } from '@hooks/useSessions';
import { exportToCsv } from '@utils/export-csv';
import { formatAmount, formatDate } from '@utils/format';
import { printReport } from '@utils/print-report';
import { todayIsoDate } from '@utils/student';

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

const PAYMENT_MODE_OPTIONS = [
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

  const classOptions = useMemo(
    () =>
      classes
        .filter((c) => c.is_active === 'yes')
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((c) => ({ value: String(c.id), label: c.class_name })),
    [classes],
  );

  const dueSectionOptions = useMemo(() => {
    if (dueClassId <= 0) return [];
    return sectionOptionsForClass(classSections, dueClassId);
  }, [dueClassId, classSections]);

  const paySectionOptions = useMemo(() => {
    if (payClassId <= 0) return [];
    return sectionOptionsForClass(classSections, payClassId);
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

  const sessionLabel = activeSession ? `Session ${activeSession.session}` : undefined;

  return (
    <PageContainer>
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

        <TabsContent value="due" className="space-y-4">
          <ReportFilterBar
            sessionLabel={sessionLabel}
            onApply={() => setDueSubmitted(true)}
            applyDisabled={dueSubmitted && dueReport.isLoading}
          >
            <FormField label="Class" htmlFor="fees_report_due_class">
              <Combobox
                id="fees_report_due_class"
                options={classOptions}
                value={dueClassId ? String(dueClassId) : ''}
                onValueChange={(v) => {
                  setDueClassId(v ? Number(v) : 0);
                  setDueSectionId(0);
                  setDueSubmitted(false);
                }}
                allowEmpty
                emptyLabel="All classes"
                placeholder="All classes"
                searchPlaceholder="Search class…"
              />
            </FormField>
            <FormField label="Section" htmlFor="fees_report_due_section">
              <Combobox
                id="fees_report_due_section"
                options={dueSectionOptions}
                value={dueSectionId ? String(dueSectionId) : ''}
                onValueChange={(v) => {
                  setDueSectionId(v ? Number(v) : 0);
                  setDueSubmitted(false);
                }}
                allowEmpty
                emptyLabel="All sections"
                placeholder="All sections"
                searchPlaceholder="Search section…"
                disabled={dueClassId > 0 && dueSectionOptions.length === 0}
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

          {dueSubmitted && dueReport.isLoading && <LoadingState message="Loading due fees…" />}
          {dueSubmitted && dueReport.isError && (
            <ErrorState
              message="Could not load due fees report."
              onRetry={() => void dueReport.refetch()}
            />
          )}
          {dueSubmitted && dueReport.data && (
            <>
              <ReportSummaryGrid
                items={[
                  { label: 'Students with dues', value: dueReport.data.students.length },
                  {
                    label: 'Total outstanding',
                    value: formatAmount(dueReport.data.total_balance),
                    tone: dueReport.data.total_balance > 0 ? 'destructive' : 'success',
                  },
                ]}
              />
              {dueReport.data.students.length > 0 ? (
                <DueFeesSearchTable students={dueReport.data.students} />
              ) : (
                <EmptyState
                  title="No outstanding dues"
                  description="Widen class filters or clear search — or collect fees first."
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <ReportFilterBar
            sessionLabel={sessionLabel}
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
              <Combobox
                id="fees_report_pay_class"
                options={classOptions}
                value={payClassId ? String(payClassId) : ''}
                onValueChange={(v) => {
                  setPayClassId(v ? Number(v) : 0);
                  setPaySectionId(0);
                  setPaySubmitted(false);
                }}
                allowEmpty
                emptyLabel="All classes"
                placeholder="All classes"
                searchPlaceholder="Search class…"
              />
            </FormField>
            <FormField label="Section" htmlFor="fees_report_pay_section">
              <Combobox
                id="fees_report_pay_section"
                options={paySectionOptions}
                value={paySectionId ? String(paySectionId) : ''}
                onValueChange={(v) => {
                  setPaySectionId(v ? Number(v) : 0);
                  setPaySubmitted(false);
                }}
                allowEmpty
                emptyLabel="All sections"
                placeholder="All sections"
                searchPlaceholder="Search section…"
                disabled={payClassId > 0 && paySectionOptions.length === 0}
              />
            </FormField>
            <FormField label="Payment mode" htmlFor="fees_report_mode">
              <Combobox
                id="fees_report_mode"
                options={PAYMENT_MODE_OPTIONS}
                value={paymentMode}
                onValueChange={(v) => {
                  setPaymentMode(v);
                  setPaySubmitted(false);
                }}
                allowEmpty
                emptyLabel="All modes"
                placeholder="All modes"
                searchPlaceholder="Search mode…"
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

          {paySubmitted && payReport.isLoading && <LoadingState message="Loading payments…" />}
          {paySubmitted && payReport.isError && (
            <ErrorState
              message="Could not load payment report."
              onRetry={() => void payReport.refetch()}
            />
          )}
          {paySubmitted && payReport.data && (
            <>
              <ReportSummaryGrid
                items={[
                  { label: 'Payments', value: payReport.data.payments.length },
                  {
                    label: 'Total collected',
                    value: formatAmount(payReport.data.total_amount),
                    tone: 'success',
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
                <EmptyState
                  title="No payments found"
                  description="Widen the date range or clear class/mode filters."
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
