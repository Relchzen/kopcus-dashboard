import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { DashboardApiResponse, DashboardData } from '@/types/analytics';

/**
 * Custom hook to fetch dashboard analytics data from real backend
 * Uses React Query for caching, loading states, and automatic refetching
 */
export function useDashboardStats() {
    return useQuery<DashboardData>({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            // apiClient.get returns { success, data }
            // Backend returns { success, message, data }
            // So we need to unwrap response.data.data
            const response = await apiClient.get<DashboardApiResponse>('/analytics/dashboard');
            return response.data.data; // Unwrap the nested data
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        refetchOnWindowFocus: false,
        retry: 2,
    });
}
