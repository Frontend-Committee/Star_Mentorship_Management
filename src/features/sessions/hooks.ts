/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/api';
import attendanceApi from '@/lib/attendanceApi';
import { Attendance, AttendanceUpdatePayload, Session, SessionCreatePayload } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --- Admin Hooks ---

// Helper to map committee/role name to API slug
type CommitteeSlug =
  | 'front_committee'
  | 'back_committee'
  | 'mobile_committee'
  | 'ai_committee'
  | 'uiux_committee'
  | 'data_analysis_committee';

const COMMITTEE_MAP: { keywords: string[]; slug: CommitteeSlug }[] = [
  { keywords: ['backend', 'back-end'], slug: 'back_committee' },
  { keywords: ['mobile'], slug: 'mobile_committee' },
  { keywords: ['ai', 'artificial intelligence'], slug: 'ai_committee' },
  { keywords: ['ui', 'ux', 'design'], slug: 'uiux_committee' },
  { keywords: ['data', 'analysis'], slug: 'data_analysis_committee' },
];

export const getCommitteeSlug = (name?: string): CommitteeSlug => {
  if (!name) return 'front_committee';

  const lower = name.toLowerCase();

  for (const committee of COMMITTEE_MAP) {
    if (committee.keywords.some(k => lower.includes(k))) {
      return committee.slug;
    }
  }

  return 'front_committee';
};
// --- Admin Hooks ---

export const useAdminSessions = (committeeSlug?: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-sessions', committeeSlug],
    queryFn: async () => {
      if (!committeeSlug) return [] as Session[];
      const response = await attendanceApi.get<any>(`/sessions/${committeeSlug}/`);
      // Handle DRF pagination
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results as Session[];
      }
      if (Array.isArray(response.data)) {
        return response.data as Session[];
      }
      return [] as Session[];
    },
    enabled: options?.enabled && !!committeeSlug,
  });
};

export const useAdminSession = (committeeSlug: string, id: number) => {
  return useQuery({
    queryKey: ['admin-sessions', committeeSlug, id],
    queryFn: async () => {
      const response = await attendanceApi.get<Session>(`/sessions/${committeeSlug}/${id}/`);
      return response.data;
    },
    enabled: !!id && !!committeeSlug,
  });
};

export const useCreateSession = (committeeSlug?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SessionCreatePayload) => {
      if (!committeeSlug) throw new Error("Committee slug is missing");
      const response = await attendanceApi.post<Session>(`/sessions/${committeeSlug}/`, data);
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

export const useUpdateSession = (committeeSlug?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SessionCreatePayload> }) => {
      if (!committeeSlug) throw new Error("Committee slug is missing");
      const response = await attendanceApi.patch<Session>(`/sessions/${committeeSlug}/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    },
  });
};

export const useDeleteSession = (committeeSlug?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      if (!committeeSlug) throw new Error("Committee slug is missing");
      await attendanceApi.delete(`/sessions/${committeeSlug}/${id}/`);
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

export const useMemberSessions = (committeeSlug?: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['member-sessions', committeeSlug],
    queryFn: async () => {
      if (!committeeSlug) return [] as Session[];
      const response = await attendanceApi.get<any>(`/sessions/${committeeSlug}/`);
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results as Session[];
      }
      if (Array.isArray(response.data)) {
        return response.data as Session[];
      }
      return [] as Session[];
    },
    enabled: options?.enabled && !!committeeSlug,
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
