import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { topicService } from '@/services/api/topic.service';
import type { TopicCreatePayload, TopicUpdatePayload } from '@/types/academics/topic';

export const TOPIC_KEYS = {
  all: ['topics'] as const,
  lists: () => [...TOPIC_KEYS.all, 'list'] as const,
  details: () => [...TOPIC_KEYS.all, 'detail'] as const,
};

export const useTopicList = (params?: Record<string, any>) => {
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
    },
  });
};

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TopicUpdatePayload }) =>
      topicService.updateTopic(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOPIC_KEYS.lists() });
    },
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => topicService.deleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOPIC_KEYS.lists() });
    },
  });
};
