import { useMemo, useState } from 'react';
import { Search, Save } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { FormField } from '@components/forms/FormField';
import { Select } from '@components/ui/select';
import { ModuleMarkGridPack } from '@workflow-packs';
import { useClasses } from '@hooks/useClasses';
import { useClassSections } from '@hooks/useClassSections';
import { sectionOptionsForClass } from '@features/students/utils/class-section-options';
import {
  useAssignStudentTransportFees,
  useStudentTransportFeeRoster,
} from '@hooks/useStudentTransportFees';
import { useRoutePickupPoints } from '@hooks/useRoutePickupPoints';
import { useTransportRoutes } from '@hooks/useTransportRoutes';
import { usePickupPoints } from '@hooks/usePickupPoints';
import type { StudentTransportFeeRoster } from '@services/api/student-transport-fees.service';

type StudentRow = StudentTransportFeeRoster['students'][number] & {
  effective_route_pickup_point_id: number | null;
  assigned_feemaster_ids: number[];
};

export function StudentTransportFeesPage() {
  const { data: classesData } = useClasses(1, true);
  const classes = classesData?.results || [];
  const { data: classSectionsData } = useClassSections(1, { noPaginate: true });
  const classSections = classSectionsData?.results || [];
  const { data: routePickupPoints = [] } = useRoutePickupPoints();
  const { data: routes = [] } = useTransportRoutes();
  const { data: pickupPoints = [] } = usePickupPoints();

  const [classIdStr, setClassIdStr] = useState<string>('all');
  const [sectionIdStr, setSectionIdStr] = useState<string>('all');
  const [hasSearched, setHasSearched] = useState(false);
  const [assignedMap, setAssignedMap] = useState<Record<number, number[]>>({});
  const [routeMap, setRouteMap] = useState<Record<number, number>>({});

  const classId = classIdStr === 'all' ? undefined : Number(classIdStr);
  const sectionId = sectionIdStr === 'all' ? undefined : Number(sectionIdStr);

  const {
    data: roster,
    isLoading,
    isError,
    error,
    refetch,
  } = useStudentTransportFeeRoster(classId, sectionId, hasSearched);
  const assignMutation = useAssignStudentTransportFees();

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_active === 'yes').sort((a, b) => a.sort_order - b.sort_order),
    [classes],
  );

  const classOptions = useMemo(
    () => [
      { value: 'all', label: 'All Classes' },
      ...activeClasses.map((c) => ({ value: String(c.id), label: c.class_name })),
    ],
    [activeClasses],
  );

  const sectionOptions = useMemo(() => {
    if (classIdStr === 'all') return [{ value: 'all', label: 'All Sections' }];
    const opts = sectionOptionsForClass(classSections, Number(classIdStr));
    if (Number(classIdStr) > 0 && opts.length === 0) {
      return [{ value: 'all', label: 'No Sections (Auto-Selected)' }];
    }
    return [{ value: 'all', label: 'All Sections' }, ...opts];
  }, [classSections, classIdStr]);

  const routePickupOptions = useMemo(
    () =>
      routePickupPoints.map((rpp) => {
        const route = routes.find((r) => r.id === rpp.transport_route_id);
        const pickup = pickupPoints.find((p) => p.id === rpp.pickup_point_id);
        return {
          value: String(rpp.id),
          label: `${route?.route_title || `Route ${rpp.transport_route_id}`} — ${pickup?.name || `Pickup ${rpp.pickup_point_id}`} (₹${rpp.fees ?? 0})`,
        };
      }),
    [routePickupPoints, routes, pickupPoints],
  );

  const routePickupLabel = (routePickupPointId: number | null) => {
    if (!routePickupPointId) return '—';
    const rpp = routePickupPoints.find((row) => row.id === routePickupPointId);
    if (!rpp) return `Pickup point ${routePickupPointId}`;
    const route = routes.find((r) => r.id === rpp.transport_route_id);
    const pickup = pickupPoints.find((p) => p.id === rpp.pickup_point_id);
    return `${route?.route_title || 'Route'} — ${pickup?.name || 'Pickup'}`;
  };

  const students = useMemo<StudentRow[]>(() => {
    if (!roster?.students) return [];
    return roster.students.map((student) => {
      const effectiveRouteId =
        routeMap[student.student_session_id] ?? student.route_pickup_point_id;
      const rpp = routePickupPoints.find((row) => row.id === effectiveRouteId);
      return {
        ...student,
        effective_route_pickup_point_id: effectiveRouteId,
        route_title:
          student.route_title ||
          (rpp ? routes.find((r) => r.id === rpp.transport_route_id)?.route_title || null : null),
        pickup_point:
          student.pickup_point ||
          (rpp ? pickupPoints.find((p) => p.id === rpp.pickup_point_id)?.name || null : null),
        monthly_fees: student.monthly_fees || (rpp?.fees ?? 0),
        assigned_feemaster_ids:
          assignedMap[student.student_session_id] ?? student.assigned_feemaster_ids,
      };
    });
  }, [roster, assignedMap, routeMap, routePickupPoints, routes, pickupPoints]);

  const setRoutePickup = (studentSessionId: number, routePickupPointId: number) => {
    setRouteMap((prev) => ({ ...prev, [studentSessionId]: routePickupPointId }));
  };

  const toggleFeeMaster = (studentSessionId: number, feeMasterId: number) => {
    setAssignedMap((prev) => {
      const current =
        prev[studentSessionId] ??
        roster?.students.find((s) => s.student_session_id === studentSessionId)
          ?.assigned_feemaster_ids ??
        [];
      const next = current.includes(feeMasterId)
        ? current.filter((id) => id !== feeMasterId)
        : [...current, feeMasterId];
      return { ...prev, [studentSessionId]: next };
    });
  };

  const handleSave = async () => {
    const changedIds = new Set([
      ...Object.keys(routeMap).map(Number),
      ...Object.keys(assignedMap).map(Number),
    ]);
    const toSave = students.filter((s) => changedIds.has(s.student_session_id));
    for (const student of toSave) {
      const routePickupPointId = student.effective_route_pickup_point_id;
      if (!routePickupPointId) continue;
      await assignMutation.mutateAsync({
        student_session_id: student.student_session_id,
        route_pickup_point_id: routePickupPointId,
        transport_feemaster_ids: student.assigned_feemaster_ids,
      });
    }
    setAssignedMap({});
    setRouteMap({});
  };

  const feeMasters = roster?.fee_masters ?? [];

  const columns: DataTableColumn<StudentRow>[] = [
    { id: 'admission_no', header: 'Admission No', cell: (r) => r.admission_no },
    {
      id: 'student_name',
      header: 'Student Name',
      cellClassName: 'font-medium',
      cell: (r) => r.student_name,
    },
    {
      id: 'class_section',
      header: 'Class (Section)',
      cell: (r) => `${r.class_name} (${r.section_name})`,
    },
    {
      id: 'route_pickup',
      header: 'Route / Pickup',
      cell: (r) => (
        <Select
          value={r.effective_route_pickup_point_id ? String(r.effective_route_pickup_point_id) : ''}
          onChange={(e) => setRoutePickup(r.student_session_id, Number(e.target.value))}
          options={routePickupOptions}
          placeholder="Select route & pickup"
        />
      ),
    },
    {
      id: 'route_summary',
      header: 'Current Assignment',
      cell: (r) => routePickupLabel(r.effective_route_pickup_point_id),
    },
    {
      id: 'monthly_fees',
      header: 'Monthly Fees (₹)',
      cellClassName: 'tabular-nums',
      cell: (r) => (r.monthly_fees ? `₹${r.monthly_fees}` : '—'),
    },
    {
      id: 'fee_months',
      header: 'Assigned Months',
      cell: (r) =>
        r.effective_route_pickup_point_id ? (
          <div className="flex flex-wrap gap-1">
            {feeMasters.map((fm) => {
              const checked = r.assigned_feemaster_ids.includes(fm.id);
              return (
                <label
                  key={fm.id}
                  className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFeeMaster(r.student_session_id, fm.id)}
                  />
                  {fm.month}
                </label>
              );
            })}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Select a route first</span>
        ),
    },
  ];

  const hasPendingChanges = Object.keys(assignedMap).length > 0 || Object.keys(routeMap).length > 0;

  return (
    <ModuleMarkGridPack
      title="Student Transport Fees"
      description="Assign transport routes and monthly fee masters to students."
      actions={
        hasSearched ? (
          <button
            onClick={() => void handleSave()}
            disabled={assignMutation.isPending || !hasPendingChanges}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Assignments
          </button>
        ) : (
          <button
            onClick={() => setHasSearched(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            <Search className="h-4 w-4" />
            Search Students
          </button>
        )
      }
      filters={
        <>
          <FormField label="Class" htmlFor="trans_class">
            <Select
              id="trans_class"
              options={classOptions}
              value={classIdStr}
              onChange={(e) => {
                setClassIdStr(e.target.value);
                setSectionIdStr('all');
                setHasSearched(false);
                setAssignedMap({});
                setRouteMap({});
              }}
            />
          </FormField>
          <FormField label="Section" htmlFor="trans_section">
            <Select
              id="trans_section"
              options={sectionOptions}
              value={sectionIdStr}
              onChange={(e) => {
                setSectionIdStr(e.target.value);
                setHasSearched(false);
                setAssignedMap({});
                setRouteMap({});
              }}
              disabled={classIdStr === 'all'}
            />
          </FormField>
        </>
      }
      filtersReady
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={hasSearched && students.length === 0}
      emptyTitle={hasSearched ? 'No records found' : 'Select parameters'}
      emptyDescription={
        hasSearched
          ? 'No student transport fee records exist for the selected criteria.'
          : 'Filter by class and section, then search to list students.'
      }
    >
      <DataTable data={students} columns={columns} getRowKey={(r) => r.student_session_id} />
    </ModuleMarkGridPack>
  );
}
