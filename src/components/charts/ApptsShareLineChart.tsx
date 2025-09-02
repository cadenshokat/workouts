import React, { useMemo, useState, useEffect } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
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
import type { OverallWeeklyMetrics } from "@/hooks/useOverallData";

interface ApptsShareLineProps {
  partnerMetrics: WeeklyMetrics[];
  allMetrics: OverallWeeklyMetrics[];
  currentWeek: number;
  title?: string;
  chartHeight?: number;
}

const safeShare = (
  part: number | null | undefined,
  total: number | null | undefined
) => {
  if (part == null) return 0;
  if (total == null || total === 0) return null;
  const v = part / total;
  return Number.isFinite(v) ? v : null;
};

export const ApptsShareLine: React.FC<ApptsShareLineProps> = ({
  partnerMetrics,
  allMetrics,
  currentWeek,
  title = "APPTS SHARE",
  chartHeight = 320,
}) => {
  const chartData = useMemo(() => {
    const rows: { week: number; actual: number | null; planned: number | null }[] = [];
    for (let w = currentWeek - 4; w <= currentWeek + 4; w++) {
      const p = partnerMetrics.find((d) => d.week_num === w);
      const t = allMetrics.find((d) => d.week_num === w);

      const partActual = p?.appts_ocd_actual ?? null;
      const totalActual = t?.appts_ocd_actual ?? null;
      const partBizplan = p?.appts_ocd_bizplan ?? null;
      const totalBizplan = t?.appts_ocd_bizplan ?? null;

      rows.push({
        week: w,
        actual: safeShare(partActual, totalActual),
        planned: safeShare(partBizplan, totalBizplan),
      });
    }
    return rows;
  }, [partnerMetrics, allMetrics, currentWeek]);

  const [visibleWeeks, setVisibleWeeks] = useState<number[]>([]);
  useEffect(() => {
    setVisibleWeeks(chartData.map((d) => d.week));
  }, [chartData]);

  const filteredData = useMemo(
    () => chartData.filter((d) => visibleWeeks.includes(d.week)),
    [chartData, visibleWeeks]
  );

  const fmtPct = (v?: number | null) =>
    v == null ? "" : `${(v * 100).toFixed(1)}%`;

  const yMax = Math.min(
    1,
    Math.max(
      0.05,
      filteredData.reduce((m, r) => Math.max(m, r.actual ?? 0, r.planned ?? 0), 0)
    ) * 1.2
  );

  return (
    <div>
      <div className="relative flex items-center">
        <h3 className="text-lg font-semibold mx-auto my-3 text-foreground">{title}</h3>
        <div className="absolute right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 space-y-1">
              {chartData.map((d) => (
                <label key={d.week} className="flex items-center gap-2">
                  <Checkbox
                    className="h-4 w-4 rounded-none"
                    checked={visibleWeeks.includes(d.week)}
                    onCheckedChange={(checked) =>
                      setVisibleWeeks((v) =>
                        checked ? [...v, d.week] : v.filter((w) => w !== d.week)
                      )
                    }
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
          <RechartsLineChart
            data={filteredData}
            margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              stroke="hsl(var(--muted-foreground))"
              vertical={false}
              strokeOpacity={0.8}
              strokeWidth={0.2}
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              domain={[0, yMax]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => fmtPct(v as number)}
            />
            <Tooltip
              formatter={(value: any, name: string) => [
                value != null ? fmtPct(value as number) : "No data",
                name === "planned" ? "Bizplan Share" : "Actual Share",
              ]}
              labelFormatter={(label) => `Week ${label}`}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                color: "hsl(var(--popover-foreground))",
              }}
            />

            {/* dashed vertical line at the current week */}
            <ReferenceLine
              x={currentWeek}
              stroke="#1e3a8a"
              strokeDasharray="3 3"
              ifOverflow="extendDomain"
            />

            <Line
              type="monotone"
              dataKey="planned"
              stroke="hsl(var(--chart-planned))"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
              name="planned"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(var(--chart-actual))"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
              name="actual"
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 my-2 text-sm text-muted-foreground">
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
  );
};
