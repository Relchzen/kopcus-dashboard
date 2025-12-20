import type { DashboardData } from '@/types/analytics';

/**
 * Mock dashboard analytics data for development and testing
 * This simulates the expected response from /analytics/dashboard endpoint
 * Matches the real backend contract with business and content stats
 */
export const mockDashboardData: DashboardData = {
    traffic: {
        summary: {
            totalUsers: 1432,
            pageViews: 3120,
            engagement: "54.8%",
            avgSessionDuration: "2m 34s", // NEW
        },
        chart: [
            { date: "13 Dec", users: 180 },
            { date: "14 Dec", users: 192 },
            { date: "15 Dec", users: 205 },
            { date: "16 Dec", users: 210 },
            { date: "17 Dec", users: 226 },
            { date: "18 Dec", users: 214 },
            { date: "19 Dec", users: 205 },
        ],
    },
    vitals: {
        performanceScore: 89,
        lcp: "1.8 s",
        fcp: "1.2 s", // NEW
        cls: "0.04",
        fetchedAt: "2025-12-19T06:45:12.102Z",
    },
    business: {
        leads: { unread: 3 },
        pipeline: { value: 45000000 }, // Rp 45,000,000
        activity: [
            {
                id: "1",
                fullName: "Budi Santoso",
                company: "PT Maju Jaya",
                projectType: "Website Development",
                submittedAt: "2025-12-19T10:30:00Z",
            },
            {
                id: "2",
                fullName: "Siti Nurhaliza",
                company: null,
                projectType: "Brand Identity",
                submittedAt: "2025-12-19T08:15:00Z",
            },
            {
                id: "3",
                fullName: "Ahmad Rizki",
                company: "Kopi Nusantara",
                projectType: "Social Media Management",
                submittedAt: "2025-12-18T16:45:00Z",
            },
            {
                id: "4",
                fullName: "Dewi Lestari",
                company: "Batik Modern",
                projectType: "E-commerce Platform",
                submittedAt: "2025-12-18T14:20:00Z",
            },
            {
                id: "5",
                fullName: "Rudi Hartono",
                company: null,
                projectType: "Logo Design",
                submittedAt: "2025-12-18T11:00:00Z",
            },
        ],
    },
    content: {
        totalArticles: 24,
        status: "Connected",
    },
    topPages: [
        { path: "/", views: 1200, title: "Home" },
        { path: "/portfolio", views: 850, title: "Portfolio" },
        { path: "/services", views: 520, title: "Services" },
        { path: "/contact", views: 320, title: "Contact" },
        { path: "/about", views: 150, title: "About" },
    ],
};
