import { useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { LoadingState } from '@components/feedback/LoadingState';
import { ErrorState } from '@components/feedback/ErrorState';
import { StaffOverviewTab } from '@features/staff/components/StaffOverviewTab';
import { StaffEmploymentTab } from '@features/staff/components/StaffEmploymentTab';
import { StaffPayrollTab } from '@features/staff/components/StaffPayrollTab';
import { StaffDocumentsTab } from '@features/staff/components/StaffDocumentsTab';
import { StaffFormDialog, type StaffFormSection } from '@features/staff/components/StaffFormDialog';
import type { StaffFormValues } from '@features/staff/schemas/staff-form.schema';
import { toStaffPayload } from '@features/staff/utils/staff-payload';
import {
  useStaffDepartments,
  useStaffDesignations,
  useStaffMember,
  useUpdateStaff,
  useDeleteStaff,
} from '@hooks/useStaff';
import { ROUTES } from '@constants/index';

const PROFILE_TABS = [
  { id: 'overview', label: 'Overview', enabled: true },
  { id: 'employment', label: 'Employment', enabled: true },
  { id: 'payroll', label: 'Payroll', enabled: true },
  { id: 'documents', label: 'Documents', enabled: true },
] as const;

type ProfileTabId = (typeof PROFILE_TABS)[number]['id'];

function isProfileTab(value: string | null): value is ProfileTabId {
  return PROFILE_TABS.some((tab) => tab.id === value);
}

export function StaffProfilePage() {
  const { staffId } = useParams<{ staffId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editOpen, setEditOpen] = useState(false);
  const id = Number(staffId);
  const { data: staff, isLoading, isError, error, refetch } = useStaffMember(id);
  const { data: departments = [] } = useStaffDepartments();
  const { data: designations = [] } = useStaffDesignations();
  const updateMutation = useUpdateStaff(id);
  const deleteMutation = useDeleteStaff();
  const navigate = useNavigate();

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => navigate(ROUTES.staff.root),
    });
  };

  const activeTab = searchParams.get('tab');
  const currentTab = isProfileTab(activeTab) ? activeTab : 'overview';

  const tabToSection: Record<string, StaffFormSection> = {
    overview: 'all',
    employment: 'employment',
    payroll: 'payroll',
    documents: 'all',
  };
  const editSection = tabToSection[currentTab] ?? 'all';

  const handleEditSubmit = (values: StaffFormValues) => {
    updateMutation.mutate(toStaffPayload(values), {
      onSuccess: () => setEditOpen(false),
    });
  };

  if (isLoading) {
    return <LoadingState message="Loading staff profile..." />;
  }

  if (isError || !staff) {
    return (
      <ErrorState
        title="Staff member not found"
        message={error instanceof Error ? error.message : 'Could not load staff profile'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={ROUTES.staff.root}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Staff
        </Link>
        <div className="flex gap-2">
          {currentTab !== 'documents' && (
            <Button variant="outline" className="gap-1" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-1">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this staff member? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(value) => {
          setSearchParams(value === 'overview' ? {} : { tab: value }, { replace: true });
        }}
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          {PROFILE_TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} disabled={!tab.enabled}>
              {tab.label}
              {!tab.enabled && <span className="sr-only"> (coming soon)</span>}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <StaffOverviewTab staff={staff} />
        </TabsContent>

        <TabsContent value="employment" className="mt-6">
          <StaffEmploymentTab staff={staff} />
        </TabsContent>

        <TabsContent value="payroll" className="mt-6">
          <StaffPayrollTab staff={staff} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <StaffDocumentsTab staff={staff} />
        </TabsContent>
      </Tabs>

      <StaffFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        departments={departments}
        designations={designations}
        staff={staff}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
        section={editSection}
      />
    </div>
  );
}
