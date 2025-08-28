import React, { useMemo } from "react";
import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { OverallWeeklyMetrics } from "@/hooks/useOverallData";

interface CostsLineChartProps {
  data: OverallWeeklyMetrics[] | undefined;
  title?: string; // optional, if you want to render a header elsewhere
}

const currency = (n: number) =>
  `$${Math.round(n).toLocaleString()}`;

export const CostsLineChart: React.FC<CostsLineChartProps> = ({ data }) => {
  const trendData = useMemo(() => {
    if (!data) return [];
    return data.map((w) => ({
      week: `W${w.week_num}`,
      costsActual: w.costs_actual ?? 0,
      costsPlan: w.costs_bizplan ?? 0,
    }));
  }, [data]);

  return (
    <ChartContainer
      config={{
        costsActual: { label: "Actual", color: "hsl(var(--primary))" },
        costsPlan: { label: "Plan", color: "hsl(var(--secondary))" },
      }}
      className="h-80 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis tickFormatter={(v) => `$${Math.round(v).toLocaleString()}`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="costsActual"
            stroke="var(--color-costsActual)"
            strokeWidth={2}
            name="Actual"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="costsPlan"
            stroke="var(--color-costsPlan)"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Plan"
            dot={false}
          />
        </RLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
