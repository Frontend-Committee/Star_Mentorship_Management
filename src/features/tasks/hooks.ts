import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Task, TaskCreatePayload } from '../../types';

export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await api.get<Task[]>('tasks/');
      return response.data;
    },
  });
};

export const useTask = (id: number) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const response = await api.get<Task>(`tasks/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TaskCreatePayload) => {
      const response = await api.post<Task>('tasks/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<TaskCreatePayload>) => {
      const response = await api.patch<Task>(`tasks/${id}/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`tasks/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
