import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '../../lib/api';
import { getAccessToken, setAccessToken, setRefreshToken } from '../../lib/auth';
import { LoginPayload, LoginResponse, PaginatedResponse, RegisterPayload, User } from '../../types';

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
      try {
        
        
        const response = await api.post('auth/users/', data);

        
        if (response.data && response.data.email && Array.isArray(response.data.email)) {
          throw new Error(response.data.email[0]);
        }

        return response.data;
      } catch (error: unknown) {
        const axiosError = error as AxiosError<Record<string, unknown>>;
        if (axiosError.response && axiosError.response.data) {
          const data = axiosError.response.data;

          if (data.password && Array.isArray(data.password)) {
            throw new Error(`Password: ${data.password[0]}`);
          }

          if (data.email && Array.isArray(data.email)) {
            throw new Error(`Email: ${data.email[0]}`);
          }

          const firstErrorKey = Object.keys(data)[0];
          const errorValue = data[firstErrorKey];
          if (firstErrorKey && Array.isArray(errorValue)) {
            throw new Error(`${firstErrorKey}: ${errorValue[0]}`);
          }

          throw new Error(JSON.stringify(data));
        }
        throw error;
      }
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
    enabled: isEnabled, 
    retry: false, 
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<User> | User[]>('auth/users/');
      const data = response.data;
      
      if ('results' in data && Array.isArray(data.results)) {
        return data.results;
      }
      
      if (Array.isArray(data)) {
        return data;
      }
      
      console.warn('Unexpected API response format for users:', data);
      return [] as User[];
    }
  });
};
