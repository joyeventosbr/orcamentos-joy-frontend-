import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min — avoids redundant refetches
      retry: (failureCount, error) => {
        const status = (error as AxiosError)?.response?.status;
        // Never retry auth errors
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      onError: (error) => {
        const axiosError = error as AxiosError<{ message: string }>;
        console.error('[API Error]', axiosError.response?.data?.message ?? axiosError.message);
      },
    },
  },
});
