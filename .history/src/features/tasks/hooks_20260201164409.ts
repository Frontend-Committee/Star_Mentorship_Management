/* eslint-disable @typescript-eslint/no-explicit-any */
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
      // Returns TaskDetail which includes submissions[]
      const response = await api.get<TaskDetail>(`/admin/tasks/${id}/`);
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
      const errorMessage = error.response?.data
        ? Object.entries(error.response.data).map(([key, value]) => `${key}: ${value}`).join(', ')
        : "Failed to create task. Please try again.";
      toast(errorMessage);
      console.error("Unknown error:", error);
    }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TaskUpdatePayload }) => {
      // Using PATCH for partial update as per spec (Option 3)
      const response = await api.patch<TaskDetail>(`/admin/tasks/${id}/`, data);
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
      // Spec: GET /api/admin/submissions/
      const response = await api.get<any>('/admin/submissions/');
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results as TaskSubmissionDetail[];
      }
      if (Array.isArray(response.data)) {
        return response.data as TaskSubmissionDetail[];
      }
      return [] as TaskSubmissionDetail[];
    },
    enabled: options?.enabled,
  });
};

// Deprecated or Helper: Get submissions via Task Detail
// The spec says GET /api/admin/tasks/{id}/ returns task + submissions.
// So this can just extract them from useAdminTask, but for standalone fetching:
export const useAdminTaskSubmissions = (taskId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-task-submissions', taskId],
    queryFn: async () => {
      // We can use the task detail endpoint to get submissions
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
      // Not explicitly in spec, but assuming standard REST
      await api.delete(`/admin/feedback/${id}/`);
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
      // Spec: GET /api/member/tasks/ (Read-only details, no submissions list)
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

// Moved member submission hooks to src/features/submissions/hooks.ts
