import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { getAccessToken, setAccessToken, setRefreshToken } from '../../lib/auth';
import { LoginPayload, LoginResponse, RegisterPayload, User } from '../../types';

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: LoginPayload) => {
      const response = await api.post<LoginResponse>('auth/login/', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAccessToken(data.access);
      setRefreshToken(data.refresh);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RegisterPayload) => {
      // The API might return 200 with an error object like { "email": ["..."] }
      // We need to handle this manually since axios won't throw for 200.
      const response = await api.post('auth/users/', data);

      // Check if response data contains email error array
      if (response.data && response.data.email && Array.isArray(response.data.email)) {
        throw new Error(response.data.email[0]);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

export const useMe = (options?: { enabled?: boolean }) => {
  const isEnabled = options?.enabled !== undefined ? options.enabled : !!getAccessToken();
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await api.get<User>('auth/users/me/');
      return response.data;
    },
    enabled: isEnabled, // Only fetch if token exists to prevent 401 loops
    retry: false, // Don't retry if 401/403, just fail so we can redirect or show login
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get<User[]>('auth/users/');
      return response.data;
    }
  });
};
