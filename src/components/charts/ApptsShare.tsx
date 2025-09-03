import React, { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import type { WeeklyMetrics } from "@/hooks/usePartnerData";
import type { OverallWeeklyMetrics } from "@/hooks/useOverall";

interface ApptsShareProps {
  partnerMetrics: WeeklyMetrics[]
  allMetrics:    OverallWeeklyMetrics[]
  currentWeek:   number
}

const safeShare = (
  part: number | null | undefined,
  total: number | null | undefined
) => {
  if (part == null || total == null || total <= 0) return null;
  const v = part / total;
  return Number.isFinite(v) ? v : null;
};

export const ApptsShare: React.FC<ApptsShareProps> = ({
  partnerMetrics,
  allMetrics,
  currentWeek,
}) => {
  const chartData = useMemo(() => {
    return Array.from({ length: 9 }, (_, i) => {
      const wk = currentWeek - 4 + i;
      const p  = partnerMetrics.find(d => d.week_num === wk);
      const t  = allMetrics   .find(d => d.week_num === wk);

      const partActual   = p?.appts_ocd_actual   ?? null;
      const totalActual  = t?.appts_ocd_actual   ?? null;
      const partBizplan  = p?.appts_ocd_bizplan  ?? null;
      const totalBizplan = t?.appts_ocd_bizplan  ?? null;

      return {
        week: wk,
        actualShare: safeShare(partActual,  totalActual),
        planShare:   safeShare(partBizplan, totalBizplan),
      };
    })
  }, [partnerMetrics, allMetrics, currentWeek])

  const [visibleWeeks, setVisibleWeeks] = useState<number[]>([]);
    useEffect(() => {
      setVisibleWeeks(chartData.map((d) => d.week));
    }, [chartData]);
  
  const filteredData = useMemo(
    () => chartData.filter((d) => visibleWeeks.includes(d.week)),
    [chartData, visibleWeeks]
  );
  

  const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`

  return (
    <div className="">
      <div className="relative flex items-center">
        <h3 className="text-lg font-semibold my-4 mx-auto text-foreground">
          APPTS SHARE
        </h3>
        <div className="absolute right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="">
              <Button variant="ghost" size="sm" className="p-2">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 space-y-1">
              {chartData.map(d => (
                <label key={d.week} className="flex items-center gap-2">
                  <Checkbox
                    className="h-4 w-4 rounded-none"
                    checked={visibleWeeks.includes(d.week)}
                    onCheckedChange={checked => {
                      setVisibleWeeks(v =>
                        checked
                        ? [...v, d.week]
                          : v.filter(w => w !== d.week)
                        );
                      }}
                  />
                  <span className="select-none">Week {d.week}</span>
                </label>
                        ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
          >
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              domain={[0, (dataMax: number) => Math.min(1, Math.max(0.01, dataMax) * 1.2)]}
              tickFormatter={fmtPct}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                fmtPct(value),
                name === "planShare" ? "Bizplan Share" : "Actual Share",
              ]}
              labelFormatter={(label) => `Week ${label}`}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                color: "hsl(var(--popover-foreground))",
              }}
            />
            <Bar
              dataKey="planShare"
              fill="hsl(var(--chart-planned))"
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            >
              <LabelList
                dataKey="planShare"
                position="top"
                formatter={fmtPct}
                style={{ fill: "#333", fontSize: 12 }}
              />
            </Bar>
            <Bar
              dataKey="actualShare"
              fill="hsl(var(--chart-actual))"
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            >
              <LabelList
                dataKey="actualShare"
                position="top"
                formatter={fmtPct}
                style={{ fill: "#333", fontSize: 12 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 my-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-chart-planned rounded-full" />
          Bizplan Share
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-chart-actual rounded-full" />
          Actual Share
        </div>
      </div>
    </div>
  )
}
