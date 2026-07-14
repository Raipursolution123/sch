import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { PermissionButton } from '@components/rbac/PermissionButton';
import { StaffOverviewTab } from '@features/staff/components/StaffOverviewTab';
import { StaffEmploymentTab } from '@features/staff/components/StaffEmploymentTab';
import { StaffPayrollTab } from '@features/staff/components/StaffPayrollTab';
import { StaffLeaveTab } from '@features/staff/components/StaffLeaveTab';
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
import { ModuleProfilePack } from '@workflow-packs';

const PROFILE_TABS = [
  { id: 'overview', label: 'Overview', enabled: true },
  { id: 'employment', label: 'Employment', enabled: true },
  { id: 'payroll', label: 'Payroll', enabled: true },
  { id: 'leave', label: 'Leave', enabled: true },
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const id = Number(staffId);
  const { data: staff, isLoading, isError, error, refetch } = useStaffMember(id);
  const { data: departments = [] } = useStaffDepartments();
  const { data: designations = [] } = useStaffDesignations();
  const updateMutation = useUpdateStaff(id);
  const deleteMutation = useDeleteStaff();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab');
  const currentTab = isProfileTab(activeTab) ? activeTab : 'overview';

  const tabToSection: Record<string, StaffFormSection> = {
    overview: 'all',
    employment: 'employment',
    payroll: 'payroll',
    leave: 'all',
    documents: 'all',
  };
  const editSection = tabToSection[currentTab] ?? 'all';

  const handleEditSubmit = (values: StaffFormValues) => {
    updateMutation.mutate(toStaffPayload(values), {
      onSuccess: () => setEditOpen(false),
    });
  };

  const handleDeleteSubmit = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
        navigate(ROUTES.staff.root);
      },
    });
  };

  return (
    <ModuleProfilePack
      backTo={ROUTES.staff.root}
      backLabel="Back to Staff"
      isLoading={isLoading}
      loadingMessage="Loading staff profile..."
      isError={isError || !staff}
      errorTitle="Staff member not found"
      error={error}
      onRetry={() => void refetch()}
      headerActions={
        staff ? (
          <div className="flex gap-2">
            {currentTab !== 'documents' && currentTab !== 'leave' && (
              <PermissionButton
                permission="staff.edit"
                variant="outline"
                className="gap-1"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit
              </PermissionButton>
            )}

            <PermissionButton
              permission="staff.delete"
              variant="destructive"
              className="gap-1"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </PermissionButton>
          </div>
        ) : undefined
      }
      tabs={
        staff
          ? PROFILE_TABS.map((tab) => ({
              id: tab.id,
              label: tab.label,
              disabled: !tab.enabled,
              content:
                tab.id === 'overview' ? (
                  <StaffOverviewTab staff={staff} />
                ) : tab.id === 'employment' ? (
                  <StaffEmploymentTab staff={staff} />
                ) : tab.id === 'payroll' ? (
                  <StaffPayrollTab staff={staff} />
                ) : tab.id === 'leave' ? (
                  <StaffLeaveTab staffId={staff.id} />
                ) : (
                  <StaffDocumentsTab staff={staff} />
                ),
            }))
          : []
      }
      activeTab={currentTab}
      onTabChange={(value) => {
        setSearchParams(value === 'overview' ? {} : { tab: value }, { replace: true });
      }}
      footer={
        staff ? (
          <>
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

            <ConfirmDialog
              open={deleteConfirmOpen}
              onOpenChange={setDeleteConfirmOpen}
              title="Delete Staff Member"
              description="Are you sure you want to delete this staff member? This action cannot be undone."
              confirmLabel="Delete"
              destructive
              isLoading={deleteMutation.isPending}
              onConfirm={handleDeleteSubmit}
            />
          </>
        ) : undefined
      }
    />
  );
}
