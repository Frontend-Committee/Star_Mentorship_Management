/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from '@/components/ui/sonner';
import api from '@/lib/api';
import { 
  Feedback, 
  FeedbackCreatePayload, 
  Submission, 
  SubmissionCreatePayload, 
  Task, 
  TaskCreatePayload, 
  TaskUpdatePayload 
} from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --- Admin Task Hooks ---

export const useAdminTasks = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-tasks'],
    queryFn: async () => {
      const response = await api.get<any>('/admin/tasks/');
      // Handle DRF pagination
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results as Task[];
      }
      if (Array.isArray(response.data)) {
        return response.data as Task[];
      }
      return [] as Task[];
    },
    enabled: options?.enabled,
  });
};

export const useAdminTask = (id: number) => {
  return useQuery({
    queryKey: ['admin-tasks', id],
    queryFn: async () => {
      const response = await api.get<Task>(`/admin/tasks/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TaskCreatePayload) => {
      const response = await api.post<Task>('/admin/tasks/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    },
      onError: (error: any) => {
          // console.log({  });

          const errorMessage = error.response?.data
            ? Object.entries(error.response.data).map(([key, value]) => `${key}: ${value}`).join(', ')
            : "Failed to create task. Please try again.";
          toast({ title: "Error", description: errorMessage, variant: "destructive" });
          consol
        }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TaskUpdatePayload }) => {
      const response = await api.patch<Task>(`/admin/tasks/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/tasks/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    },
  });
};

// --- Admin Submission & Feedback Hooks ---

export const useAdminSubmissions = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-submissions'],
    queryFn: async () => {
      const response = await api.get<any>('/admin/task/submissions/');
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results as Submission[];
      }
      if (Array.isArray(response.data)) {
        return response.data as Submission[];
      }
      return [] as Submission[];
    },
    enabled: options?.enabled,
  });
};

export const useAdminTaskSubmissions = (taskId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-submissions', taskId],
    queryFn: async () => {
      // Assuming we filter by task ID on client or if there's a specific endpoint. 
      // The spec says: GET /api/admin/tasks/{id}/ -> task + all submissions
      // OR GET /api/admin/task/submissions/ -> view all members
      // We'll stick to fetching all or relying on the task detail endpoint which returns everything.
      // But let's check if we can get submissions for a specific task via query param if needed.
      // For now, let's assume the Task Detail endpoint covers this or we filter the full list.
      // Actually, spec says: GET /api/admin/tasks/{id}/ -> task + all submissions
      // So useAdminTask might already return submissions if the backend includes them.
      // But let's keep this if we need to hit the submissions list endpoint.
      const response = await api.get<any>(`/admin/task/submissions/?task=${taskId}`); // Speculative query param
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results as Submission[];
      }
      if (Array.isArray(response.data)) {
        return response.data as Submission[];
      }
      return [] as Submission[];
    },
    enabled: !!taskId && options?.enabled,
  });
};

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FeedbackCreatePayload) => {
      const response = await api.post<Feedback>('/admin/task/feedback/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] }); // In case task detail updates
    },
  });
};

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FeedbackCreatePayload> }) => {
      const response = await api.patch<Feedback>(`/admin/task/feedback/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    },
  });
};

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/task/feedback/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    },
  });
};

// --- Member Hooks ---

export const useMemberTasks = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['member-tasks'],
    queryFn: async () => {
      const response = await api.get<any>('/member/tasks/');
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results as Task[];
      }
      if (Array.isArray(response.data)) {
        return response.data as Task[];
      }
      return [] as Task[];
    },
    enabled: options?.enabled,
  });
};

export const useMemberTask = (id: number) => {
  return useQuery({
    queryKey: ['member-tasks', id],
    queryFn: async () => {
      const response = await api.get<Task>(`/member/tasks/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useMemberSubmissions = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['member-submissions'],
    queryFn: async () => {
      const response = await api.get<any>('/member/task/submissions/');
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results as Submission[];
      }
      if (Array.isArray(response.data)) {
        return response.data as Submission[];
      }
      return [] as Submission[];
    },
    enabled: options?.enabled,
  });
};

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SubmissionCreatePayload) => {
      const response = await api.post<Submission>('/member/task/submissions/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['member-tasks'] });
    },
  });
};

export const useUpdateSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SubmissionCreatePayload> }) => {
      const response = await api.patch<Submission>(`/member/task/submissions/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['member-tasks'] });
    },
  });
};
