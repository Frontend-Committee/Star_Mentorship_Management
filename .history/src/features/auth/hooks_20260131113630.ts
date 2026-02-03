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
      try {
        
        
        const response = await api.post('auth/users/', data);

        
        if (response.data && response.data.email && Array.isArray(response.data.email)) {
          throw new Error(response.data.email[0]);
        }

        return response.data;
      } catch (error: any) {
        if (error.response && error.response.data) {
          
          const data = error.response.data;

          
          if (data.password && Array.isArray(data.password)) {
            throw new Error(`Password: ${data.password[0]}`);
          }

          
          if (data.email && Array.isArray(data.email)) {
            throw new Error(`Email: ${data.email[0]}`);
          }

          
          const firstErrorKey = Object.keys(data)[0];
          if (firstErrorKey && Array.isArray(data[firstErrorKey])) {
            throw new Error(`${firstErrorKey}: ${data[firstErrorKey][0]}`);
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
      const response = await api.get<any>('members/ass');
      
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results as User[];
      }
      
      if (Array.isArray(response.data)) {
        console.log(response.data);
        
        return response.data as User[];
      }
      console.warn('Unexpected API response format for users:', response.data);
      return [] as User[];
    }
  });
};
