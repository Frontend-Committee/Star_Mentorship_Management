import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Feedback, MemberSubmission, MemberSubmissionUpdatePayload, SubmissionCreatePayload, PaginatedResponse } from '../../types';

export const useSubmissions = (params?: { page?: number } | { enabled?: boolean }, options?: { enabled?: boolean }) => {
  const actualParams = params && 'page' in params ? params : undefined;
  const actualOptions = options || (params && 'enabled' in params ? (params as { enabled?: boolean }) : undefined);

  return useQuery({
    queryKey: ['member-submissions', actualParams],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<MemberSubmission> | MemberSubmission[]>('member/submissions/', { params: actualParams });
      const data = response.data;
      
      // Handle DRF pagination
      if (data && typeof data === 'object' && 'results' in data) {
        return (data as PaginatedResponse<MemberSubmission>).results || [];
      }
      
      if (Array.isArray(data)) {
        return data as MemberSubmission[];
      }
      return [] as MemberSubmission[];
    },
    enabled: actualOptions?.enabled ?? true,
  });
};

export const useSubmission = (id: number) => {
  return useQuery({
    queryKey: ['member-submissions', id],
    queryFn: async () => {
      const response = await api.get<MemberSubmission>(`member/submissions/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useSubmissionByTaskId = (taskId: number) => {
  return useQuery({
    queryKey: ['submissionByTask', taskId],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<MemberSubmission> | MemberSubmission[]>('member/submissions/');
      let results: MemberSubmission[] = [];
      const data = response.data;
      
      if (data && typeof data === 'object' && 'results' in data) {
        results = (data as PaginatedResponse<MemberSubmission>).results || [];
      } else if (Array.isArray(data)) {
        results = data;
      }

      const submission = results.find(s => s.task.id === taskId);
      if (!submission) {
        throw new Error('Submission not found');
      }
      return submission;
    },
    enabled: !!taskId,
    retry: false,
  });
};

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SubmissionCreatePayload) => {
      const response = await api.post<MemberSubmission>('member/submissions/', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['member-submissions'] });
      if (data.task && typeof data.task === 'object') {
        queryClient.invalidateQueries({ queryKey: ['submissionByTask', data.task.id] });
      }
    },
  });
};

export const useUpdateSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data, usePut = false }: { id: number; data: MemberSubmissionUpdatePayload; usePut?: boolean }) => {
      const method = usePut ? 'put' : 'patch';
      const response = await api[method]<MemberSubmission>(`member/submissions/${id}/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['member-submissions'] });
      if (data.task && typeof data.task === 'object') {
        queryClient.invalidateQueries({ queryKey: ['submissionByTask', data.task.id] });
      }
    },
  });
};

export const useMemberFeedbacks = (params?: { page?: number } | { enabled?: boolean }, options?: { enabled?: boolean }) => {
  const actualParams = params && 'page' in params ? params : undefined;
  const actualOptions = options || (params && 'enabled' in params ? (params as { enabled?: boolean }) : undefined);

  return useQuery({
    queryKey: ['member-feedbacks', actualParams],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Feedback> | Feedback[]>('member/feedback/', { params: actualParams });
      const data = response.data;
      
      if (data && typeof data === 'object' && 'results' in data) {
        return (data as PaginatedResponse<Feedback>).results || [];
      }
      
      if (Array.isArray(data)) {
        return data as Feedback[];
      }
      return [] as Feedback[];
    },
    enabled: actualOptions?.enabled ?? true,
  });
};

export const useMemberFeedback = (id: number) => {
  return useQuery({
    queryKey: ['member-feedbacks', id],
    queryFn: async () => {
      const response = await api.get<Feedback>(`member/feedback/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};
