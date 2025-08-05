import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOverallData } from "@/hooks/useOverallData";
import { useAllPartners } from "@/hooks/useAllPartners";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export const Dashboard = () => {
  const { data: overallData, isLoading: overallLoading } = useOverallData();
  const { data: partners, isLoading: partnersLoading } = useAllPartners();

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

  const currentWeek = overallData?.[overallData.length - 1];
  const previousWeek = overallData?.[overallData.length - 2];
  
  // Calculate key metrics - using bizplan (projected) values
  const totalAppts = previousWeek?.appts_ocd_bizplan || 0;
  const totalActual = previousWeek?.appts_ocd_actual || 0;
  const currentCPA = previousWeek?.cpa_bizplan || 0;
  const actualCPA = previousWeek?.cpa_actual || 0;
  
  const appointmentVariance = totalActual - totalAppts;
  const cpaVariance = actualCPA - currentCPA;
  const weekOverWeekAppts = previousWeek ? totalAppts - previousWeek.appts_ocd_bizplan : 0;
  const weekOverWeekCPA = previousWeek ? currentCPA - previousWeek.cpa_bizplan : 0;

  // Calculate performance metrics
  const performanceRate = totalAppts > 0 ? (totalActual / totalAppts) * 100 : 0;
  const avgCPA = overallData ? overallData.reduce((sum, week) => sum + week.cpa_bizplan, 0) / overallData.length : 0;
  
  // Prepare trend data
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <div className="text-sm text-muted-foreground">
          Current Week: {currentWeek?.week_num} ({currentWeek?.year_num})
        </div>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projected Appointments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAppts.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {appointmentVariance >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                {appointmentVariance >= 0 ? '+' : ''}{appointmentVariance} vs actual
              </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projected CPA</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${currentCPA.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {cpaVariance <= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                {cpaVariance >= 0 ? '+' : ''}${cpaVariance.toFixed(0)} vs actual
              </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceRate.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {weekOverWeekAppts >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {weekOverWeekAppts >= 0 ? '+' : ''}{weekOverWeekAppts} WoW
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Projected CPA</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgCPA.toFixed(0)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {weekOverWeekCPA <= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                {weekOverWeekCPA >= 0 ? '+' : ''}${weekOverWeekCPA.toFixed(0)} WoW
              </div>
            </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Trend */}
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

        {/* Performance Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="performance" 
                    fill="var(--color-performance)"
                    name="Performance %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
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
    </div>
  );
};