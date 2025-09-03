import React, { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LabelList,
  Cell,
  CartesianGrid
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
import { getISOWeek } from "@/lib/iso-week";

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
    actualKey: "appts_ocd_actual",
    plannedKey: "appts_ocd_bizplan",
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

    const realIsoWeek = getISOWeek(new Date());
    const realCurrentWorkoutWeek = realIsoWeek % 2 === 0 ? realIsoWeek : realIsoWeek === 53 ? 52 : realIsoWeek + 1;

    for (let w = currentWeek - 4; w <= currentWeek + 4; w++) {
      const row = data.find((d) => d.week_num === w);

      let actual: number | null = null;
      let planned: number | null = null;

      if (row) {
        planned = row[plannedKey] as number;

        if (w < realCurrentWorkoutWeek) {
          actual = row[actualKey] as number;
        } else if (w === realCurrentWorkoutWeek) {
          actual = 0; 
        } else {
          actual = null;
        }
      }

      arr.push({ week: w, actual, planned });
      }
    return arr;
  }, [data, actualKey, plannedKey, currentWeek]);

  const [visibleWeeks, setVisibleWeeks] = useState<number[]>([]);
  
  useEffect(() => {
    setVisibleWeeks(chartData.map(d => d.week));
  }, [chartData]);

  const filteredData = chartData.filter(d => visibleWeeks.includes(d.week));

  const realIsoWeek = getISOWeek(new Date());
  const fixedCurrentWeek =
    realIsoWeek % 2 === 0 ? realIsoWeek : realIsoWeek === 53 ? 52 : realIsoWeek + 1;


  const formatValue = (value: number) => {
    if (value == null || value == 0) return "";
    const formatted = value.toLocaleString("en-US");
    return metric === "appts"
      ? formatted
      : `$${formatted}`;
   };

  return (
    <div className="">
      <div className="relative flex items-center">
        <h3 className="text-lg font-semibold mx-auto my-3 text-foreground">
          {title}
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
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid
              stroke="hsl(var(--muted-foreground))"
              vertical={false}
              strokeOpacity={0.8}
              strokeWidth={.2}
              strokeDasharray="3 3"
            />
            <XAxis 
              dataKey="week" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
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
              {filteredData.map(d => (
                <Cell
                  key={`planned-${d.week}`}
                  strokeDasharray={d.week === fixedCurrentWeek ? "3 3" : undefined}
                  stroke={d.week === fixedCurrentWeek ? "#1e3a8a" : undefined}
                  fill={d.week === fixedCurrentWeek ? "transparent" : "hsl(var(--chart-planned))"}
                />
              ))}
              <LabelList dataKey="planned" position="top" stroke="" formatter={(value) => formatValue(value)} style={{ fill: "#333", fontSize: 11 }} />
            </Bar>
            <Bar 
              dataKey="actual" 
              fill="hsl(var(--chart-actual))" 
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            >
              <LabelList dataKey="actual" position="top" formatter={(value) => formatValue(value)} style={{ fill: "#333", fontSize: 11 }} />
            </Bar>
          </BarChart>
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
