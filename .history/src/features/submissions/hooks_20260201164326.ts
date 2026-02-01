import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Feedback, MemberSubmission, MemberSubmissionCreatePayload, MemberSubmissionUpdatePayload } from '../../types';

// --- Member Submission Hooks ---

export const useSubmissions = () => {
  return useQuery({
    queryKey: ['member-submissions'],
    queryFn: async () => {
      // Spec: GET /api/member/submissions/
      const response = await api.get<any>('/member/submissions/');
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results as MemberSubmission[];
      }
      if (Array.isArray(response.data)) {
        return response.data as MemberSubmission[];
      }
      return [] as MemberSubmission[];
    },
  });
};

export const useSubmission = (id: number) => {
  return useQuery({
    queryKey: ['member-submissions', id],
    queryFn: async () => {
      // Spec: GET /api/member/submissions/{id}/
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
      // Since there is no direct endpoint for "submission by task ID" for members,
      // we fetch all and find it, or assume the list is small enough.
      // Ideally backend supports ?task=ID.
      // Let's try fetching the list and filtering.
      const response = await api.get<any>('/member/submissions/');
      let results: MemberSubmission[] = [];
      if (response.data && Array.isArray(response.data.results)) {
        results = response.data.results;
      } else if (Array.isArray(response.data)) {
        results = response.data;
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
    mutationFn: async (data: MemberSubmissionCreatePayload) => {
      // Spec: POST /api/member/submissions/
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
      // Spec: PATCH /api/member/submissions/{id}/
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

// --- Member Feedback Hooks ---

export const useMemberFeedbacks = () => {
  return useQuery({
    queryKey: ['member-feedbacks'],
    queryFn: async () => {
      // Spec: GET /api/member/feedback/
      const response = await api.get<any>('/member/feedback/');
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results as Feedback[];
      }
      if (Array.isArray(response.data)) {
        return response.data as Feedback[];
      }
      return [] as Feedback[];
    },
  });
};

export const useMemberFeedback = (id: number) => {
  return useQuery({
    queryKey: ['member-feedbacks', id],
    queryFn: async () => {
      // Spec: GET /api/member/feedback/{id}/
      const response = await api.get<Feedback>(`/member/feedback/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};
