import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { topicService } from '@services/api';
import type { TopicCreatePayload, TopicUpdatePayload } from '@app-types/academics/topic';
import { getApiErrorMessage } from '@utils/session';

export const TOPIC_KEYS = {
  all: ['topics'] as const,
  lists: () => [...TOPIC_KEYS.all, 'list'] as const,
  details: () => [...TOPIC_KEYS.all, 'detail'] as const,
};

export const useTopicList = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: [...TOPIC_KEYS.lists(), params],
    queryFn: () => topicService.getTopicList(params),
  });
};

export const useCreateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TopicCreatePayload) => topicService.createTopic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOPIC_KEYS.lists() });
      toast.success('Topic created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create topic')),
  });
};

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TopicUpdatePayload }) =>
      topicService.updateTopic(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOPIC_KEYS.lists() });
      toast.success('Topic updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update topic')),
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => topicService.deleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOPIC_KEYS.lists() });
      toast.success('Topic deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete topic')),
  });
};
