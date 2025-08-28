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
  LabelList,
} from "recharts";
import { OverallWeeklyMetrics } from "@/hooks/useOverallData";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

interface OverallMetricLineChartProps {
  data: OverallWeeklyMetrics[];
  metric: "appts_ocd" | "cpa";
  title: string;
  currentWeek: number;
  chartHeight?: number;
}

type ChartRow = {
  week: number;
  actual: number | null;
  planned: number | null;
  isPast: boolean;
};

function arraysEqual(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export const OverallMetricLineChart = ({
  data,
  metric,
  title,
  currentWeek,
  chartHeight = 256,
}: OverallMetricLineChartProps) => {
  const chartData: ChartRow[] = useMemo(() => {
    const rows: ChartRow[] = [];
    for (let i = currentWeek - 6; i <= currentWeek + 2; i++) {
      const weekData = data.find((d) => d.week_num === i);
      const isPastWeek = i <= currentWeek;

      let actualValue: number | null = null;
      let plannedValue: number | null = null;
      let actualCosts: number | null = null;
      let plannedCosts: number | null = null;

      if (weekData) {
        if (metric === "appts_ocd") {
          actualValue = isPastWeek ? weekData.appts_ocd_actual : null;
          plannedValue = weekData.appts_ocd_bizplan;
        } else {
          actualCosts = isPastWeek ? weekData.costs_actual : null;
          actualValue = Math.round(actualCosts  > 0 ? actualCosts  / weekData.appts_ocd_actual  : 0);
          plannedCosts = weekData.costs_bizplan;
          plannedValue = Math.round(plannedCosts > 0 ? plannedCosts / weekData.appts_ocd_bizplan : 0);
        }
      }

      rows.push({
        week: i,
        actual: actualValue,
        planned: plannedValue,
        isPast: isPastWeek,
      });
    }
    return rows;
  }, [data, metric, currentWeek]);

  const defaultWeeks = useMemo(() => chartData.map((d) => d.week), [chartData]);

  const [visibleWeeks, setVisibleWeeks] = useState<number[]>([]);
  useEffect(() => {
    setVisibleWeeks((prev) => (arraysEqual(prev, defaultWeeks) ? prev : defaultWeeks));
  }, [defaultWeeks]);

  const filteredData = useMemo(
    () => chartData.filter((d) => visibleWeeks.includes(d.week)),
    [chartData, visibleWeeks]
  );

  const formatValue = (value: number) => {
    if (value == null) return "";
    const formatted = value.toLocaleString("en-US");
    return metric === "appts_ocd" ? formatted : `$${formatted}`;
  };

  return (
    <div className="p-6 mt-4">
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
                    onCheckedChange={(checked) => {
                      setVisibleWeeks((v) =>
                        checked ? [...v, d.week] : v.filter((w) => w !== d.week)
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

      <div style={{ height: chartHeight }}>
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
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => formatValue(v as number)}
            />
            <Tooltip
              formatter={(value: any, name: string) => [
                value != null ? formatValue(value) : "No data",
                name === "planned" ? "Bizplan" : "Actual",
              ]}
              labelFormatter={(label) => `Week ${label}`}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                color: "hsl(var(--popover-foreground))",
              }}
            />

            {/* dashed marker at current week */}
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

      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-chart-planned rounded" />
          <span className="text-sm text-muted-foreground">Bizplan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-chart-actual rounded" />
          <span className="text-sm text-muted-foreground">Actual</span>
        </div>
      </div>
    </div>
  );
};
