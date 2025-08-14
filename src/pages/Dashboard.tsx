import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOverallData } from "@/hooks/useOverallData";
import { useAllPartners } from "@/hooks/useAllPartners";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { supabase } from "@/integrations/supabase/client"
import { getISOWeekYear } from "@/lib/iso-week"
import { useState, useEffect } from "react"
import { useApptShare } from "@/hooks/useApptShare"


export const Dashboard = () => {
  const { data: overallData, isLoading: overallLoading } = useOverallData();
  const { data: partners, isLoading: partnersLoading } = useAllPartners();

  const { week: isoWeek, year: isoYear } = getISOWeekYear(new Date());
  const { week: prevIsoWeek, year: prevIsoYear } = getISOWeekYear(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  const currentWeek = overallData?.find(w => w.week_num === isoWeek && w.year_num === isoYear) ?? overallData?.[overallData.length - 1];
  const previousWeek = overallData?.find(w => w.week_num === prevIsoWeek && w.year_num === prevIsoYear) ?? (currentWeek ? overallData?.[Math.max(0,overallData.findIndex(w => w.week_num === currentWeek.week_num && w.year_num === currentWeek.year_num) - 1 )] : undefined);
  const { shareData, error, isLoading } = useApptShare(currentWeek)
  if (overallLoading || partnersLoading) {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-muted rounded-lg" />
            <div className="h-80 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const totalAppts = previousWeek?.appts_ocd_bizplan || 0;
  const totalActual = previousWeek?.appts_ocd_actual || 0;
  const currentCPA = previousWeek?.cpa_bizplan || 0;
  const actualCPA = previousWeek?.cpa_actual || 0;
  
  const appointmentVariance = totalActual - totalAppts;
  const cpaVariance = actualCPA - currentCPA;
  const weekOverWeekAppts = previousWeek ? totalAppts - previousWeek.appts_ocd_bizplan : 0;
  const weekOverWeekCPA = previousWeek ? currentCPA - previousWeek.cpa_bizplan : 0;

  const performanceRate = totalAppts > 0 ? (totalActual / totalAppts) * 100 : 0;
  const avgCPA = overallData ? overallData.reduce((sum, week) => sum + week.cpa_bizplan, 0) / overallData.length : 0;
  
  const trendData = overallData?.map(week => ({
    week: `W${week.week_num}`,
    appointments: week.appts_ocd_actual,
    bizplan: week.appts_ocd_bizplan,
    cpa: week.cpa_actual,
    performance: week.appts_ocd_bizplan > 0 ? (week.appts_ocd_actual / week.appts_ocd_bizplan) * 100 : 0
  })) || [];

  const chartConfig = {
    appointments: {
      label: "Appointments",
      color: "hsl(var(--primary))",
    },
    bizplan: {
      label: "Business Plan",
      color: "hsl(var(--secondary))",
    },
    cpa: {
      label: "CPA",
      color: "hsl(var(--accent))",
    },
    performance: {
      label: "Performance %",
      color: "hsl(var(--muted-foreground))",
    },
  };

  const SLICE_COLORS = [
    "#6366F1", "#10B981", "#F59E0B", "#EF4444", "#06B6D4",
    "#8B5CF6", "#84CC16", "#F97316", "#EC4899", "#22C55E",
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <div className="text-sm text-muted-foreground">
          Current Week: {currentWeek?.week_num} ({currentWeek?.year_num})
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Partners:</span>
              <span className="font-medium">{partners?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Weeks Tracked:</span>
              <span className="font-medium">{overallData?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Weekly Appts:</span>
              <span className="font-medium">
                {overallData ? (overallData.reduce((sum, week) => sum + week.appts_ocd_actual, 0) / overallData.length).toFixed(0) : 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(() => {
              const bestWeek = overallData?.reduce((best, current) => 
                current.appts_ocd_actual > best.appts_ocd_actual ? current : best
              );
              return bestWeek ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Week:</span>
                    <span className="font-medium">W{bestWeek.week_num}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Appointments:</span>
                    <span className="font-medium">{bestWeek.appts_ocd_actual.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">CPA:</span>
                    <span className="font-medium">${bestWeek.cpa_actual.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">No data available</span>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CPA Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData.slice(-4)}>
                  <Line 
                    type="monotone" 
                    dataKey="cpa" 
                    stroke="var(--color-cpa)" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appointments Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="appointments" 
                    stroke="var(--color-appointments)" 
                    strokeWidth={2}
                    name="Actual"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bizplan" 
                    stroke="var(--color-bizplan)" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    name="Business Plan"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointments Share (Current Week)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={shareData}
                    dataKey="value"
                    className="text-sm"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={120}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    isAnimationActive
                  >
                    {shareData.map((_, i) => (
                      <Cell key={i} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number, n: string) => [v.toLocaleString(), n]}
                  />
                  
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      
    </div>
  );
};