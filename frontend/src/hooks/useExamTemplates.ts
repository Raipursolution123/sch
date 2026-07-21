import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { examTemplatesService } from '@services/api';
import { QUERY_KEYS } from '@constants/query-keys';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@utils/error-message';

export interface MarksheetTemplate {
  id: number;
  template?: string;
  heading?: string;
  title?: string;
  left_logo?: string;
  right_logo?: string;
  exam_name?: string;
  school_name?: string;
  exam_center?: string;
  left_sign?: string;
  middle_sign?: string;
  right_sign?: string;
  exam_session?: number;
  is_name?: number;
  is_father_name?: number;
  is_mother_name?: number;
  is_dob?: number;
  is_admission_no?: number;
  is_roll_no?: number;
  is_photo?: number;
  is_division?: number;
  is_rank?: number;
  is_customfield?: number;
  background_img?: string;
  date?: string;
  is_class?: number;
  is_teacher_remark?: number;
  is_section?: number;
  content?: string;
  content_footer?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdmitCardTemplate {
  id: number;
  template?: string;
  heading?: string;
  title?: string;
  left_logo?: string;
  right_logo?: string;
  exam_name?: string;
  school_name?: string;
  exam_center?: string;
  sign?: string;
  background_img?: string;
  is_letter_head?: number;
  is_name?: number;
  is_father_name?: number;
  is_mother_name?: number;
  is_dob?: number;
  is_admission_no?: number;
  is_roll_no?: number;
  is_address?: number;
  is_gender?: number;
  is_photo?: number;
  is_class?: number;
  is_section?: number;
  content_footer?: string;
  created_at?: string;
  updated_at?: string;
}

export function useMarksheetTemplates() {
  return useQuery({
    queryKey: ['marksheet-templates'],
    queryFn: () => examTemplatesService.listMarksheets(),
  });
}

export function useDeleteMarksheetTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examTemplatesService.deleteMarksheet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marksheet-templates'] });
      toast.success('Marksheet template deleted successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete template')),
  });
}

export function useAdmitCardTemplates() {
  return useQuery({
    queryKey: ['admitcard-templates'],
    queryFn: () => examTemplatesService.listAdmitCards(),
  });
}

export function useDeleteAdmitCardTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examTemplatesService.deleteAdmitCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admitcard-templates'] });
      toast.success('Admit card template deleted successfully');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete template')),
  });
}
