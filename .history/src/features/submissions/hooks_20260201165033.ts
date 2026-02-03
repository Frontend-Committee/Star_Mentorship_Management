import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Feedback, MemberSubmission, MemberSubmissionUpdatePayload, SubmissionCreatePayload } from '../../types';

export const useSubmissions = () => {
  return useQuery({
    queryKey: ['member-submissions'],
    queryFn: async () => {
      const response = await api.get('/member/submissions/');
      const data = response.data as unknown;
      if (
        data &&
        typeof data === 'object' &&
        'results' in data &&
        Array.isArray((data as { results: unknown }).results)
      ) {
        return (data as { results: MemberSubmission[] }).results;
      }
      if (Array.isArray(data)) {
        return data as MemberSubmission[];
      }
      return [] as MemberSubmission[];
    },
  });
};

export const useSubmission = (id: number) => {
  return useQuery({
    queryKey: ['member-submissions', id],
    queryFn: async () => {
      const response = await api.get<MemberSubmission>(`/member/submissions/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useSubmissionByTaskId = (taskId: number) => {
  return useQuery({
    queryKey: ['submissionByTask', taskId],
    queryFn: async () => {
      const response = await api.get('/member/submissions/');
      let results: MemberSubmission[] = [];
      const data = response.data as unknown;
      if (
        data &&
        typeof data === 'object' &&
        'results' in data &&
        Array.isArray((data as { results: unknown }).results)
      ) {
        results = (data as { results: MemberSubmission[] }).results;
      } else if (Array.isArray(data)) {
        results = data as MemberSubmission[];
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
      const response = await api.post<MemberSubmission>('/member/submissions/', data);
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
    mutationFn: async ({ id, data }: { id: number; data: MemberSubmissionUpdatePayload }) => {
      const response = await api.patch<MemberSubmission>(`/member/submissions/${id}/`, data);
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

export const useMemberFeedbacks = () => {
  return useQuery({
    queryKey: ['member-feedbacks'],
    queryFn: async () => {
      const response = await api.get('/member/feedback/');
      const data = response.data as unknown;
      if (
        data &&
        typeof data === 'object' &&
        'results' in data &&
        Array.isArray((data as { results: unknown }).results)
      ) {
        return (data as { results: Feedback[] }).results;
      }
      if (Array.isArray(data)) {
        return data as Feedback[];
      }
      return [] as Feedback[];
    },
  });
};

export const useMemberFeedback = (id: number) => {
  return useQuery({
    queryKey: ['member-feedbacks', id],
    queryFn: async () => {
      const response = await api.get<Feedback>(`/member/feedback/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};
