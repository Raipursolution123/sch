import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@constants/query-keys';
import { downloadCenterService } from '@services/api/download-center.service';
import type {
  CreateContentTypePayload,
  CreateUploadContentPayload,
  CreateVideoTutorialPayload,
  UpdateContentTypePayload,
  UpdateVideoTutorialPayload,
} from '@app-types/download-center';
import { getApiErrorMessage } from '@utils/session';

export function useContentTypes(query = '') {
  return useQuery({
    queryKey: queryKeys.downloadCenter.contentTypes.list(query),
    queryFn: () => downloadCenterService.listContentTypes(query || undefined),
  });
}

export function useCreateContentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateContentTypePayload) =>
      downloadCenterService.createContentType(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.downloadCenter.all });
      toast.success('Content type created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create content type')),
  });
}

export function useUpdateContentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateContentTypePayload }) =>
      downloadCenterService.updateContentType(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.downloadCenter.all });
      toast.success('Content type updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update content type')),
  });
}

export function useDeleteContentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => downloadCenterService.deleteContentType(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.downloadCenter.all });
      toast.success('Content type deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete content type')),
  });
}

export function useUploadContents(query = '') {
  return useQuery({
    queryKey: queryKeys.downloadCenter.content.list(query),
    queryFn: () => downloadCenterService.listContent(query || undefined),
  });
}

export function useCreateUploadContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUploadContentPayload) =>
      downloadCenterService.createContent(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.downloadCenter.all });
      toast.success('Content added');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to add content')),
  });
}

export function useDeleteUploadContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => downloadCenterService.deleteContent(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.downloadCenter.all });
      toast.success('Content deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete content')),
  });
}

export function useVideoTutorials(query = '') {
  return useQuery({
    queryKey: queryKeys.downloadCenter.videos.list(query),
    queryFn: () => downloadCenterService.listVideos(query || undefined),
  });
}

export function useCreateVideoTutorial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVideoTutorialPayload) => downloadCenterService.createVideo(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.downloadCenter.all });
      toast.success('Video tutorial created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create video tutorial')),
  });
}

export function useUpdateVideoTutorial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateVideoTutorialPayload }) =>
      downloadCenterService.updateVideo(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.downloadCenter.all });
      toast.success('Video tutorial updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update video tutorial')),
  });
}

export function useDeleteVideoTutorial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => downloadCenterService.deleteVideo(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.downloadCenter.all });
      toast.success('Video tutorial deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete video tutorial')),
  });
}
