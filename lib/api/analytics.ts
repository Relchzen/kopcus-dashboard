import { apiClient } from './client';

// TypeScript Interfaces for Analytics Data (matching backend contract)
export interface TrafficSummary {
    totalUsers: number;
    pageViews: number;
    engagement: string; // percentage string, e.g. "52.5%"
}

export interface DailyTraffic {
    date: string; // formatted label, e.g. "18 Dec"
    users: number;
}

export interface LighthouseData {
    performanceScore: number | null; // 0-100 score, null when unavailable
    lcp: string | null; // Largest Contentful Paint display value
    cls: string | null; // Cumulative Layout Shift display value
    fetchedAt: string; // ISO timestamp
}

export interface CoreVitalsMetrics {
    traffic: {
        summary: TrafficSummary;
        chart: DailyTraffic[];
    };
    vitals: LighthouseData;
}

// Backend API Response Structure
interface DashboardResponse {
    success: boolean;
    data: CoreVitalsMetrics;
    message: string;
}

// Analytics API Client
export const analyticsApi = {
    /**
     * Fetch aggregated dashboard analytics including:
     * - 7-day traffic data (Google Analytics 4)
     * - Lighthouse performance metrics
     * - Core Web Vitals
     */
    async getDashboardStats(): Promise<CoreVitalsMetrics> {
        const response = await apiClient.get<DashboardResponse>('/analytics/dashboard');

        // Backend returns: { success: true, data: { traffic, vitals }, message }
        // Extract the actual data from response.data.data
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
            return (response.data as DashboardResponse).data;
        }

        // Fallback for direct data structure
        return response.data as CoreVitalsMetrics;
    },

    /**
     * Fetch detailed traffic data for a specific date range
    /**
     * Fetch traffic data for a specific date range
     */
    async getTrafficData(startDate: string, endDate: string): Promise<DailyTraffic[]> {
        const response = await apiClient.get<{ data: DailyTraffic[] }>(
            `/analytics/traffic?start=${startDate}&end=${endDate}`
        );

        const actualData = (response.data as { data?: DailyTraffic[] })?.data || response.data;
        return actualData as DailyTraffic[];
    },

    /**
     * Fetch latest Lighthouse audit results
     */
    async getLighthouseMetrics(): Promise<LighthouseData> {
        const response = await apiClient.get<{ data: LighthouseData }>('/analytics/lighthouse');

        const actualData = (response.data as { data?: LighthouseData })?.data || response.data;
        return actualData as LighthouseData;
    },
};
