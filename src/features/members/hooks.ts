import api from '@/lib/api';
import { MemberMinimal, MemberWithProgress, PaginatedResponse } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useCommitteeMembers = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['committee-members'],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<MemberMinimal> | MemberMinimal[]>('members/assign/');
      
      // Handle potential pagination or direct array
      const data = response.data;
      if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
        return data.results;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
    enabled: options?.enabled ?? true,
  });
};

export const useMembersWithProgress = (options?: { enabled?: boolean; search?: string }) => {
  return useQuery({
    queryKey: ['members-with-progress', options?.search],
    queryFn: async () => {
      const searchParam = options?.search ? `&search=${encodeURIComponent(options.search)}` : '';
      const response = await api.get<PaginatedResponse<MemberWithProgress>>(`members/?page_size=30${searchParam}`);
      return response.data;
    },
    enabled: options?.enabled ?? true,
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, current_password }: { userId: string | number; current_password: string }) => {
      // Ensure we have a valid numeric ID
      const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      
      if (isNaN(id)) {
        console.error('Invalid User ID for deletion:', userId);
        throw new Error('Invalid User ID');
      }

      try {
        console.log(`[useDeleteMember] Attempting to delete member with ID: ${id} at auth/users/${id}/`);
        // The backend requires the current password for deletion
        const response = await api.delete(`auth/users/${id}/`, {
          data: { current_password }
        });
        console.log('[useDeleteMember] Delete successful:', response.data);
        return response.data;
      } catch (error: unknown) {
        console.error('[useDeleteMember] Delete failed:', error);
        
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: unknown; status?: number } };
          const data = axiosError.response?.data;
          const status = axiosError.response?.status;
          
          console.error(`[useDeleteMember] API Error ${status}:`, data);
          
          let message = `Failed to delete member (Status: ${status})`;
          if (typeof data === 'string') {
            message = data;
          } else if (data && typeof data === 'object' && data !== null) {
            const dataObj = data as Record<string, unknown>;
            message = (dataObj.detail as string) || (dataObj.error as string) || (dataObj.message as string) || (dataObj.current_password?.[0] as string) || JSON.stringify(data);
          }
          throw new Error(message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch members list
      queryClient.invalidateQueries({ queryKey: ['members-with-progress'] });
      queryClient.invalidateQueries({ queryKey: ['committee-members'] });
    },
  });
};
