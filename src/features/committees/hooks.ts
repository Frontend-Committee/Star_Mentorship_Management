import api from '@/lib/api';
import { Committee, CommitteeCreatePayload } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useCommitteeDetails = (id?: number | null) => {
  return useQuery({
    queryKey: ['committee', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get<Committee>(`committees/${id}/`);
      return response.data;
    },
    enabled: !!id,
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
