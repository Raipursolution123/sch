import { useMemo, useState } from 'react';
import { Input } from '@components/ui/input';
import { Combobox } from '@components/ui/combobox';
import { FormField } from '@components/forms/FormField';
import { ReportSummaryGrid } from '@components/reports';
import { PaymentSearchTable } from '@features/fees/payment-search/components/PaymentSearchTable';
import { sectionOptionsForClass } from '@features/students/utils/class-section-options';
import { useFeePaymentSearch } from '@hooks/useFeeSearch';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { useActiveSession } from '@hooks/useSessions';
import { exportToCsv } from '@utils/export-csv';
import { formatAmount, formatDate } from '@utils/format';
import { todayIsoDate } from '@utils/student';
import { ModuleReportPack } from '@workflow-packs';

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

export function PaymentSearchPage() {
  const { data: activeSession } = useActiveSession();
  const { data: classesData } = useClasses();
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections();
  const classSections = classSectionsData?.results || [];

  const [fromDate, setFromDate] = useState(daysAgoIso(30));
  const [toDate, setToDate] = useState(todayIsoDate());
  const [classId, setClassId] = useState(0);
  const [sectionId, setSectionId] = useState(0);
  const [query, setQuery] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [submitted, setSubmitted] = useState(true);

  const filters = useMemo(
    () => ({
      from_date: fromDate,
      to_date: toDate,
      ...(classId > 0 ? { class_id: classId } : {}),
      ...(sectionId > 0 ? { section_id: sectionId } : {}),
      ...(query.trim() ? { q: query.trim() } : {}),
      ...(paymentMode ? { payment_mode: paymentMode } : {}),
    }),
    [fromDate, toDate, classId, sectionId, query, paymentMode],
  );

  const { data, isLoading, isError, error, refetch } = useFeePaymentSearch(filters, submitted);

  const classOptions = useMemo(
    () =>
      classes
        .filter((c) => c.is_active === 'yes')
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((c) => ({ value: String(c.id), label: c.class_name })),
    [classes],
  );

  const sectionOptions = useMemo(() => {
    if (classId <= 0) return [];
    return sectionOptionsForClass(classSections, classId);
  }, [classId, classSections]);

  const handleExportCsv = () => {
    if (!data) return;
    exportToCsv(
      `fee-payments-${fromDate}-to-${toDate}`,
      ['Date', 'Student', 'Admission No', 'Class', 'Section', 'Fee Type', 'Amount', 'Mode', 'Note'],
      data.payments.map((row) => [
        row.date,
        row.full_name,
        row.admission_no,
        row.class_name,
        row.section_name,
        row.feetype_name ?? '',
        String(row.amount),
        row.payment_mode,
        row.description ?? '',
      ]),
    );
  };

  return (
    <ModuleReportPack
      title="Search Payments"
      description="Review fee payments recorded within a date range."
      sessionLabel={activeSession ? `Session ${activeSession.session}` : undefined}
      printSubtitle={`${formatDate(fromDate)} – ${formatDate(toDate)}`}
      submitted={submitted}
      hasData={Boolean(data?.payments.length)}
      onApply={() => setSubmitted(true)}
      onExportCsv={data?.payments.length ? handleExportCsv : undefined}
      exportDisabled={!data?.payments.length}
      filters={
        <>
          <FormField label="From" htmlFor="payment_search_from">
            <Input
              id="payment_search_from"
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setSubmitted(false);
              }}
            />
          </FormField>
          <FormField label="To" htmlFor="payment_search_to">
            <Input
              id="payment_search_to"
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setSubmitted(false);
              }}
            />
          </FormField>
          <FormField label="Class" htmlFor="payment_search_class">
            <Combobox
              id="payment_search_class"
              options={classOptions}
              value={classId ? String(classId) : ''}
              onValueChange={(v) => {
                setClassId(v ? Number(v) : 0);
                setSectionId(0);
                setSubmitted(false);
              }}
              allowEmpty
              emptyLabel="All classes"
              placeholder="All classes"
              searchPlaceholder="Search class…"
            />
          </FormField>
          <FormField label="Section" htmlFor="payment_search_section">
            <Combobox
              id="payment_search_section"
              options={sectionOptions}
              value={sectionId ? String(sectionId) : ''}
              onValueChange={(v) => {
                setSectionId(v ? Number(v) : 0);
                setSubmitted(false);
              }}
              allowEmpty
              emptyLabel="All sections"
              placeholder="All sections"
              searchPlaceholder="Search section…"
              disabled={classId > 0 && sectionOptions.length === 0}
            />
          </FormField>
          <FormField label="Student" htmlFor="payment_search_query">
            <Input
              id="payment_search_query"
              value={query}
              placeholder="Name or admission no."
              onChange={(e) => {
                setQuery(e.target.value);
                setSubmitted(false);
              }}
            />
          </FormField>
          <FormField label="Payment mode" htmlFor="payment_search_mode">
            <Combobox
              id="payment_search_mode"
              options={PAYMENT_MODE_OPTIONS}
              value={paymentMode}
              onValueChange={(v) => {
                setPaymentMode(v);
                setSubmitted(false);
              }}
              allowEmpty
              emptyLabel="All modes"
              placeholder="All modes"
              searchPlaceholder="Search mode…"
            />
          </FormField>
        </>
      }
      summary={
        data ? (
          <ReportSummaryGrid
            items={[
              { label: 'Payments', value: data.total_payments },
              {
                label: 'Total collected',
                value: formatAmount(data.total_amount),
                tone: 'success',
              },
            ]}
          />
        ) : undefined
      }
      isLoading={isLoading}
      loadingMessage="Searching payments..."
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={submitted && !isLoading && !isError && (data?.payments.length ?? 0) === 0}
      emptyTitle="No payments found"
      emptyDescription="Widen the date range or clear class/mode filters, then apply again."
    >
      {data && data.payments.length > 0 && <PaymentSearchTable payments={data.payments} />}
    </ModuleReportPack>
  );
}
