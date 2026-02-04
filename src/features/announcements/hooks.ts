import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Announcement, AnnouncementCreatePayload } from '../../types';

export const useAnnouncements = () => {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await api.get('announcements/');
      // Handle potential paginated response from DRF or similar
      if (Array.isArray(response.data)) {
        return response.data as Announcement[];
      } else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
        return (response.data as { results: Announcement[] }).results;
      }
      return [] as Announcement[];
    },
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AnnouncementCreatePayload) => {
      const response = await api.post<Announcement>('announcements/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<AnnouncementCreatePayload> }) => {
      const response = await api.patch<Announcement>(`announcements/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`announcements/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};
