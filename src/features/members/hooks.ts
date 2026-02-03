import api from '@/lib/api';
import { MemberMinimal, MemberWithProgress, PaginatedResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useCommitteeMembers = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['committee-members'],
    queryFn: async () => {
      const response = await api.get<any>('members/assign/');
      
      // Handle potential pagination or direct array
      const data = response.data;
      if (data && Array.isArray(data.results)) {
        return data.results as MemberMinimal[];
      }
      if (data && Array.isArray(data.data)) {
        return data.data as MemberMinimal[];
      }
      if (data && Array.isArray(data.members)) {
        return data.members as MemberMinimal[];
      }
      if (Array.isArray(data)) {
        return data as MemberMinimal[];
      }
      return [];
    },
    enabled: options?.enabled ?? true,
  });
};

export const useMembersWithProgress = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['members-with-progress'],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<MemberWithProgress>>('members/');
      return response.data;
    },
    enabled: options?.enabled ?? true,
  });
};
