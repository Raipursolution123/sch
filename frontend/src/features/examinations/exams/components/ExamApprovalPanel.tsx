import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { Exam } from '@app-types/examinations/exam';
import { DashboardCard } from '@components/dashboard/DashboardCard';
import { ApprovalActionBar, ApprovalTimeline, StatusPipeline } from '@components/workflows';
import { ConfirmDestructiveDialog } from '@components/overlays/ConfirmDestructiveDialog';
import { ROUTES } from '@constants/index';
import { useUpdateExam } from '@hooks/useExams';
import { useWorkflowRecord, useWorkflowTransition } from '@hooks/useWorkflow';
import { useAuthStore } from '@store/index';

interface ExamApprovalPanelProps {
  exam: Exam;
}

export function ExamApprovalPanel({ exam }: ExamApprovalPanelProps) {
  const user = useAuthStore((s) => s.user);
  const { data: workflow } = useWorkflowRecord('exam', exam.id);
  const transition = useWorkflowTransition('exam', exam.id);
  const updateExam = useUpdateExam();
  const [rejectOpen, setRejectOpen] = useState(false);

  if (exam.is_published) return null;

  const status = workflow?.status ?? 'draft';
  const actor = {
    name: user?.username ?? 'User',
    role: user?.role,
  };

  const handleSubmit = () => {
    transition.mutate(
      { status: 'submitted', actor },
      { onSuccess: () => toast.success('Exam submitted for approval') },
    );
  };

  const handleApprove = () => {
    updateExam.mutate(
      {
        id: exam.id,
        payload: {
          name: exam.name,
          exam_group_id: exam.exam_group_id,
          session_id: exam.session_id,
          date_from: exam.date_from,
          date_to: exam.date_to,
          passing_percentage: exam.passing_percentage,
          is_published: true,
          description: exam.description,
          is_active: exam.is_active,
        },
      },
      {
        onSuccess: () => {
          transition.mutate({ status: 'approved', actor });
          toast.success('Exam approved and published');
        },
      },
    );
  };

  const handleReject = (reason?: string) => {
    transition.mutate(
      { status: 'rejected', actor, note: reason },
      {
        onSuccess: () => {
          setRejectOpen(false);
          toast.success('Exam publication rejected');
        },
      },
    );
  };

  return (
    <DashboardCard title="Publication approval" description={exam.name}>
      <div className="space-y-4">
        <StatusPipeline status={status} />
        <ApprovalTimeline events={workflow?.events ?? []} />
        <ApprovalActionBar
          onSubmit={status === 'draft' || status === 'rejected' ? handleSubmit : undefined}
          onApprove={status === 'submitted' ? handleApprove : undefined}
          onReject={status === 'submitted' ? () => setRejectOpen(true) : undefined}
          isLoading={transition.isPending || updateExam.isPending}
        />
        <p className="text-xs text-muted-foreground">
          Teachers submit exams for review. Principals approve before schedules go live.{' '}
          <Link to={ROUTES.examinations.exams} className="text-ink underline-offset-2 hover:underline">
            View all exams
          </Link>
        </p>
      </div>

      <ConfirmDestructiveDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject exam publication?"
        description={`Reject publication for "${exam.name}". The submitter will see your reason.`}
        confirmLabel="Reject"
        requireReason
        reasonLabel="Rejection reason"
        onConfirm={handleReject}
        isLoading={transition.isPending}
      />
    </DashboardCard>
  );
}
