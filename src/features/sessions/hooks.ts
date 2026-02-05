/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/api';
import attendanceApi from '@/lib/attendanceApi';
import { Attendance, AttendanceUpdatePayload, Session, SessionCreatePayload } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --- Admin Hooks ---

export const useAdminSessions = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-sessions'],
    queryFn: async () => {
      const response = await attendanceApi.get<any>('/sessions/front_committee/');
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
      const response = await attendanceApi.get<Session>(`/sessions/front_committee/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SessionCreatePayload) => {
      const response = await attendanceApi.post<Session>('/sessions/front_committee/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SessionCreatePayload> }) => {
      const response = await attendanceApi.patch<Session>(`/sessions/front_committee/${id}/`, data);
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
      await attendanceApi.delete(`/sessions/front_committee/${id}/`);
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
      const response = await attendanceApi.patch<Attendance>(`/attendances/${id}/`, data);
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
      const response = await attendanceApi.get<any>('/sessions/front_committee/');
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

export const useMemberAttendance = (referenceId?: string | null, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['member-attendance', referenceId],
    queryFn: async () => {
      const response = await attendanceApi.get<any>('/attendances/', {
        params: { reference_id: referenceId }
      });
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results as Attendance[];
      }
      if (Array.isArray(response.data)) {
        return response.data as Attendance[];
      }
      return [] as Attendance[];
    },
    enabled: options?.enabled && !!referenceId,
  });
};
