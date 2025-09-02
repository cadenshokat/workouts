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
import { WeeklyMetrics } from "@/hooks/usePartnerData";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

interface MetricLineChartProps {
  data: WeeklyMetrics[];
  metric: "appts" | "cpl" | "cpa";
  title: string;
  currentWeek: number;
  chartHeight?: number;
}

type MetricMap = {
  [K in MetricLineChartProps["metric"]]: {
    actualKey: keyof WeeklyMetrics;
    plannedKey: keyof WeeklyMetrics;
  };
};

const METRIC_MAP: MetricMap = {
  appts: { actualKey: "appts_ocd_actual", plannedKey: "appts_ocd_bizplan" },
  cpl:   { actualKey: "cpl_actual",       plannedKey: "cpl_bizplan" },
  cpa:   { actualKey: "cpa_actual",       plannedKey: "cpa_bizplan" },
};

export const MetricLineChart: React.FC<MetricLineChartProps> = ({
  data,
  metric,
  title,
  currentWeek,
  chartHeight = 320,
}) => {
  const { actualKey, plannedKey } = METRIC_MAP[metric];

  const chartData = useMemo(() => {
    const arr: { week: number; actual: number | null; planned: number | null }[] = [];
    for (let w = currentWeek - 4; w <= currentWeek + 4; w++) {
      const row = data.find((d) => d.week_num === w);

      let actual: number | null = null;
      let planned: number | null = null;
      
      if (row) {
        if (w === currentWeek) {
          actual = 0;
          planned = row[plannedKey] as number;
        } else {
          actual = w < currentWeek ? (row[actualKey] as number) : null;
          planned = row[plannedKey] as number;
        }
      }

      arr.push({ week: w, actual, planned });
    }
    return arr;
  }, [data, actualKey, plannedKey, currentWeek]);

  const [visibleWeeks, setVisibleWeeks] = useState<number[]>([]);
  useEffect(() => {
    setVisibleWeeks(chartData.map((d) => d.week));
  }, [chartData]);

  const filteredData = chartData.filter((d) => visibleWeeks.includes(d.week));

  const formatValue = (value?: number | null) => {
    if (value == null) return "";
    const formatted = value.toLocaleString("en-US");
    return metric === "appts" ? formatted : `$${formatted}`;
  };

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
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
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

            {/* vertical dashed line for the current week */}
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
          Bizplan
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-chart-actual rounded-full" />
          Actual
        </div>
      </div>
    </div>
  );
};
