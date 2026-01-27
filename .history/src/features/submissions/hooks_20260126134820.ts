import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Submission, SubmissionCreatePayload } from '../../types';

export const useSubmissions = () => {
  return useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const response = await api.get<Submission[]>('submission/');
      return response.data;
    },
  });
};

export const useSubmissionByTaskId = (taskId: number) => {
  return useQuery({
    queryKey: ['submissionByTask', taskId],
    queryFn: async () => {
      // Endpoint is /submission/{pk}/ where pk is TASK ID per user instructions
      const response = await api.get<Submission>(`submission/${taskId}/`);
      return response.data;
    },
    enabled: !!taskId,
    retry: false, // Don't retry if 404 (no submission yet)
  });
};

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubmissionCreatePayload) => {
      const response = await api.post<Submission>('submission/', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['submissionByTask', data.task] });
    },
  });
};

export const useUpdateSubmission = (submissionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<SubmissionCreatePayload>) => {
      // Endpoint is /submission/{pk}/ where pk is SUBMISSION ID for update/delete
      const response = await api.patch<Submission>(`submission/${submissionId}/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      // We might need to know the taskId to invalidate submissionByTask, 
      // but if we don't have it, we rely on the fact that this specific submission is updated.
      // Ideally the component calling this knows the taskId and invalidates it, 
      // or we return the updated submission which has the taskId.
      if (data.task) {
        queryClient.invalidateQueries({ queryKey: ['submissionByTask', data.task] });
      }
    },
  });
};

export const useDeleteSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: number) => {
      await api.delete(`submission/${submissionId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      // Hard to invalidate specific task submission without knowing the task ID.
      // Maybe we can invalidate all 'submissionByTask' queries?
      queryClient.invalidateQueries({ queryKey: ['submissionByTask'] });
    },
  });
};
