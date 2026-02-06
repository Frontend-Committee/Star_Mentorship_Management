import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { 
  WeekDetail, WeekCreatePayload, WeekItemCreatePayload, WeekItem, 
  WeekItemAdminDetail, ProgressCreatePayload, WeekProgress,
  MemberWeekDetail, MemberItem, MemberProgress, MemberProgressUpdate 
} from '../../types';

/**
 * Fetch all weeks
 * GET /admin/weeks/
 */
export const useWeeks = (role?: string) => {
  return useQuery({
    queryKey: ['weeks', role],
    queryFn: async () => {
      const endpoint = role === 'admin' ? 'admin/weeks/' : 'member/weeks/';
      const response = await api.get(endpoint);
      const data = response.data;
      console.log(`Raw API Response (${endpoint}):`, data);
      
      // Handle different response structures
      if (data && typeof data === 'object') {
        // Option 1: { weeks: [...] } - What the user is currently seeing
        if ('weeks' in data && Array.isArray(data.weeks)) {
          return data.weeks;
        }
        // Option 2: { results: [...] } - Standard DRF pagination
        if ('results' in data && Array.isArray(data.results)) {
          return data.results;
        }
        // Option 3: [...] - Direct array
        if (Array.isArray(data)) {
          return data;
        }
      }
      return [];
    },
  });
};

/**
 * Fetch a single week by ID (Role-based)
 * GET /admin/weeks/{id}/ OR /member/weeks/{id}/
 */
export const useWeek = (id: number, role?: string) => {
  return useQuery({
    queryKey: ['weeks', id, role],
    queryFn: async () => {
      const endpoint = role === 'admin' ? `admin/weeks/${id}/` : `member/weeks/${id}/`;
      const response = await api.get(endpoint);
      return response.data;
    },
    enabled: !!id, // Only fetch if id is provided
  });
};

/**
 * Create a new week
 * POST /admin/weeks/
 */
export const useCreateWeek = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WeekCreatePayload) => {
      const response = await api.post<WeekDetail>('admin/weeks/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks'] });
    },
  });
};

/**
 * Update a week
 * PATCH /admin/weeks/{id}/
 */
export const useUpdateWeek = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<WeekCreatePayload>) => {
      const response = await api.patch<WeekDetail>(`admin/weeks/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks'] });
      queryClient.invalidateQueries({ queryKey: ['weeks', id] });
    },
  });
};

/**
 * Update a week (Full Update)
 * PUT /admin/weeks/{id}/
 */
export const useUpdateWeekFull = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WeekCreatePayload) => {
      const response = await api.put<WeekDetail>(`admin/weeks/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks'] });
      queryClient.invalidateQueries({ queryKey: ['weeks', id] });
    },
  });
};

/**
 * Delete a week
 * DELETE /admin/weeks/{id}/
 */
export const useDeleteWeek = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`admin/weeks/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks'] });
    },
  });
};

/**
 * Create a new Week Item (content within a week)
 * POST /admin/items/
 */
export const useCreateWeekItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WeekItemCreatePayload) => {
      const response = await api.post<WeekItem>('admin/items/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks'] });
    },
  });
};

/**
 * Fetch a single week item detail (Admin View)
 * GET /admin/items/{id}/
 */
export const useWeekItem = (id: number) => {
  return useQuery({
    queryKey: ['weekItems', id],
    queryFn: async () => {
      const response = await api.get<WeekItemAdminDetail>(`admin/items/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Partially update a Week Item
 * PATCH /admin/items/{id}/
 */
export const useUpdateWeekItem = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<WeekItemCreatePayload>) => {
      const response = await api.patch<WeekItem>(`admin/items/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks'] });
      queryClient.invalidateQueries({ queryKey: ['weekItems', id] });
    },
  });
};

/**
 * Update a Week Item (Full Update)
 * PUT /admin/items/{id}/
 */
export const useUpdateWeekItemFull = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WeekItemCreatePayload) => {
      const response = await api.put<WeekItem>(`admin/items/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks'] });
      queryClient.invalidateQueries({ queryKey: ['weekItems', id] });
    },
  });
};

/**
 * Delete a Week Item
 * DELETE /admin/items/{id}/
 */
export const useDeleteWeekItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`admin/items/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks'] });
    },
  });
};

/**
 * Create a progress entry for a user and week item
 * POST /admin/progress/
 */
export const useCreateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProgressCreatePayload) => {
      const response = await api.post('admin/progress/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks'] });
      queryClient.invalidateQueries({ queryKey: ['weekItems'] });
    },
  });
};

/**
 * Fetch all personal progress entries (Student - Paginated)
 * GET /member/progress/
 */
export const useMemberProgressList = (page: number = 1) => {
  return useQuery({
    queryKey: ['memberProgressList', page],
    queryFn: async () => {
      const response = await api.get(`member/progress/`, {
        params: { page }
      });
      return response.data; // Returns PaginatedResponse<MemberProgress>
    },
  });
};

/**
 * Fetch personal progress information (Student)
 * GET /member/progress/{id}/
 */
export const useMemberProgress = (id: number) => {
  return useQuery({
    queryKey: ['memberProgress', id],
    queryFn: async () => {
      const response = await api.get<MemberProgress>(`member/progress/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Update personal progress (Student)
 * PUT /api/member/progress/{id}/update/
 */
export const useUpdateMemberProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MemberProgressUpdate }) => {
      console.log(`Updating progress for ID ${id}:`, data);
      const response = await api.put(`member/progress/${id}/update/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Progress updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['weeks'] });
      queryClient.invalidateQueries({ queryKey: ['memberProgress'] });
    },
    onError: (error) => {
      console.error('Failed to update progress:', error);
    }
  });
};

/**
 * Fetch detailed progress information (Admin)
 * GET /admin/progress/{id}/
 */
export const useProgress = (id: number) => {
  return useQuery({
    queryKey: ['progress', id],
    queryFn: async () => {
      const response = await api.get<WeekProgress>(`admin/progress/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Update a progress entry
 * PATCH /admin/progress/{id}/
 */
export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProgressCreatePayload> }) => {
      const response = await api.patch(`admin/progress/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks'] });
      queryClient.invalidateQueries({ queryKey: ['weekItems'] });
    },
  });
};

/**
 * Delete a progress entry
 * DELETE /admin/progress/{id}/
 */
export const useDeleteProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`admin/progress/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks'] });
      queryClient.invalidateQueries({ queryKey: ['weekItems'] });
    },
  });
};
