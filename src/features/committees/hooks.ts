import api from '@/lib/api';
import { Committee, CommitteeCreatePayload } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useCommitteeDetails = () => {
  return useQuery({
    queryKey: ['committee'],
    queryFn: async () => {
      const response = await api.get<Committee>('committee/');
      return response.data;
    },
  });
};

export const useUpdateCommittee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: Partial<CommitteeCreatePayload>) => {
      const response = await api.patch<Committee>('committee/', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee'] });
    },
  });
};

export const useCreateCommittee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CommitteeCreatePayload) => {
      const response = await api.post<Committee>('committees/', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committees'] });
    },
  });
};
