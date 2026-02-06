import { toast } from '@/components/ui/sonner';
import api from '@/lib/api';
import {
  Feedback,
  FeedbackCreatePayload,
  Task,
  TaskCreatePayload,
  TaskDetail,
  TaskSubmissionDetail,
  TaskUpdatePayload
} from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAdminTasks = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-tasks'],
    queryFn: async () => {
      const response = await api.get('/admin/tasks/');
      const data = response.data as unknown;
      if (
        data &&
        typeof data === 'object' &&
        'results' in data &&
        Array.isArray((data as { results: unknown }).results)
      ) {
        return (data as { results: Task[] }).results;
      }
      if (Array.isArray(data)) {
        return data as Task[];
      }
      return [] as Task[];
    },
    enabled: options?.enabled,
  });
};

export const useAdminTask = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-tasks', id],
    queryFn: async () => {
      const response = await api.get<TaskDetail>(`/admin/tasks/${id}/`);
      return response.data;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};

// ... (other hooks remain unchanged)



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
    onError: (error: unknown) => {
      const errorData =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: unknown } }).response?.data
          : undefined;
      let errorMessage = "Failed to create task. Please try again.";
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData && typeof errorData === 'object') {
        errorMessage = Object.entries(errorData as Record<string, unknown>)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join(', ');
      }
      toast(errorMessage);
    }
  });
};

export const usePartialUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TaskUpdatePayload }) => {
      const response = await api.patch<TaskDetail>(`/admin/tasks/${id}/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tasks', data.id] });
    },
  });
};

export const useFullUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TaskCreatePayload }) => {
      const response = await api.put<TaskDetail>(`/admin/tasks/${id}/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tasks', data.id] });
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
      const response = await api.get('/admin/submissions/');
      const data = response.data as unknown;
      if (
        data &&
        typeof data === 'object' &&
        'results' in data &&
        Array.isArray((data as { results: unknown }).results)
      ) {
        return (data as { results: TaskSubmissionDetail[] }).results;
      }
      if (Array.isArray(data)) {
        return data as TaskSubmissionDetail[];
      }
      return [] as TaskSubmissionDetail[];
    },
    enabled: options?.enabled,
  });
};

export const useAdminTaskSubmissions = (taskId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-task-submissions', taskId],
    queryFn: async () => {
      const response = await api.get<TaskDetail>(`/admin/tasks/${taskId}/`);
      return response.data.submissions || [];
    },
    enabled: !!taskId && options?.enabled,
  });
};

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FeedbackCreatePayload) => {
      const response = await api.post<Feedback>('/admin/feedback/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    },
  });
};

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FeedbackCreatePayload> }) => {
      const response = await api.patch<Feedback>(`/admin/feedback/${id}/`, data);
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
      await api.delete(`/admin/feedback/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    },
  });
};

export const useMemberTasks = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['member-tasks'],
    queryFn: async () => {
      const response = await api.get('/member/tasks/');
      const data = response.data as unknown;
      console.log('DEBUG: useMemberTasks raw response:', data);
      if (
        data &&
        typeof data === 'object' &&
        'results' in data &&
        Array.isArray((data as { results: unknown }).results)
      ) {
        return (data as { results: Task[] }).results;
      }
      if (Array.isArray(data)) {
        return data as Task[];
      }
      return [] as Task[];
    },
    enabled: options?.enabled,
  });
};

export const useMemberTask = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['member-tasks', id],
    queryFn: async () => {
      const response = await api.get<Task>(`/member/tasks/${id}/`);
      return response.data;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};
