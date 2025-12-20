'use client';

import { useSession } from "next-auth/react";
import { FileText, DollarSign, Activity, MousePointerClick } from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrafficChart } from "@/components/dashboard/TrafficChart";
import { LighthouseCard } from "@/components/dashboard/LighthouseCard";
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";
import { TopPagesTable } from "@/components/dashboard/TopPagesTable";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-semibold text-destructive mb-2">Failed to load dashboard</h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred while fetching dashboard data"}
          </p>
        </div>
      </div>
    );
  }

  // Safe access to data structure
  const traffic = data?.traffic;
  const business = data?.business;
  const content = data?.content;
  const vitals = data?.vitals;

  // Custom Footer for Engagement Card
  const engagementFooter = traffic?.summary.avgSessionDuration ? (
    <div className="mt-3 pt-3 border-t flex justify-between items-center text-xs text-muted-foreground">
      <span>Avg Session:</span>
      <span className="font-medium text-foreground">{traffic.summary.avgSessionDuration}</span>
    </div>
  ) : null;

  return (
    <div className="p-6 space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Executive Overview
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {session?.user?.name}!
          </p>
        </div>
      </div>

      {/* ROW 1: KPI CARDS (4 Columns) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Engagement Card with Footer */}
        <StatsCard 
          title="Engagement Rate" 
          value={traffic?.summary.engagement || "0%"} 
          icon={MousePointerClick} 
          footer={engagementFooter}
        />
        
        {/* Business KPI (CRM) */}
        <StatsCard 
          title="Active Pipeline" 
          value={formatCurrency(business?.pipeline.value || 0)} 
          icon={DollarSign}
          trend={`${business?.leads.unread || 0} new leads`}
        />
        
        {/* Content KPI (Strapi) */}
        <StatsCard 
          title="Total Content" 
          value={content?.totalArticles || 0} 
          icon={FileText} 
          trend={content?.status || "Unknown"}
          trendClassName={content?.status === 'Offline' ? 'text-red-500 font-bold' : undefined}
        />
        
        {/* Health KPI (Lighthouse) */}
        <StatsCard 
          title="Performance" 
          value={vitals?.performanceScore ?? 0} 
          icon={Activity} 
          trend="Lighthouse"
        />
      </div>

      {/* ROW 2: TRAFFIC & ACTIVITY (Split 5:2 on 7-column grid) */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Chart takes up 5/7 columns with min-w-0 to prevent blowout */}
        <Card className="col-span-7 lg:col-span-5 min-w-0">
          <CardHeader>
            <CardTitle>Traffic Trends</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              User activity over the last 7 days
            </p>
          </CardHeader>
          <CardContent className="pl-0">
            <TrafficChart data={traffic?.chart} />
          </CardContent>
        </Card>
        
        {/* Activity Feed takes up 2/7 columns */}
        <Card className="col-span-7 lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Latest CRM submissions
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <RecentActivityList data={business?.activity || []} />
          </CardContent>
        </Card>
      </div>

      {/* ROW 3: DEEP DIVE DETAILS (3 Columns) */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Top Pages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Most visited pages
            </p>
          </CardHeader>
          <CardContent>
            <TopPagesTable data={data?.topPages} />
          </CardContent>
        </Card>
        
        {/* Lighthouse Core Vitals */}
        <LighthouseCard 
          title="Core Web Vitals" 
          score={vitals?.performanceScore ?? null} 
          metrics={vitals ? { 
            lcp: vitals.lcp, 
            cls: vitals.cls,
            fcp: vitals.fcp 
          } : undefined}
        />
        
        {/* SEO Score Card (placeholder) */}
        <LighthouseCard 
          title="SEO Score" 
          score={90}
        />
      </div>
    </div>
  );
}
