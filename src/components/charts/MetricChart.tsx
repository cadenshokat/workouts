import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts";
import { WeeklyMetrics } from "@/hooks/usePartnerData";

interface MetricChartProps {
  data: WeeklyMetrics[];
  metric: "appts" | "cpl" | "cpa";
  title: string;
  currentWeek: number;
}

type MetricMap = {
  [K in MetricChartProps["metric"]]: {
    actualKey: keyof WeeklyMetrics;
    plannedKey: keyof WeeklyMetrics;
    format: (n: number) => string;
  };
};

const METRIC_MAP: MetricMap = {
  appts: {
    actualKey: "appts_lcd_actual",
    plannedKey: "appts_lcd_bizplan",
    format: (n) => `${n}`,
  },
  cpl: {
    actualKey: "cpl_actual",
    plannedKey: "cpl_bizplan",
    format: (n) => `$${n}`,
  },
  cpa: {
    actualKey: "cpa_actual",
    plannedKey: "cpa_bizplan",
    format: (n) => `$${n}`,
  },
};

export const MetricChart: React.FC<MetricChartProps> = ({
  data,
  metric,
  title,
  currentWeek,
}) => {
  const { actualKey, plannedKey, format } = METRIC_MAP[metric];

  const chartData = useMemo(() => {
    const arr: {
      week: number;
      actual: number | null;
      planned: number | null;
    }[] = [];

    for (let w = currentWeek - 10; w <= currentWeek + 0; w++) {
      const row = data.find((d) => d.week_num === w);
      arr.push({
        week: w,
        actual: row && w <= currentWeek ? (row[actualKey] as number) : null,
        planned: row ? (row[plannedKey] as number) : null,
      });
    }
    return arr;
  }, [data, actualKey, plannedKey, currentWeek]);

  const formatValue = (value: number) => {
    if (value == null) return "";
    const formatted = value.toLocaleString("en-US");
    return metric === "appts"
      ? formatted
      : `$${formatted}`;
   };

  return (
    <div className="bg-card rounded-lg border">
      <h3 className="text-lg font-semibold text-center my-4 text-foreground">
        {title}
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <XAxis 
              dataKey="week" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={formatValue}
            />
           <Tooltip
              formatter={(value: any, name: string) => [
                value ? formatValue(value) : 'No data',
                name === 'planned' ? 'Bizplan' : 'Actual'
              ]}
              labelFormatter={(label) => `Week ${label}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--popover-foreground))'
              }}
            />
            <Bar 
              dataKey="planned" 
              fill="hsl(var(--chart-planned))" 
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            >
              <LabelList dataKey="planned" position="top" formatter={(value) => formatValue(value)} style={{ fill: "#333", fontSize: 12 }} />
            </Bar>
            <Bar 
              dataKey="actual" 
              fill="hsl(var(--chart-actual))" 
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            >
              <LabelList dataKey="actual" position="top" formatter={(value) => formatValue(value)} style={{ fill: "#333", fontSize: 12 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 my-4 text-sm text-muted-foreground">
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
