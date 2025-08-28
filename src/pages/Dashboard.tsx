// src/pages/Dashboard.tsx
import { useMemo } from "react";
import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  Tooltip as RTooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useOverallData } from "@/hooks/useOverallData";
import { useAllPartners } from "@/hooks/useAllPartners";
import { useApptShare } from "@/hooks/useApptShare";
import { getISOWeekYear } from "@/lib/iso-week";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { CostsLineChart } from "@/components/charts/CostsLineChart";
import { Separator } from "@/components/ui/separator";

const Progress = ({ pct }: { pct: number }) => (
  <div className="w-full h-2 rounded bg-muted">
    <div
      className="h-2 rounded bg-secondary"
      style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
    />
  </div>
);

export const Dashboard = () => {
  const { data: overallData, isLoading: overallLoading } = useOverallData();
  const { data: partners, isLoading: partnersLoading } = useAllPartners();

  const { week: rawWeek, year: rawYear } = getISOWeekYear(new Date());
  const fixedEvenWeek =
    rawWeek % 2 === 0 ? rawWeek : rawWeek === 53 ? 52 : rawWeek + 1;

  const loading = overallLoading || partnersLoading;

  const { currentRow, prevRow } = useMemo(() => {
    if (!overallData || overallData.length === 0) return { currentRow: undefined, prevRow: undefined };
    const byKey = (w: number, y: number) =>
      overallData.find((r) => r.week_num === w - 1 && r.year_num === y);

    let cur = byKey(fixedEvenWeek, rawYear) ?? overallData[overallData.length - 1];
    let prev: typeof cur | undefined;

    if (cur) {
      const i = overallData.findIndex(
        (r) => r.week_num === cur!.week_num && r.year_num === cur!.year_num
      );
      prev = overallData[Math.max(0, i - 1)];
    }
    return { currentRow: cur, prevRow: prev };
  }, [overallData, fixedEvenWeek, rawYear]);

  // Current-week partner share (used for leaderboard)
  const { shareData = [] } = useApptShare(currentRow);
  const totalShare = shareData.reduce((s: number, r: any) => s + (r?.value ?? 0), 0);
  const partnerCount = partners?.length ?? 0;
  const avgShare = partnerCount > 0 ? totalShare / partnerCount : 0;

  // KPIs
  const kpis = useMemo(() => {
    if (!currentRow)
      return {
        apptsActual: 0,
        apptsPlan: 0,
        apptsDelta: 0,
        apptsDeltaPct: 0,
        cpaActual: 0,
        cpaPlan: 0,
        cpaDelta: 0,
        cpaDeltaPct: 0,
        performancePct: 0,
        partnersCount: partnerCount,
        weeksTracked: overallData?.length ?? 0,
        bestWeek: undefined as typeof currentRow | undefined,
      };

    const apptsActual = currentRow.appts_ocd_actual ?? 0;
    const apptsPlan = currentRow.appts_ocd_bizplan ?? 0;
    const apptsDelta = apptsActual - apptsPlan;
    const apptsDeltaPct = apptsPlan > 0 ? (apptsActual / apptsPlan - 1) * 100 : 0;

    const costsActual = currentRow.costs_actual ?? 0;
    const costsPlan = currentRow.costs_bizplan ?? 0;

    const cpaActual = Math.round(costsActual > 0 ? costsActual / apptsActual : 0);
    const cpaPlan = Math.round(costsPlan > 0 ? costsPlan / apptsPlan : 0);
    const cpaDelta = cpaActual - cpaPlan;
    const cpaDeltaPct = cpaPlan > 0 ? (cpaActual / cpaPlan - 1) * 100 : 0;

    const performancePct = apptsPlan > 0 ? (apptsActual / apptsPlan) * 100 : 0;

    const bestWeek =
      overallData && overallData.length
        ? overallData.reduce((best, r) =>
            (r.appts_ocd_actual ?? 0) > (best.appts_ocd_actual ?? 0) ? r : best
          )
        : undefined;

    return {
      apptsActual,
      apptsPlan,
      apptsDelta,
      apptsDeltaPct,
      cpaActual,
      cpaPlan,
      cpaDelta,
      cpaDeltaPct,
      performancePct,
      partnersCount: partnerCount,
      weeksTracked: overallData?.length ?? 0,
      bestWeek,
    };
  }, [currentRow, overallData, partnerCount]);

  // Trends
  const trendData = useMemo(() => {
    if (!overallData) return [];
    return overallData.map((w) => ({
      week: `W${w.week_num}`,
      apptsActual: w.appts_ocd_actual ?? 0,
      apptsPlan: w.appts_ocd_bizplan ?? 0,
      cpaActual: w.cpa_actual ?? 0,
      perfPct: w.appts_ocd_bizplan > 0 ? (w.appts_ocd_actual / w.appts_ocd_bizplan) * 100 : 0,
    }));
  }, [overallData]);

  // Recent weeks table (last 8 rows)
  const recent = useMemo(() => {
    if (!overallData) return [];
    return [...overallData]
      .filter((w) => w.week_num < fixedEvenWeek)
      .slice(-8)
      .map((w) => ({
        week_num: w.week_num,
        year_num: w.year_num,
        apptsActual: w.appts_ocd_actual ?? 0,
        apptsPlan: w.appts_ocd_bizplan ?? 0,
        perfPct: w.appts_ocd_bizplan > 0 ? (w.appts_ocd_actual / w.appts_ocd_bizplan) * 100 : 0,
        cpaActual: w.cpa_actual ?? 0,
        cpaPlan: w.cpa_bizplan ?? 0,
      }))
      .reverse();
  }, [overallData]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <div className="h-4 w-40 bg-muted rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-lg" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
          <div className="h-80 bg-muted rounded-lg" />
          <div className="h-80 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <div className="text-sm text-muted-foreground">
          Workout Week: {fixedEvenWeek} ({currentRow?.year_num ?? rawYear})
        </div>
      </div>

      
      {/* KPI Row */}
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center mt-4 gap-4">
        <div className="p-2">
          <div className="pb-2">
            <h1 className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              APPTS vs Plan (current week)
            </h1>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {kpis.apptsActual.toLocaleString()}{" "}
              <span className="text-sm text-muted-foreground">/ {kpis.apptsPlan.toLocaleString()}</span>
            </div>
            <div
              className={`mt-1 flex items-center gap-1 text-sm ${
                kpis.apptsDelta >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {kpis.apptsDelta >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {kpis.apptsDelta.toLocaleString()} ({kpis.apptsDeltaPct.toFixed(1)}%)
            </div>
          </div>
        </div>
        
        <Separator orientation="vertical" />

        <div className="p-2">
          <div className="pb-2">
            <h1 className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              CPA vs Plan (current week)
            </h1>
          </div>
          <div>
            <div className="text-2xl font-bold">
              ${Math.round(kpis.cpaActual).toLocaleString()}{" "}
              <span className="text-sm text-muted-foreground">/ ${Math.round(kpis.cpaPlan).toLocaleString()}</span>
            </div>
            <div
              className={`mt-1 flex items-center gap-1 text-sm ${
                kpis.cpaDelta <= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {/* Lower CPA is better */}
              {kpis.cpaDelta <= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {kpis.cpaDelta >= 0 ? "+" : ""}
              {Math.round(kpis.cpaDelta).toLocaleString()} ({kpis.cpaPlan > 0 ? kpis.cpaDeltaPct.toFixed(1) : "0.0"}%)
            </div>
          </div>
        </div>

        <Separator orientation="vertical" />

        <div className="p-2">
          <div className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Coverage
            </CardTitle>
          </div>
          <div>
            <div className="text-2xl font-bold">{kpis.partnersCount}</div>
            <div className="mt-1 text-sm text-muted-foreground">{kpis.weeksTracked} weeks tracked</div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Trends */}
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        <div>
          <div className="p-4">
            <h1 className="text-2xl font-medium">Appointments Trend</h1>
          </div>
          <div className="">
            <ChartContainer
              config={{
                apptsActual: { label: "Actual", color: "hsl(var(--primary))" },
                apptsPlan: { label: "Plan", color: "hsl(var(--secondary))" },
              }}
              className="h-80 w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="apptsActual"
                    stroke="var(--color-apptsActual)"
                    strokeWidth={2}
                    name="Actual"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="apptsPlan"
                    stroke="var(--color-apptsPlan)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Plan"
                    dot={false}
                  />
                </RLineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        <div>
          <div className="p-4">
            <h1 className="text-2xl font-medium">Costs Trend</h1>
          </div>
          <div>      
            <CostsLineChart data={overallData} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Partner Share Leaderboard (Current Week) */}
      <div>
        <div className="p-4">
          <h1 className="text-2xl font-medium">Partner Share — Current Week</h1>
        </div>
        <div className="pl-4">
          {shareData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No partner share data for this week.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    <th className="text-left py-2 pr-2">Partner</th>
                    <th className="text-right py-2 px-2">Share</th>
                    <th className="text-left py-2 pl-2 w-2/3">%</th>
                  </tr>
                </thead>
                <tbody>
                  {[...shareData]
                    .sort((a: any, b: any) => (b?.value ?? 0) - (a?.value ?? 0))
                    .map((row: any, idx: number) => {
                      const share = row?.value ?? 0;
                      const pct = totalShare > 0 ? (share / totalShare) * 100 : 0;
                      const rel = avgShare > 0 ? (share / avgShare) * 100 : 0;
                      return (
                        <tr key={row?.name ?? idx} className="border-b last:border-0">
                          <td className="py-2 pr-2">{row?.name ?? "—"}</td>
                          <td className="py-2 px-2 text-right">{pct.toFixed(1)}%</td>
                          <td className="py-2 pl-2">
                            <Progress pct={pct}/>
                            <div className="mt-1 text-xs text-muted-foreground">{pct.toFixed(0)}% of Total</div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Recent Weeks Summary */}
      <div>
        <div className="p-4">
          <h1 className="text-2xl font-medium">Recent Weeks Summary</h1>
        </div>
        <div className="pl-4">
          {recent.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent weeks found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Week</th>
                    <th className="text-right py-2 px-2">APPTS (Actual)</th>
                    <th className="text-right py-2 px-2">APPTS (Plan)</th>
                    <th className="text-right py-2 px-2">CPA (Actual)</th>
                    <th className="text-right py-2 px-2">CPA (Plan)</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={`${r.year_num}-${r.week_num}`} className="border-b last:border-0">
                      <td className="py-2 px-2">{`W${r.week_num}`}</td>
                      <td className="py-2 px-2 text-right">{r.apptsActual.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right">{r.apptsPlan.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right">${Math.round(r.cpaActual).toLocaleString()}</td>
                      <td className="py-2 px-2 text-right">${Math.round(r.cpaPlan).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
