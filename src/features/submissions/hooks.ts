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

export const useUpdateSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SubmissionCreatePayload> }) => {
      const response = await api.patch<Submission>(`submission/${id}/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      if (data.task) {
        queryClient.invalidateQueries({ queryKey: ['submissionByTask', data.task] });
      }
    },
  });
};

export const useDeleteSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`submission/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['submissionByTask'] });
    },
  });
};
