// Core Analytics Types (matching backend API contract)
export interface TrafficSummary {
    totalUsers: number;
    pageViews: number;
    engagement: string; // percentage string, e.g. "54.8%"
    avgSessionDuration?: string; // NEW: e.g., "2m 34s"
}

export interface DailyTraffic {
    date: string; // formatted label, e.g. "18 Dec"
    users: number;
}

export interface LighthouseData {
    performanceScore: number | null; // 0-100 score, null when unavailable
    lcp: string | null; // Largest Contentful Paint display value
    cls: string | null; // Cumulative Layout Shift display value
    fcp: string | null; // NEW: First Contentful Paint
    fetchedAt: string; // ISO timestamp
}

// Business activity item
export interface BusinessActivityItem {
    id: string;
    fullName: string;
    projectType: string;
    company: string | null;
    submittedAt: string;
}

export interface BusinessStats {
    leads: { unread: number };
    pipeline: { value: number };
    activity: BusinessActivityItem[];
}

export interface ContentStats {
    totalArticles: number;
    status: 'Connected' | 'Offline';
}

// Top pages from GA4
export interface TopPage {
    path: string;
    views: number;
    title?: string; // optional page title
}

// The Core Data Object
export interface DashboardData {
    traffic: {
        summary: TrafficSummary;
        chart: DailyTraffic[];
    };
    vitals: LighthouseData;
    business: BusinessStats;
    content: ContentStats;
    topPages?: TopPage[]; // Optional: top 5-10 pages from GA4
}

// The API Response Wrapper
export interface DashboardApiResponse {
    success: boolean;
    message: string;
    data: DashboardData;
}

// Legacy alias for backward compatibility
export type DashboardResponseV2 = DashboardData;
