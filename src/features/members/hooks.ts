import api from '@/lib/api';
import { MemberMinimal, MemberWithProgress, PaginatedResponse } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useCommitteeMembers = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['committee-members'],
    queryFn: async () => {
      let url = 'members/assign/?page_size=100';
      // ... same logic ...
      let allResults: MemberMinimal[] = [];
      let pageCount = 0;
      const MAX_PAGES = 50;

      while (url && pageCount < MAX_PAGES) {
        const response = await api.get<PaginatedResponse<MemberMinimal> | MemberMinimal[]>(url);
        const data = response.data;
        
        if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
           // It's a paginated response
           allResults = [...allResults, ...data.results];
           
           if (data.next) {
             try {
               const nextUrl = new URL(data.next);
               const pathParts = nextUrl.pathname.split('/api/');
               if (pathParts.length > 1) {
                 url = pathParts[1] + nextUrl.search;
               } else {
                 url = nextUrl.pathname + nextUrl.search;
               }
             } catch (e) {
               console.error('Error parsing next URL:', data.next);
               url = '';
             }
           } else {
             url = '';
           }
        } else if (Array.isArray(data)) {
          return data;
        } else {
          url = '';
        }
        pageCount++;
      }
      return allResults;
    },
    enabled: options?.enabled ?? true,
  });
};

export const useMembersWithProgress = (options?: { enabled?: boolean; search?: string }) => {
  return useQuery({
    queryKey: ['members-with-progress', options?.search],
    queryFn: async () => {
      const searchParam = options?.search ? `&search=${encodeURIComponent(options.search)}` : '';
      let url = `members/?page_size=100${searchParam}`;
      let allResults: MemberWithProgress[] = [];
      let pageCount = 0;
      const MAX_PAGES = 50;

      while (url && pageCount < MAX_PAGES) {
        const response = await api.get<PaginatedResponse<MemberWithProgress>>(url);
        const data = response.data;
        
        if (data && data.results) {
          allResults = [...allResults, ...data.results];
        } else if (Array.isArray(data)) {
          // If the API returns a direct array (no pagination wrapper), just return it
          return { count: data.length, results: data };
        }

        if (data.next) {
          // Parse the next URL to use with our proxy
          // data.next is absolute: https://starunion.pythonanywhere.com/api/members/?page=2
          // We need to keep it relative to our axios instance (which likely has baseURL='/api')
          try {
            const nextUrl = new URL(data.next);
            // Verify if the path starts with /api/ and strip it if strictly using baseURL='/api'
            // OR simpler: just use the substring after /api/
            // Assuming backend URL structure is consistent
            const pathParts = nextUrl.pathname.split('/api/');
            if (pathParts.length > 1) {
              url = pathParts[1] + nextUrl.search;
            } else {
              // Fallback: use the full path but relative to root
              url = nextUrl.pathname + nextUrl.search;
            }
          } catch (e) {
             console.error('Error parsing next URL:', data.next);
             url = '';
          }
        } else {
          url = '';
        }
        pageCount++;
      }
      
      return { count: allResults.length, results: allResults };
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
