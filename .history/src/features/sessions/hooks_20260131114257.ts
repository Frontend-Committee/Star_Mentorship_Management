/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/api';
import { Attendance, AttendanceUpdatePayload, Session, SessionCreatePayload } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --- Admin Hooks ---

export const useAdminSessions = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-sessions'],
    queryFn: async () => {
      const response = await api.get<any>('/admin/sessions/');
      // Handle DRF pagination
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results as Session[];
      }
      if (Array.isArray(response.data)) {
        return response.data as Session[];
      }
      return [] as Session[];
    },
    enabled: options?.enabled,
  });
};

export const useAdminSession = (id: number) => {
  return useQuery({
    queryKey: ['admin-sessions', id],
    queryFn: async () => {
      const response = await api.get<Session>(`/admin/sessions/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SessionCreatePayload) => {
      const response = await api.post<Session>('/admin/sessions/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    },
  onError: (error) => {
        console.error("Unknown error:", error);
      }

      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SessionCreatePayload> }) => {
      const response = await api.patch<Session>(`/admin/sessions/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/sessions/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AttendanceUpdatePayload }) => {
      const response = await api.patch<Attendance>(`/admin/attendances/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    },
  });
};

// --- Member Hooks ---

export const useMemberSessions = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['member-sessions'],
    queryFn: async () => {
      const response = await api.get<any>('/members/sessions/');
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results as Session[];
      }
      if (Array.isArray(response.data)) {
        return response.data as Session[];
      }
      return [] as Session[];
    },
    enabled: options?.enabled,
  });
};

export const useMemberAttendance = () => {
  return useQuery({
    queryKey: ['member-attendance'],
    queryFn: async () => {
      const response = await api.get<any>('/members/attendances/');
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results as Attendance[];
      }
      if (Array.isArray(response.data)) {
        return response.data as Attendance[];
      }
      return [] as Attendance[];
    },
  });
};
