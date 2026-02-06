import { toast } from '@/components/ui/sonner';
import api from '@/lib/api';
import {
  Feedback,
  FeedbackCreatePayload,
  Task,
  TaskCreatePayload,
  TaskDetail,
  TaskSubmissionDetail,
  TaskUpdatePayload,
  PaginatedResponse
} from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAdminTasks = (params?: { page?: number } | { enabled?: boolean }, options?: { enabled?: boolean }) => {
  const actualParams = params && 'page' in params ? params : undefined;
  const actualOptions = options || (params && 'enabled' in params ? (params as { enabled?: boolean }) : undefined);

  return useQuery({
    queryKey: ['admin-tasks', actualParams],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Task> | Task[]>('admin/tasks/', { params: actualParams });
      const data = response.data;
      if (data && typeof data === 'object' && 'results' in data) {
        return (data as PaginatedResponse<Task>).results || [];
      }
      if (Array.isArray(data)) {
        return data as Task[];
      }
      return [] as Task[];
    },
    enabled: actualOptions?.enabled ?? true,
  });
};

export const useAdminTask = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-tasks', id],
    queryFn: async () => {
      const response = await api.get<TaskDetail>(`admin/tasks/${id}/`);
      return response.data;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TaskCreatePayload) => {
      const response = await api.post<Task>('admin/tasks/', data);
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
      const response = await api.patch<TaskDetail>(`admin/tasks/${id}/`, data);
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
      const response = await api.put<TaskDetail>(`admin/tasks/${id}/`, data);
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
      await api.delete(`admin/tasks/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    },
  });
};

// --- Admin Submission & Feedback Hooks ---

export const useAdminSubmissions = (params?: { page?: number } | { enabled?: boolean }, options?: { enabled?: boolean }) => {
  const actualParams = params && 'page' in params ? params : undefined;
  const actualOptions = options || (params && 'enabled' in params ? (params as { enabled?: boolean }) : undefined);

  return useQuery({
    queryKey: ['admin-submissions', actualParams],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<TaskSubmissionDetail> | TaskSubmissionDetail[]>('admin/submissions/', { params: actualParams });
      const data = response.data;
      if (data && typeof data === 'object' && 'results' in data) {
        return (data as PaginatedResponse<TaskSubmissionDetail>).results || [];
      }
      if (Array.isArray(data)) {
        return data as TaskSubmissionDetail[];
      }
      return [] as TaskSubmissionDetail[];
    },
    enabled: actualOptions?.enabled ?? true,
  });
};

export const useAdminSubmission = (id: number) => {
  return useQuery({
    queryKey: ['admin-submissions', id],
    queryFn: async () => {
      const response = await api.get<TaskSubmissionDetail>(`admin/submissions/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useAdminTaskSubmissions = (taskId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-task-submissions', taskId],
    queryFn: async () => {
      const response = await api.get<TaskDetail>(`admin/tasks/${taskId}/`);
      return response.data.submissions || [];
    },
    enabled: !!taskId && options?.enabled,
  });
};

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FeedbackCreatePayload) => {
      const response = await api.post<Feedback>('admin/feedback/', data);
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
      const response = await api.patch<Feedback>(`admin/feedback/${id}/`, data);
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
      await api.delete(`admin/feedback/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    },
  });
};

export const useAdminFeedbackDetails = (id: number) => {
  return useQuery({
    queryKey: ['admin-feedback', id],
    queryFn: async () => {
      const response = await api.get<Feedback>(`admin/feedback/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useMemberTasks = (params?: { page?: number } | { enabled?: boolean }, options?: { enabled?: boolean }) => {
  const actualParams = params && 'page' in params ? params : undefined;
  const actualOptions = options || (params && 'enabled' in params ? (params as { enabled?: boolean }) : undefined);

  return useQuery({
    queryKey: ['member-tasks', actualParams],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Task> | Task[]>('member/tasks/', { params: actualParams });
      const data = response.data;
      if (data && typeof data === 'object' && 'results' in data) {
        return (data as PaginatedResponse<Task>).results || [];
      }
      if (Array.isArray(data)) {
        return data as Task[];
      }
      return [] as Task[];
    },
    enabled: actualOptions?.enabled ?? true,
  });
};

export const useMemberTask = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['member-tasks', id],
    queryFn: async () => {
      const response = await api.get<Task>(`member/tasks/${id}/`);
      return response.data;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};
