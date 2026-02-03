import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { getAccessToken, setAccessToken, setRefreshToken } from '../../lib/auth';
import { LoginPayload, LoginResponse, RegisterPayload, ResetPasswordConfirmPayload, ResetPasswordPayload, SetPasswordPayload, User } from '../../types';

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

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<User> | FormData) => {
      // By passing null/undefined to headers, we let the browser/axios handle boundary for FormData
      const response = await api.patch<User>('auth/users/me/', data, {
        headers: data instanceof FormData ? { 'Content-Type': undefined } : {}
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
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

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await api.get<User>(`auth/users/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

import { mockMembers } from '../../data/mockData';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('auth/users/');
        
        let users: User[] = [];
        if (response.data && Array.isArray(response.data.results)) {
          users = response.data.results as User[];
        } else if (Array.isArray(response.data)) {
          users = response.data as User[];
        }
        
        // If API returns successfully but with no users, fallback to mock data for demo
        if (users.length === 0) {
          return mockMembers.map(m => ({
            id: parseInt(m.id),
            first_name: m.name.split(' ')[0],
            last_name: m.name.split(' ')[1] || '',
            email: m.email,
            role: 'member' as const,
            committee: null,
            created_at: new Date().toISOString(),
            img: null
          })) as User[];
        }
        
        return users;
      } catch (error) {
        return mockMembers.map(m => ({
          id: parseInt(m.id),
          first_name: m.name.split(' ')[0],
          last_name: m.name.split(' ')[1] || '',
          email: m.email,
          role: 'member' as const,
          committee: null,
          created_at: new Date().toISOString(),
          img: null
        })) as User[];
      }
    }
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordPayload) => {
      const response = await api.post('auth/users/reset_password/', data);
      return response.data;
    },
  });
};

export const useResetPasswordConfirm = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordConfirmPayload) => {
      const response = await api.post('auth/users/reset_password_confirm/', data);
      return response.data;
    },
  });
};

export const useSetPassword = () => {
  return useMutation({
    mutationFn: async (data: SetPasswordPayload) => {
      const response = await api.post('auth/users/set_password/', data);
      return response.data;
    },
  });
};
